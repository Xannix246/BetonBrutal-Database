import { BadRequestException, Injectable } from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { ObjectId } from 'mongodb';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCollections(onlyMain: boolean = false): Promise<Collection[]> {
    const collections: Collection[] = await this.prisma.collection.findMany({});

    if (onlyMain) {
      return collections.filter((collection) => collection.showOnMain);
    }

    return collections;
  }

  async createCollection(
    title: string,
    description?: string,
    mapsId: string[] = [],
    showOnMain: boolean = false,
    descColor: $Enums.Color = 'black',
  ): Promise<Collection> {
    if (!title) {
      throw new BadRequestException('Title is required');
    }

    const collection = await this.prisma.collection.create({
      data: {
        title,
        description,
        mapsId,
        showOnMain,
        descColor,
      },
    });

    return collection;
  }

  async updateCollection(
    id: string,
    title?: string,
    description?: string,
    mapsId?: string | string[],
    showOnMain?: boolean,
    descColor?: $Enums.Color,
  ): Promise<Collection> {
    if (!id) {
      throw new BadRequestException('ID is required');
    }

    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const collection = await this.prisma.collection.findUniqueOrThrow({
      where: { id },
    });

    const updatedCollection = await this.prisma.collection.update({
      where: { id },
      data: {
        title,
        description,
        mapsId: mapsId
          ? typeof mapsId === 'string'
            ? [...collection.mapsId, mapsId]
            : [...collection.mapsId, ...mapsId]
          : mapsId === undefined
            ? collection.mapsId
            : [],
        showOnMain,
        descColor,
      },
    });

    return updatedCollection;
  }

  async deleteCollection(id: string): Promise<string> {
    if (!id) {
      throw new BadRequestException('ID is required');
    }

    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const collection = await this.prisma.collection.delete({
      where: { id },
    });

    return collection.id;
  }
}
