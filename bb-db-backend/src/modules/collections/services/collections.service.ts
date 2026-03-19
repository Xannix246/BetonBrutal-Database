import { Injectable } from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCollections(onlyMain: boolean = false): Promise<Collection[]> {
    const collections: Collection[] = await this.prisma.collection.findMany({
      where: { isPublic: true },
    });

    if (onlyMain) {
      return collections.filter((collection) => collection.showOnMain);
    }

    return collections;
  }

  async getCollection(id: string): Promise<Collection | null> {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
    });

    return collection;
  }

  async createCollection(
    title: string,
    description?: string,
    mapsId: string[] = [],
    showOnMain: boolean = false,
    descColor: $Enums.Color = 'black',
    isPublic: boolean = true,
  ): Promise<Collection> {
    const collection = await this.prisma.collection.create({
      data: {
        title,
        description,
        mapsId,
        showOnMain,
        descColor,
        isPublic,
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
    isPublic?: boolean,
  ): Promise<Collection> {
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
            ? [...new Set(...collection.mapsId, mapsId)]
            : [...new Set(...collection.mapsId, ...mapsId)]
          : mapsId === undefined
            ? collection.mapsId
            : [],
        showOnMain,
        descColor,
        isPublic: isPublic === undefined ? isPublic : collection.isPublic,
      },
    });

    return updatedCollection;
  }

  async deleteCollection(id: string): Promise<string> {
    const collection = await this.prisma.collection.delete({
      where: { id },
    });

    return collection.id;
  }
}
