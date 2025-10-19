import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import * as wsMessagesDto from './../dto/ws-messages.dto';
import { Socket } from 'socket.io';

@Injectable()
export class WebsocketService {
  constructor(private readonly prisma: PrismaService) {}

  async saveReplays(data: wsMessagesDto.RecieveReplay) {
    await this.prisma.$transaction(async (tx) => {
      const existingLeaderboard = await tx.leaderboard.findUnique({
        where: { mapId: data.mapId },
      });

      const enteries = [...(existingLeaderboard?.enteries || [])];

      for (const entry of data.entries) {
        const replay = await tx.leaderboardEntry.upsert({
          where: {
            mapId_steamId: { mapId: data.mapId, steamId: entry.userId },
          },
          update: {
            username: entry.userName,
            date: new Date(entry.date),
            score: entry.score,
          },
          create: {
            mapId: data.mapId,
            steamId: entry.userId,
            username: entry.userName,
            date: new Date(entry.date),
            score: entry.score,
          },
        });

        enteries.push(replay.id);

        await tx.leaderboard.upsert({
          where: { mapId: entry.mapId },
          update: { enteries: [...new Set(enteries)] },
          create: { mapId: entry.mapId, enteries: [replay.id] },
        });

        await tx.steamUser.upsert({
          where: { steamId: entry.userId },
          update: {
            username: entry.userName,
            replays: [
              ...new Set([...(existingLeaderboard?.enteries || []), replay.id]),
            ],
          },
          create: {
            steamId: entry.userId,
            username: entry.userName,
            items: [],
            replays: [replay.id],
          },
        });
      }
    });
  }

  async sendReplays(id: string, client: Socket) {
    const existingLeaderboard = await this.prisma.leaderboard.findUnique({
      where: { mapId: id },
    });

    if (existingLeaderboard?.enteries) {
      const replays = await this.prisma.leaderboardEntry.findMany({
        where: { id: { in: existingLeaderboard.enteries } },
        orderBy: { score: 'desc' },
      });

      const returnReplays: Replay[] = [];

      for (const replay of replays) {
        returnReplays.push({
          id: replay.id,
          creator: replay.username,
          creatorId: replay.steamId,
          mapId: replay.mapId,
          score: replay.score,
          date: replay.date,
        });
      }

      client.emit('request_leaderboard', returnReplays);
    }
  }
}
