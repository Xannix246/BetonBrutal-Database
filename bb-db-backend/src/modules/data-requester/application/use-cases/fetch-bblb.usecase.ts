import { Injectable, Logger } from '@nestjs/common';
import { BBLBApiService } from '../adapters/bblb-api';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class FetchBBLBUseCase {
  private readonly logger = new Logger(FetchBBLBUseCase.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly bblbApi: BBLBApiService,
  ) {}

  async execute() {
    this.logger.log('Starting leaderboard refresh from BBLB...');
    const { entries } = await this.bblbApi.getRawData();

    for (const entry of entries) {
      const leaderboardEntry = await this.prisma.leaderboardEntry.upsert({
        where: {
          mapId_steamId: { mapId: entry.mapId, steamId: entry.steamId },
        },
        update: {
          place: entry.place,
          username: entry.username,
          score: entry.score,
          date: entry.date,
        },
        create: {
          place: entry.place,
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
    this.logger.log('Leaderboard refresh complete!');
  }
}
