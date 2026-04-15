import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CollectionsService } from '../services/collections.service';
import { OptionalAuth, Session } from '@thallesp/nestjs-better-auth';
import { CollectionDto } from './collections.dto';
import { CheckGuard } from '../guards/check.guard';
import { Roles } from 'src/modules/auth/guards/role.guard';
import { type UserRoleSession } from 'src/modules/auth/auth.module';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { ImageFilePipe } from 'src/modules/storage/pipes/filetype.pipe';
import { GridFSService } from 'src/modules/storage/services/gridfs.service';
import { QuantityGuard } from '../guards/quantity.guard';
import { CollectionStats, Vote } from '@prisma/client';

@Controller('collections')
@Roles('admin', 'moderator')
export class CollectionsConrtroller {
  constructor(
    private readonly collectionService: CollectionsService,
    private readonly gridFs: GridFSService,
  ) {}

  @Get('get')
  @OptionalAuth()
  async GetCollections(
    @Query('forMain') forMain: boolean,
  ): Promise<Collection[]> {
    return this.collectionService.getCollections(forMain);
  }

  @Post('create')
  @UseGuards(QuantityGuard)
  async createCollection(
    @Body() body: CollectionDto,
    @Session() session: UserRoleSession,
  ): Promise<Collection> {
    if (!body.title) {
      throw new BadRequestException('Title is required');
    }

    if (!['admin', 'moderator'].includes(session.user.role!)) {
      body.showOnMain = false;
    }

    return this.collectionService.createCollection(
      session,
      body.title,
      body.description,
      body.mapsId,
      body.showOnMain,
      body.descColor,
      body.isPublic,
      body.previewUrl,
    );
  }

  @Get(':id/stats')
  @OptionalAuth()
  async getStats(@Param('id') id: string): Promise<CollectionStats | null> {
    return this.collectionService.getStats(id);
  }

  @Get(':id/vote')
  async getCollectionVote(
    @Param('id') id: string,
    @Session() session: UserRoleSession,
  ) {
    return this.collectionService.getVote(id, session.user.id);
  }

  @Post(':id/vote')
  async collectionVote(
    @Param('id') id: string,
    @Session() session: UserRoleSession,
    @Body() body: { vote: 'upvote' | 'downvote' | 'neutral' },
  ): Promise<Vote> {
    return this.collectionService.vote(id, session.user.id, body.vote);
  }

  @Post(':id/upload-preview')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(CheckGuard)
  async uploadCollectionFile(
    @UploadedFile(
      new ImageFilePipe(),
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
    @Session() session: UserRoleSession,
    @Param('id') id: string,
  ): Promise<string> {
    const imageUrl = await this.gridFs.uploadCollectionFile(
      session.user.id,
      id,
      file.buffer,
    );

    return imageUrl;
  }

  @Post(':id/update')
  @UseGuards(CheckGuard)
  async updateCollection(
    @Param('id') id: string,
    @Body() body: CollectionDto,
  ): Promise<Collection> {
    return await this.collectionService.updateCollection(
      id,
      body.title,
      body.description,
      body.mapsId,
      body.showOnMain,
      body.descColor,
      body.isPublic,
      body.previewUrl,
    );
  }

  @Delete(':id/delete')
  @UseGuards(CheckGuard)
  async deleteCollection(@Param('id') id: string): Promise<string> {
    return this.collectionService.deleteCollection(id);
  }

  @Get(':id')
  @OptionalAuth()
  async getCollection(@Param('id') id: string): Promise<Collection | null> {
    return this.collectionService.getCollection(id);
  }
}
