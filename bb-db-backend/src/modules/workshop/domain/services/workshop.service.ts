import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { ObjectId } from 'mongodb';
import { SteamApiService } from 'src/modules/data-requester/application/adapters/http-steam-api';
import { FetchItemUseCase } from 'src/modules/data-requester/application/use-cases/fetch-item.usecase';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { WebsocketGateway } from 'src/modules/websocket/presentation/websocket.gateway';
import { parseSearchInput } from 'src/shared/parseSearchUriData';

@Injectable()
export class WorkshopService {
  private readonly mainMaps = ['TimeMS', 'TimeDLC1', 'TimeBirthday'];

  constructor(
    private readonly prisma: PrismaService,
    private readonly fetchItems: FetchItemUseCase,
    private readonly steamApi: SteamApiService,
    private readonly websocket: WebsocketGateway,
    @InjectQueue('map-downloading') private readonly downloadQueue: Queue,
    @InjectQueue('request-map') private readonly reqQueue: Queue,
  ) {}

  async addDownloadQueue(id: string) {
    await this.downloadQueue.add(
      'download-map',
      { id },
      {
        removeOnComplete: true,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );
  }

  async addRequestQueue(id: string) {
    await this.reqQueue.add('update-map', { id });
  }

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

    let leaderboardsEntries: string[] | undefined;

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
      case 'mostPlayed':
        orderBy = {};
        leaderboardsEntries = (
          await this.prisma.leaderboard.findMany({
            take: quantity,
            skip: (page - 1) * quantity,
            orderBy: { playersCount: 'desc' },
            where: { mapId: { notIn: this.mainMaps } },
          })
        ).map((entry) => entry.mapId);
        break;
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

    const items = leaderboardsEntries
      ? await this.prisma.workshopItem.findMany({
          where: { steamId: { in: leaderboardsEntries } },
        })
      : await this.prisma.workshopItem.findMany({
          take: quantity,
          skip: (page - 1) * quantity,
          orderBy,
          where,
        });

    if (leaderboardsEntries) {
      const orderMap = new Map(
        leaderboardsEntries.map((id, index) => [id, index]),
      );

      items.sort(
        (a, b) =>
          (orderMap.get(a.steamId) ?? 0) - (orderMap.get(b.steamId) ?? 0),
      );
    }

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
    const count = await this.prisma.workshopItem.count();
    const skip = Math.floor(Math.random() * count);

    const item = await this.prisma.workshopItem.findFirst({
      skip,
      select: {
        steamId: true,
      },
    });

    return item!.steamId;
  }

  async getItem(id: string): Promise<WorkshopItem | null> {
    let item = await this.prisma.workshopItem.findUnique({
      where: { steamId: id },
    });

    if (!item) {
      item = await this.fetchItems.execute(id);
    }

    if (item) {
      void this.addRequestQueue(id);
      void this.addDownloadQueue(id);
      void this.websocket.sendRequest({
        type: 'fetch_by_id',
        mapId: item.steamId,
      });

      return {
        id: item.steamId,
        title: item.title,
        description: item.description || 'Updating...',
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
        filename: item.filename,
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
        id: leaderboard.id,
        mapId: leaderboard.mapId,
        enteries: leaderboard.enteries,
      };
    } else {
      return null;
    }
  }

  async getQueryLeaderboards(ids?: string[]): Promise<Leaderboard[]> {
    const fixedLeaderboards: Leaderboard[] = [];
    let parsedIds: string[] | undefined;

    if (ids) {
      parsedIds = [];

      if (ObjectId.isValid(ids[0])) {
        parsedIds?.push(...ids);
      } else {
        const leaderboards = await this.prisma.leaderboard.findMany({
          where: { mapId: { in: ids } },
        });

        parsedIds?.push(...leaderboards.map((leaderboard) => leaderboard.id));
      }
    }

    const leaderboards = await this.prisma.leaderboard.findMany({
      where: { id: { in: parsedIds } },
    });

    const leaderboardsToUpdate = leaderboards.filter(
      (leaderboard) => leaderboard.playersCount === null,
    );

    for (const leaderboard of leaderboardsToUpdate) {
      const updatedLeaderboard = await this.prisma.leaderboard.update({
        where: { id: leaderboard.id },
        data: {
          playersCount: leaderboard.enteries.length,
        },
      });

      fixedLeaderboards.push(updatedLeaderboard);
    }
    return [...new Set([...fixedLeaderboards, ...leaderboards])];
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

    const leaderboard = await this.prisma.leaderboard.findUniqueOrThrow({
      where: { mapId: leaderboardEntry.mapId },
    });
    const updatedEntries: string[] = [];

    if (deleteEntry) {
      const lb = await this.prisma.leaderboard.update({
        where: { mapId: leaderboardEntry.mapId },
        data: {
          enteries: leaderboard?.enteries.filter(
            (e) => e !== leaderboardEntry.id,
          ),
        },
      });

      await this.prisma.leaderboardEntry.delete({ where: { id } });
      updatedEntries.push(...lb.enteries);
    } else {
      await this.prisma.leaderboardEntry.update({
        where: { id },
        data: {
          banned: true,
        },
      });

      updatedEntries.push(...leaderboard.enteries.filter((e) => e !== id));
    }

    const entries = await this.prisma.leaderboardEntry.findMany({
      where: {
        id: { in: updatedEntries },
        banned: false,
      },
      orderBy: { score: 'asc' },
    });

    await Promise.all(
      entries.map((entry, index) =>
        this.prisma.leaderboardEntry.update({
          where: { id: entry.id },
          data: { place: index + 1 },
        }),
      ),
    );
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

    const leaderboard = await this.prisma.leaderboard.findUniqueOrThrow({
      where: { mapId: leaderboardEntry.mapId },
    });

    const entries = await this.prisma.leaderboardEntry.findMany({
      where: {
        id: { in: leaderboard.enteries },
        banned: false,
      },
    });

    entries.push({ ...leaderboardEntry, banned: false });
    entries.sort((a, b) => a.score - b.score);

    await Promise.all(
      entries.map((entry, index) =>
        this.prisma.leaderboardEntry.update({
          where: { id: entry.id },
          data: { place: index + 1 },
        }),
      ),
    );
  }

  async upsertItem(workshopItem: {
    steamId: string;
    title: string;
    previewUrl: string;
    creator: string;
    creatorId?: string;
    description?: string;
    previews?: string[];
    createDate?: Date;
  }): Promise<string> {
    const user = await this.prisma.steamUser.findFirst({
      where: { username: workshopItem.creator },
    });

    const cId = workshopItem.creatorId ?? user?.steamId ?? '';
    const data = {
      ...workshopItem,
      creatorId: cId,
      creator:
        user?.username ??
        workshopItem.creatorId ??
        workshopItem.creator ??
        'unknown',
    };

    const upload = await this.prisma.workshopItem.upsert({
      where: { steamId: workshopItem.steamId },
      update: {
        ...data,
      },
      create: {
        ...data,
      },
    });

    return upload.id;
  }
}
