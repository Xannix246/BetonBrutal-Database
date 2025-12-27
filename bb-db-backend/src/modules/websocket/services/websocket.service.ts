import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import * as wsMessagesDto from './../dto/ws-messages.dto';
import { Socket } from 'socket.io';
import { SteamApiService } from 'src/modules/data-requester/application/adapters/http-steam-api';

@Injectable()
export class WebsocketService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly steam: SteamApiService,
  ) {}

  async saveReplays(data: wsMessagesDto.RecieveReplay) {
    const existingLeaderboard = await this.prisma.leaderboard.findUnique({
      where: { mapId: data.mapId },
    });

    const enteries = [...(existingLeaderboard?.enteries || [])];

    const replays = await this.steam.getQueryItems(
      data.entries
        .map((entry) => entry.replayId || '')
        .filter((entry) => entry !== ''),
    );

    const ReplayRecord = new Map<string, Date>();

    for (const item of replays) {
      if (item.id && item.createDate && item.title) {
        ReplayRecord.set(item.id, new Date(item.createDate));
      }
    }

    for (const entry of data.entries) {
      const replay = await this.prisma.leaderboardEntry.upsert({
        where: { mapId_steamId: { mapId: data.mapId, steamId: entry.userId } },
        update: {
          place: entry.place,
          username: entry.userName,
          date: entry.replayId ? ReplayRecord.get(entry.replayId) : new Date(0),
          score: entry.score,
        },
        create: {
          mapId: data.mapId,
          place: entry.place,
          steamId: entry.userId,
          username: entry.userName,
          date: entry.replayId ? ReplayRecord.get(entry.replayId) : new Date(0),
          score: entry.score,
        },
      });

      await this.prisma.leaderboard.upsert({
        where: { mapId: entry.mapId },
        update: { enteries: [...new Set([...enteries, replay.id])] },
        create: { mapId: entry.mapId, enteries: [replay.id] },
      });
      enteries.push(replay.id);
      const user = await this.prisma.steamUser.findUnique({
        where: { steamId: entry.userId },
      });

      await this.prisma.steamUser.upsert({
        where: { steamId: entry.userId },
        update: {
          username: entry.userName,
          replays: [...new Set([...(user?.replays || []), replay.id])],
        },
        create: {
          steamId: entry.userId,
          username: entry.userName,
          items: [],
          replays: [replay.id],
        },
      });
    }
  }

  async sendReplays(id: string, client: Socket): Promise<void> {
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
          place: replay.place,
        });
      }

      client.emit('request_leaderboard', returnReplays);
    }

    return;
  }
}
