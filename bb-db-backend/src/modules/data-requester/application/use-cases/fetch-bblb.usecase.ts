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
      const leaderboardEntry = this.prisma.leaderboardEntry.upsert({
        where: {
          mapId_steamId: { mapId: entry.mapId, steamId: entry.steamId },
        },
        update: {
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

      const existingEntries = existingLeaderboard?.enteries ?? [];

      await this.prisma.leaderboard.upsert({
        where: { mapId: entry.mapId },
        update: {
          enteries: [
            ...new Set([...existingEntries, (await leaderboardEntry).id]),
          ],
        },
        create: {
          mapId: entry.mapId,
          enteries: [(await leaderboardEntry).id],
        },
      });
    }
    this.logger.log('Leaderboard refresh complete!');
  }
}
