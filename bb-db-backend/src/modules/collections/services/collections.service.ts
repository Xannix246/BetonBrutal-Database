import { Injectable, NotFoundException } from '@nestjs/common';
import { $Enums, CollectionStats, Vote } from '@prisma/client';
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

      await this.prisma.workshopItem.update({
        where: { linkedCollection: data.collectionId },
        data: {
          ratingUp: totalVotesUp,
          ratingDown: totalVotesDown,
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
  ): Promise<Vote> {
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

    return (await this.getVote(collectionId, userId)) as Vote;
  }

  async getVote(collectionId: string, userId: string): Promise<Vote | null> {
    const statId = (
      await this.prisma.collectionStats.findUnique({
        where: { collectionId },
      })
    )?.id;

    if (!statId) {
      throw new NotFoundException('CollectionStat not found');
    }

    return this.prisma.vote.findUnique({
      where: { userId_statId: { statId, userId } },
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
        isHidden: !isPublic,
      },
    });

    await this.updateMapRelatedStats(collection.id, collection.mapsId);

    return collection;
  }

  async updateCollection(
    id: string,
    title?: string,
    description?: string,
    mapsId?: string[],
    showOnMain?: boolean,
    descColor?: $Enums.Color,
    isPublic?: boolean,
    previewUrl?: string,
  ): Promise<Collection> {
    const collection = await this.prisma.collection.findUniqueOrThrow({
      where: { id },
    });

    const updatedCollection = await this.prisma.collection.update({
      where: { id },
      data: {
        title,
        description,
        // mapsId: mapsId
        //   ? typeof mapsId === 'string'
        //     ? [...new Set([...collection.mapsId, mapsId])]
        //     : [...new Set([...collection.mapsId, ...mapsId])]
        //   : mapsId === undefined
        //     ? collection.mapsId
        //     : [],
        mapsId,
        showOnMain,
        descColor,
        previewUrl,
        isPublic: isPublic === undefined ? collection.isPublic : isPublic,
      },
    });

    const item = await this.prisma.workshopItem.findUnique({
      where: { linkedCollection: updatedCollection.id },
    });

    if (item) {
      await this.workshop.upsertItem(id, {
        type: 'WorkshopItemUpdate',
        data: {
          title: updatedCollection.title,
          previewUrl: updatedCollection.previewUrl || '',
          description: updatedCollection.description || 'No description',
        },
      });
    } else {
      await this.workshop.upsertItem(collection.id, {
        type: 'WorkshopItemCreate',
        data: {
          title: collection.title,
          description: collection.description || 'No description',
          previewUrl: collection.previewUrl || '',
          creator: collection.authorId ?? 'unknown',
          creatorId: collection.authorId ?? '',
          tags: ['Collection'],
          createDate: new Date(),
          linkedCollection: collection.id,
          isHidden: !isPublic,
        },
      });
    }

    await this.updateMapRelatedStats(id, updatedCollection.mapsId);

    return updatedCollection;
  }

  async deleteCollection(id: string): Promise<string> {
    const stats = await this.prisma.collectionStats.delete({
      where: { collectionId: id },
    });

    await this.workshop.deleteItem(id);

    return stats.collectionId;
  }
}
