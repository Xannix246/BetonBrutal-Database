/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { SteamApiService } from 'src/modules/data-requester/application/adapters/http-steam-api';
import { FetchItemUseCase } from 'src/modules/data-requester/application/use-cases/fetch-item.usecase';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { WebsocketGateway } from 'src/modules/websocket/presentation/websocket.gateway';
import { parseSearchInput } from 'src/shared/parseSearchUriData';

@Injectable()
export class WorkshopService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fetchItems: FetchItemUseCase,
    private readonly steamApi: SteamApiService,
    private readonly websocket: WebsocketGateway,
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

  async getRandomItem(): Promise<string> {
    const max = await this.getTotal();
    const pos = Math.floor(Math.random() * max);

    const ids = await this.prisma.workshopItem.findMany({
      select: {
        steamId: true,
      },
    });

    return ids[pos].steamId;
  }

  async getItem(id: string): Promise<WorkshopItem | null> {
    let item = await this.prisma.workshopItem.findUnique({
      where: { steamId: id },
    });

    if (!item) {
      item = await this.fetchItems.execute(id);
    }

    if (item) {
      await this.websocket.sendRequest({
        type: 'fetch_by_id',
        mapId: item.steamId,
      });

      return {
        id: item.steamId,
        title: item.title,
        description: (await this.fetchItems.execute(item.steamId))!.description,
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
    } else {
      return null;
    }
  }

  async getQueryItems(
    ids: string[],
    sendPreviews: boolean = false,
  ): Promise<WorkshopItemHeader[]> {
    const items = await this.prisma.workshopItem.findMany({
      where: { steamId: { in: ids } },
      orderBy: { createDate: 'desc' },
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

  async getPlayer(id: string): Promise<Player | null> {
    const player = await this.prisma.steamUser.findUnique({
      where: { steamId: id },
    });

    if (player) {
      return {
        id: player.steamId,
        username: player.username,
        items: player.items || [],
        replays: player.replays || [],
      };
    } else {
      return null;
    }
  }

  async getQueryReplays(
    ids: string[],
    requestMapNames: boolean = false,
  ): Promise<Replay[]> {
    const replays = await this.prisma.leaderboardEntry.findMany({
      where: { id: { in: ids } },
      orderBy: { score: 'desc' },
    });

    const returnReplays: Replay[] = [];

    for (const replay of replays) {
      let mapName = '';
      if (requestMapNames) {
        mapName =
          (
            await this.prisma.workshopItem.findUnique({
              where: { steamId: replay.mapId },
            })
          )?.title || 'unknown';
      }

      returnReplays.push({
        id: replay.id,
        place: replay.place,
        creator: replay.username,
        creatorId: replay.steamId,
        mapId: replay.mapId,
        map: mapName,
        score: replay.score,
        date: replay.date,
      });
    }

    return returnReplays;
  }

  async getLeaderboard(workshopItemId: string): Promise<Leaderboard | null> {
    const leaderboard = await this.prisma.leaderboard.findUnique({
      where: { mapId: workshopItemId },
    });

    if (leaderboard) {
      return {
        id: leaderboard?.id,
        mapId: leaderboard?.mapId,
        enteries: leaderboard?.enteries,
      };
    } else {
      return null;
    }
  }

  async searchWorkshopItems(input: string) {
    const parsed = parseSearchInput(input);

    if (parsed.id) {
      return this.prisma.workshopItem.findMany({
        where: { steamId: parsed.id },
      });
    }

    return this.prisma.workshopItem.findMany({
      where: {
        OR: [
          { title: { contains: parsed.text, mode: 'insensitive' } },
          {
            creator: {
              contains: parsed.text,
              mode: 'insensitive',
            },
          },
        ],
      },
      take: 50,
    });
  }

  async deleteItem(id: string): Promise<void> {
    const isIdObject = ObjectId.isValid(id);

    if (isIdObject) {
      await this.prisma.workshopItem.delete({
        where: { id },
      });
    } else {
      await this.prisma.workshopItem.delete({
        where: { steamId: id },
      });
    }
  }
}
