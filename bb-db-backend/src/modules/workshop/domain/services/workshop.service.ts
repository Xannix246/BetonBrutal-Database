/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { SteamApiService } from 'src/modules/data-requester/application/adapters/http-steam-api';
import { FetchItemUseCase } from 'src/modules/data-requester/application/use-cases/fetch-item.usecase';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class WorkshopService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fetchItems: FetchItemUseCase,
    private readonly steamApi: SteamApiService,
  ) {}

  async getTotal(): Promise<number> {
    return await this.steamApi.getTotal();
  }

  async getList(
    sortBy: SortBy,
    quantity: number,
    sendPreviews: boolean = false,
    timeRange?: 'day' | 'week' | 'month' | 'year',
    page: number = 1,
  ): Promise<WorkshopItemHeader[]> {
    let orderBy;

    switch (sortBy) {
      case 'mostPopular':
        orderBy = { ratingUp: 'desc' };
        break;
      case 'newest':
        orderBy = { createDate: 'desc' };
        break;
      case 'oldest':
        orderBy = { createDate: 'asc' };
        break;
      //   case 'mostPlayed':
      //     orderBy = { ratingUp: 'desc' };
      //     break;
      default:
        orderBy = { createDate: 'desc' };
    }

    let dateFilter: Date | undefined;
    const now = new Date();

    if (timeRange) {
      switch (timeRange) {
        case 'day':
          dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          dateFilter = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          dateFilter = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }
    }

    const where = dateFilter ? { createDate: { gte: dateFilter } } : undefined;

    const items = await this.prisma.workshopItem.findMany({
      take: quantity,
      skip: (page - 1) * quantity,
      orderBy,
      where,
    });

    const returnItems: WorkshopItemHeader[] = [];

    for (const item of items) {
      returnItems.push({
        id: item.steamId,
        title: item.title,
        creator: (
          await this.prisma.steamUser.findUnique({
            where: { steamId: item.creatorId },
          })
        )?.username as string,
        createDate: item.createDate,
        ratingUp: item.ratingUp,
        ratingDown: item.ratingDown,
        previewUrl: item.previewUrl,
        previews: sendPreviews ? item.previews : [],
      });
    }

    return returnItems;
  }

  async getItem(id: string): Promise<WorkshopItem> {
    let item = await this.prisma.workshopItem.findUnique({
      where: { steamId: id },
    });

    if (!item) {
      item = await this.fetchItems.execute(id);
    }

    return {
      id: item.steamId,
      title: item.title,
      description: (await this.fetchItems.execute(item.steamId)).description,
      steamId: item.steamId,
      creator: (
        await this.prisma.steamUser.findUnique({
          where: { steamId: item.creatorId },
        })
      )?.username as string,
      creatorId: item.creatorId,
      createDate: item.createDate,
      ratingUp: item.ratingUp,
      ratingDown: item.ratingDown,
      previewUrl: item.previewUrl,
      previews: item.previews,
    };
  }

  async getReplays(workshopItemId: string): Promise<Replay[]> {
    const replays = await this.prisma.replay.findMany({
      where: { mapId: workshopItemId },
      orderBy: { score: 'desc' },
    });

    const returnReplays: Replay[] = [];

    for (const replay of replays) {
      returnReplays.push({
        id: replay.id,
        creator: (await this.prisma.steamUser.findUnique({
          where: { steamId: replay.creatorId },
        }))!.username,
        creatorId: replay.creatorId,
        mapId: replay.mapId,
        score: replay.score,
        date: replay.date,
      });
    }

    return returnReplays;
  }
}
