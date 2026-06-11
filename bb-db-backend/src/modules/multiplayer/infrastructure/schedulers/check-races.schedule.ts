import { Injectable } from '@nestjs/common';
import { MultiplayerService } from '../../services/multiplayer.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Event, PacketType, SessionRace } from '../../types/multiplayer';

@Injectable()
export class CheckRacesScheduler {
  constructor(private readonly multiplayer: MultiplayerService) {}

  @Cron(CronExpression.EVERY_SECOND)
  handleCron() {
    const races = this.multiplayer.raceSessions.values();

    for (const race of races) {
      if (!race.started && this.getSeconds(race.time.valueOf()) === 15 - 3) {
        if (race.players.length < 2) continue;
        this.multiplayer.broadcastServer(
          'Race starting in 3 seconds...',
          race.players,
        );
      } else if (!race.started && this.getSeconds(race.time.valueOf()) >= 15) {
        this.raceStart(race);
      } else if (
        race.players.length === race.results.length ||
        (race.finished && this.getSeconds(race.time.valueOf()) > 60)
      ) {
        this.raceEnd(race);
      }
    }
  }

  private raceStart(race: SessionRace) {
    if (race.players.length < 2) {
      for (const playerId of race.players) {
        const player = this.multiplayer.players.get(playerId)!;
        player.raceId = undefined;
        this.multiplayer.players.set(playerId, player);
      }

      this.multiplayer.broadcastServer(
        'Race canceled: Not enough players.',
        race.players,
      );

      this.multiplayer.raceSessions.delete(race.id);
      return;
    }

    race.started = true;
    race.time = new Date();

    this.multiplayer.broadcastServer('Race has started, GO!', race.players);

    this.multiplayer.broadcastPacket({
      packet: PacketType.Event,
      signal: Event.RaceStart,
    });
  }

  private raceEnd(race: SessionRace) {
    const summary: string[] = [];

    for (const result of race.results) {
      summary.push(
        `${this.formatTime(result.time)} - ${this.multiplayer.players.get(result.playerId)?.nick}`,
      );
    }

    this.multiplayer.broadcastServer(summary.join('\n'), race.players);

    for (const playerId of race.players) {
      const player = this.multiplayer.players.get(playerId)!;
      player.raceId = undefined;
      this.multiplayer.players.set(playerId, player);
    }

    this.multiplayer.raceSessions.delete(race.id);
  }

  private formatTime(score: number): string {
    const seconds = score / 100;
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes % 60).padStart(2, '0')}:${remainingSeconds
        .toFixed(2)
        .padStart(5, '0')}`;
    } else {
      return `${minutes}:${remainingSeconds.toFixed(2).padStart(5, '0')}`;
    }
  }

  private getSeconds(time: number) {
    return Math.floor((new Date().valueOf() - time) / 1000);
  }
}
