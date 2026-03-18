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
import { OptionalAuth } from '@thallesp/nestjs-better-auth';
import { CollectionDto } from './collections.dto';
import { CheckGuard } from '../guards/check.guard';
import { Roles } from 'src/modules/auth/guards/role.guard';

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
  async createCollection(@Body() body: CollectionDto): Promise<Collection> {
    if (!body.title) {
      throw new BadRequestException('Title is required');
    }

    return await this.collectionService.createCollection(
      body.title,
      body.description,
      body.mapsId,
      body.showOnMain,
      body.descColor,
      body.isPublic,
    );
  }

  // @Get(':id')
  // async getCollection(@Param('id') id: string) {}

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
}
