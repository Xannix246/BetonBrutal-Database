import { Injectable, NotFoundException } from '@nestjs/common';
import { $Enums, CollectionStats } from '@prisma/client';
import { UserRoleSession } from 'src/modules/auth/auth.module';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { WorkshopService } from 'src/modules/workshop/domain/services/workshop.service';
import { assignDefined } from 'src/shared/assignDefined';

@Injectable()
export class CollectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workshop: WorkshopService,
  ) {}

  private async updateStats(data: {
    collectionId: string;
    totalMaps?: number;
    totalReplays?: number;
    votes?: { userId: string; type: $Enums.VoteType; statId: string }[];
  }): Promise<void> {
    const updateData = assignDefined({
      totalMaps: data.totalMaps,
      totalReplays: data.totalReplays,
    });

    console.log(updateData);

    const stats = await this.prisma.collectionStats.upsert({
      where: { collectionId: data.collectionId },
      create: {
        collectionId: data.collectionId,
        totalMaps: data.totalMaps ?? 0,
        totalVotesUp: 0,
        totalVotesDown: 0,
        totalReplays: data.totalReplays ?? 0,
      },
      update: updateData,
    });

    if (data.votes) {
      for (const vote of data.votes) {
        await this.prisma.vote.upsert({
          where: { userId_statId: { userId: vote.userId, statId: stats.id } },
          create: {
            userId: vote.userId,
            type: vote.type,
            statId: stats.id,
            date: new Date(),
          },
          update: {
            type: vote.type,
            date: new Date(),
          },
        });
      }

      const votes = await this.prisma.vote.findMany({
        where: { statId: stats.id },
      });

      const totalVotesUp = votes.filter(
        (vote) => vote.type === 'upvote',
      ).length;
      const totalVotesDown = votes.filter(
        (vote) => vote.type === 'downvote',
      ).length;

      await this.prisma.collectionStats.update({
        where: { collectionId: data.collectionId },
        data: {
          totalVotesUp,
          totalVotesDown,
        },
      });
    }
  }

  private async updateMapRelatedStats(collectionId: string, mapsId: string[]) {
    let totalReplays = 0;
    const leaderboards = await this.workshop.getQueryLeaderboards(mapsId);

    for (const leaderboard of leaderboards) {
      totalReplays += leaderboard.enteries.length;
    }

    await this.updateStats({
      collectionId,
      totalMaps: mapsId.length,
      totalReplays,
    });
  }

  async getStats(collectionId: string): Promise<CollectionStats | null> {
    return this.prisma.collectionStats.findUnique({
      where: { collectionId },
    });
  }

  async vote(
    collectionId: string,
    userId: string,
    vote: $Enums.VoteType,
  ): Promise<void> {
    const stat = await this.prisma.collectionStats.findUnique({
      where: { collectionId },
    });

    if (!stat) {
      throw new NotFoundException('Stat data not found');
    }

    await this.updateStats({
      collectionId,
      votes: [
        {
          userId,
          type: vote,
          statId: stat.id,
        },
      ],
    });
  }

  async getCollections(onlyMain: boolean = false): Promise<Collection[]> {
    const collections: Collection[] = await this.prisma.collection.findMany({
      where: {
        isPublic: true,
        ...(onlyMain && { showOnMain: true }),
      },
    });

    return collections;
  }

  async getCollection(id: string): Promise<Collection | null> {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
    });

    return collection;
  }

  async createCollection(
    session: UserRoleSession,
    title: string,
    description?: string,
    mapsId: string[] = [],
    showOnMain: boolean = false,
    descColor: $Enums.Color = 'black',
    isPublic: boolean = true,
    previewUrl?: string,
  ): Promise<Collection> {
    const collection = await this.prisma.collection.create({
      data: {
        title,
        description,
        mapsId,
        showOnMain,
        descColor,
        isPublic,
        previewUrl,
        authorId: session.user.id,
      },
    });

    await this.workshop.upsertItem(collection.id, {
      type: 'WorkshopItemCreate',
      data: {
        title: collection.title,
        description: collection.description || 'No description',
        previewUrl: collection.previewUrl || '',
        creator: session.user.name,
        creatorId: session.user.id,
        tags: ['Collection'],
        createDate: new Date(),
        linkedCollection: collection.id,
      },
    });

    await this.updateMapRelatedStats(collection.id, collection.mapsId);

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
            ? [...new Set([...collection.mapsId, mapsId])]
            : [...new Set([...collection.mapsId, ...mapsId])]
          : mapsId === undefined
            ? collection.mapsId
            : [],
        showOnMain,
        descColor,
        isPublic: isPublic === undefined ? collection.isPublic : isPublic,
      },
    });

    await this.workshop.upsertItem(id, {
      type: 'WorkshopItemUpdate',
      data: {
        title: updatedCollection.title,
        previewUrl: updatedCollection.previewUrl || '',
        description: updatedCollection.description || 'No description',
      },
    });

    await this.updateMapRelatedStats(id, updatedCollection.mapsId);

    return updatedCollection;
  }

  async deleteCollection(id: string): Promise<string> {
    const collection = await this.prisma.collection.delete({
      where: { id },
    });

    await this.workshop.deleteItem(id);

    return collection.id;
  }
}
