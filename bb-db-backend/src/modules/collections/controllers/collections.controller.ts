import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CollectionsService } from '../services/collections.service';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';
import { env } from 'process';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { CollectionDto } from './collections.dto';

@Controller('collections')
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
  @OptionalAuth()
  @ApiExcludeEndpoint()
  async createCollection(@Body() body: CollectionDto): Promise<Collection> {
    if (body.secret !== env.FORCE_UPDATE_SECRET) {
      throw new ForbiddenException('Invalid secret');
    }

    if (!body.title) {
      throw new BadRequestException('Title is required');
    }

    return await this.collectionService.createCollection(
      body.title,
      body.description,
      body.mapsId,
      body.showOnMain,
      body.descColor,
    );
  }

  @Post('update')
  @OptionalAuth()
  @ApiExcludeEndpoint()
  async updateCollection(@Body() body: CollectionDto): Promise<Collection> {
    if (body.secret !== env.FORCE_UPDATE_SECRET) {
      throw new ForbiddenException('Invalid secret');
    }

    if (!body.id) {
      throw new BadRequestException('ID is required');
    }

    return await this.collectionService.updateCollection(
      body.id,
      body.title,
      body.description,
      body.mapsId,
      body.showOnMain,
      body.descColor,
    );
  }

  @Delete('delete')
  @OptionalAuth()
  @ApiExcludeEndpoint()
  async deleteCollection(
    @Param('id') id: string,
    @Body() body: { secret: string },
  ) {
    if (body.secret !== env.FORCE_UPDATE_SECRET) {
      throw new ForbiddenException('Invalid secret');
    }

    return await this.collectionService.deleteCollection(id);
  }
}
