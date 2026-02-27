import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { BBLBApiService } from '../../application/adapters/bblb-api';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class FetchBBLBReplaysScheduler {
  private readonly logger = new Logger(FetchBBLBReplaysScheduler.name);
  private readonly DB_UPDATE_BATCH_SIZE = 500;
  private readonly mainMaps = ['TimeMS', 'TimeDLC1', 'TimeBirthday'];

  constructor(
    private readonly prisma: PrismaService,
    private readonly bblbApi: BBLBApiService,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleCron() {
    this.logger.log('Taking new replays from BBLB...');

    const existingEntries = await this.prisma.leaderboardEntry.findMany({
      select: {
        id: true,
        mapId: true,
        steamId: true,
        username: true,
        place: true,
        score: true,
        date: true,
        banned: true,
      },
    });

    const entries = (await this.bblbApi.getRawData())?.entries;
    const maps = (await this.bblbApi.getRawData())?.maps;

    if (!entries || !maps) return;

    const entryMap = new Map<string, (typeof existingEntries)[0]>();

    for (const entry of existingEntries) {
      entryMap.set(`${entry.mapId}:${entry.steamId}`, entry);
    }

    const toCreate: ParsedLeaderboardEntry[] = [];
    const toUpdate: Array<{
      id: string;
      data: ParsedLeaderboardEntry;
    }> = [];

    for (const entry of entries) {
      const key = `${entry.mapId}:${entry.steamId}`;
      const existingEntry = entryMap.get(key);

      if (!existingEntry) {
        toCreate.push(entry);
        continue;
      }

      if (existingEntry.banned) continue;

      const isChanged =
        existingEntry.username !== entry.username ||
        existingEntry.score > entry.score ||
        existingEntry?.date?.getTime() !== entry?.date?.getTime();

      if (isChanged) {
        toUpdate.push({ id: existingEntry.id, data: entry });
      }
    }

    if (maps.length > 0) {
      const mapsIds = (await this.prisma.workshopItem.findMany()).map(
        (map) => map.steamId,
      );

      let foundMaps = 0;

      for (const map of maps) {
        if (this.mainMaps.includes(map.steamId)) continue;

        if (!mapsIds.includes(map.steamId)) {
          const user = await this.prisma.steamUser.findFirst({
            where: { username: map.creator ?? map.creatorId },
          });

          const cId = user?.steamId ?? '';

          await this.prisma.workshopItem.create({
            data: {
              ...map,
              creatorId: cId,
            },
          });

          foundMaps++;
        }
      }

      this.logger.log(`Found ${foundMaps} maps`);
    }

    if (toCreate.length === 0 && toUpdate.length === 0) {
      this.logger.log('Nothing to update.');
      return;
    } else {
      this.logger.log(
        `Found ${toCreate.length} new replays and ${toUpdate.length} replays to update.`,
      );
    }

    if (toCreate.length > 0) {
      this.logger.log('Uploading replays...');

      await this.prisma.leaderboardEntry.createMany({
        data: toCreate.map((entry) => ({
          place: entry.place,
          mapId: entry.mapId,
          steamId: entry.steamId,
          username: entry.username,
          score: entry.score,
          date: entry.date,
        })),
      });
    }

    for (let i = 0; i < toUpdate.length; i += this.DB_UPDATE_BATCH_SIZE) {
      const batch = toUpdate.slice(i, i + this.DB_UPDATE_BATCH_SIZE);

      await Promise.all(
        batch.map((update) =>
          this.prisma.leaderboardEntry.updateMany({
            where: { id: update.id },
            data: update.data,
          }),
        ),
      );
    }

    const newEntryIds = await this.prisma.leaderboardEntry.findMany({
      where: {
        OR: toCreate.map((entry) => ({
          mapId: entry.mapId,
          steamId: entry.steamId,
        })),
      },
      select: { id: true, mapId: true, steamId: true, username: true },
    });

    if (newEntryIds.length > 0)
      this.logger.log('Updating leaderboard and user data...');

    for (const entry of newEntryIds) {
      await this.prisma.leaderboard.upsert({
        where: { mapId: entry.mapId },
        update: {
          enteries: {
            push: entry.id,
          },
        },
        create: {
          mapId: entry.mapId,
          enteries: [entry.id],
          playersCount: 1,
        },
      });

      await this.prisma.steamUser.upsert({
        where: { steamId: entry.steamId },
        update: {
          username: entry.username,
          replays: {
            push: entry.id,
          },
        },
        create: {
          steamId: entry.steamId,
          username: entry.username,
          items: [],
          replays: [entry.id],
        },
      });
    }

    for (const map of toUpdate) {
      const leaderboard = await this.prisma.leaderboard.findUnique({
        where: { mapId: map.id },
      });

      if (!leaderboard) continue;

      await this.prisma.leaderboard.update({
        where: { mapId: map.id },
        data: {
          playersCount: leaderboard?.enteries.length,
        },
      });
    }

    this.logger.log('Replays was updated.');
  }
}
