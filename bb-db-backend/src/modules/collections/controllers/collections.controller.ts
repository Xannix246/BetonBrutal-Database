import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CollectionsService } from '../services/collections.service';
import { OptionalAuth, Session } from '@thallesp/nestjs-better-auth';
import { CollectionDto } from './collections.dto';
import { CheckGuard } from '../guards/check.guard';
import { Roles } from 'src/modules/auth/guards/role.guard';
import { type UserRoleSession } from 'src/modules/auth/auth.module';

@Controller('collections')
@Roles('admin', 'moderator')
export class CollectionsConrtroller {
  constructor(private readonly collectionService: CollectionsService) {}

  @Get('get')
  @OptionalAuth()
  async GetCollections(
    @Query('forMain') forMain: boolean,
  ): Promise<Collection[]> {
    return this.collectionService.getCollections(forMain);
  }

  @Post('create')
  async createCollection(
    @Body() body: CollectionDto,
    @Session() session: UserRoleSession,
  ): Promise<Collection> {
    if (!body.title) {
      throw new BadRequestException('Title is required');
    }

    return this.collectionService.createCollection(
      session,
      body.title,
      body.description,
      body.mapsId,
      body.showOnMain,
      body.descColor,
      body.isPublic,
    );
  }

  @Get(':id/stats')
  async getStats(@Param('id') id: string) {
    return this.collectionService.getStats(id);
  }

  @Post(':id/vote')
  async collectionVote(
    @Param('id') id: string,
    @Session() session: UserRoleSession,
    @Body() body: { vote: 'upvote' | 'downvote' | 'neutral' },
  ) {
    return this.collectionService.vote(id, session.user.id, body.vote);
  }

  @Put(':id/update')
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
    );
  }

  @Delete(':id/delete')
  @UseGuards(CheckGuard)
  async deleteCollection(@Param('id') id: string) {
    return await this.collectionService.deleteCollection(id);
  }

  @Get(':id')
  async getCollection(@Param('id') id: string) {
    return await this.collectionService.getCollection(id);
  }
}
