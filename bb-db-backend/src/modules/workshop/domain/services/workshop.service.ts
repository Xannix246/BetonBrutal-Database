import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    let orderBy: {
      ratingUp?: 'asc' | 'desc';
      createDate?: 'asc' | 'desc';
    };

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
      this.websocket.sendRequest({
        type: 'fetch_by_id',
        mapId: item.steamId,
      });

      const fetchedItem = await this.fetchItems.execute(item.steamId);
      const description = fetchedItem
        ? fetchedItem.description
        : 'Seems like steam workshop service is down...';

      return {
        id: item.steamId,
        title: item.title,
        description: description,
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
    hideBanned = true,
  ): Promise<Replay[]> {
    const replays = await this.prisma.leaderboardEntry.findMany({
      where: { id: { in: ids } },
      orderBy: { score: 'desc' },
    });

    const returnReplays: Replay[] = [];

    for (const replay of replays) {
      if (hideBanned && replay.banned) continue;

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

  async deleteItem(steamId: string): Promise<void> {
    const entries = await this.prisma.leaderboardEntry.findMany({
      where: { mapId: steamId },
    });

    for (const entry of entries) {
      await this.prisma.$transaction(async (prisma) => {
        const users = await prisma.steamUser.findMany({
          where: { replays: { has: entry.id } },
          select: { id: true, replays: true },
        });

        for (const user of users) {
          await prisma.steamUser.updateMany({
            where: {
              replays: { has: entry.id },
            },
            data: {
              replays: [...new Set(user.replays.filter((r) => r !== entry.id))],
            },
          });
        }
      });
    }

    await this.prisma.workshopItem.delete({ where: { steamId } });
    await this.prisma.leaderboard.delete({ where: { mapId: steamId } });
    await this.prisma.leaderboardEntry.deleteMany({
      where: { mapId: steamId },
    });
  }

  async banOrDeleteLeaderboardEntry(
    id: string,
    deleteEntry = false,
  ): Promise<void> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }

    const leaderboardEntry = await this.prisma.leaderboardEntry.findUnique({
      where: { id },
    });

    if (!leaderboardEntry) {
      throw new NotFoundException('Entry not found');
    }

    await this.prisma.$transaction(async (prisma) => {
      const leaderboard = await prisma.leaderboard.findUniqueOrThrow({
        where: { mapId: leaderboardEntry.mapId },
      });
      const updatedEntries: string[] = [];

      if (deleteEntry) {
        const lb = await prisma.leaderboard.update({
          where: { mapId: leaderboardEntry.mapId },
          data: {
            enteries: leaderboard?.enteries.filter(
              (e) => e !== leaderboardEntry.id,
            ),
          },
        });

        await prisma.leaderboardEntry.delete({ where: { id } });
        updatedEntries.push(...lb.enteries);
      } else {
        await prisma.leaderboardEntry.update({
          where: { id },
          data: {
            banned: true,
          },
        });

        updatedEntries.push(...leaderboard.enteries.filter((e) => e !== id));
      }

      const entries = await prisma.leaderboardEntry.findMany({
        where: {
          id: { in: updatedEntries },
          banned: false,
        },
        orderBy: { score: 'asc' },
      });

      await Promise.all(
        entries.map((entry, index) =>
          prisma.leaderboardEntry.update({
            where: { id: entry.id },
            data: { place: index + 1 },
          }),
        ),
      );
    });
  }

  async unbanReplay(id: string): Promise<void> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }

    const leaderboardEntry = await this.prisma.leaderboardEntry.findUnique({
      where: { id },
    });

    if (!leaderboardEntry) {
      throw new NotFoundException('Entry not found');
    }

    if (!leaderboardEntry.banned) {
      throw new BadRequestException('Entry not banned');
    }

    await this.prisma.$transaction(async (prisma) => {
      const leaderboard = await prisma.leaderboard.findUniqueOrThrow({
        where: { mapId: leaderboardEntry.mapId },
      });

      const entries = await prisma.leaderboardEntry.findMany({
        where: {
          id: { in: leaderboard.enteries },
          banned: false,
        },
      });

      entries.push({ ...leaderboardEntry, banned: false });
      entries.sort((a, b) => a.score - b.score);

      await Promise.all(
        entries.map((entry, index) =>
          prisma.leaderboardEntry.update({
            where: { id: entry.id },
            data: { place: index + 1 },
          }),
        ),
      );
    });
  }
}
