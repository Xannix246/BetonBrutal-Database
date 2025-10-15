import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { BBLBApiService } from '../../application/adapters/bblb-api';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class FetchBBLBReplaysScheduler {
  private readonly logger = new Logger(FetchBBLBReplaysScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly bblbApi: BBLBApiService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.log('Taking new replays from BBLB...');

    const lastReplay = await this.prisma.leaderboardEntry.findFirst({
      orderBy: { date: 'desc' },
    });

    if (!lastReplay) return;

    const { entries } = await this.bblbApi.getRawData();

    const newEntries = lastReplay
      ? entries.filter(
          (e) =>
            new Date(e.date) >
            new Date(lastReplay.date || Date.now() - 5 * 24 * 60 * 60 * 1000),
        )
      : entries;

    if (newEntries.length === 0) {
      this.logger.log('No new replays.');
      return;
    }

    this.logger.log(`Found ${newEntries.length} new replays.`);

    for (const entry of newEntries) {
      const leaderboardEntry = await this.prisma.leaderboardEntry.upsert({
        where: {
          mapId_steamId: { mapId: entry.mapId, steamId: entry.steamId },
        },
        update: {
          username: entry.username,
          score: entry.score,
          date: entry.date,
        },
        create: {
          mapId: entry.mapId,
          steamId: entry.steamId,
          username: entry.username,
          score: entry.score,
          date: entry.date,
        },
      });

      const existingLeaderboard = await this.prisma.leaderboard.findUnique({
        where: { mapId: entry.mapId },
      });

      await this.prisma.leaderboard.upsert({
        where: { mapId: entry.mapId },
        update: {
          enteries: [
            ...new Set([
              ...(existingLeaderboard?.enteries || []),
              leaderboardEntry.id,
            ]),
          ],
        },
        create: {
          mapId: entry.mapId,
          enteries: [leaderboardEntry.id],
        },
      });

      const user = await this.prisma.steamUser.findUnique({
        where: { steamId: entry.steamId },
      });

      await this.prisma.steamUser.upsert({
        where: { steamId: entry.steamId },
        update: {
          username: entry.username,
          replays: [
            ...new Set([...(user?.replays || []), leaderboardEntry.id]),
          ],
        },
        create: {
          steamId: entry.steamId,
          username: entry.username,
          items: [],
          replays: [leaderboardEntry.id],
        },
      });
    }

    this.logger.log('Replays was updated.');
  }
}
