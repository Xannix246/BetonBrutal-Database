import { Injectable } from '@nestjs/common';
import { MultiplayerService } from './multiplayer.service';
import { SessionPlayer, SessionRace } from '../types/multiplayer';
import { Events, PacketType } from 'src/generated/protos/multiplayer';

@Injectable()
export class EventsService {
  private readonly raceSessions: Map<string, SessionRace>;
  private readonly players: Map<string, SessionPlayer>;
  constructor(private readonly multiplayer: MultiplayerService) {
    this.raceSessions = this.multiplayer.raceSessions;
    this.players = this.multiplayer.players;
  }

  completeRun(player: SessionPlayer) {
    if (!player.race.value) return;

    const race = player.race.value;

    if (!race.started) return;

    if (!race.finished) {
      race.finished = true;

      race.results.push({
        playerId: player.id,
        time: new Date().valueOf() - race.time.valueOf(),
      });

      race.time = new Date();
      this.raceSessions.set(race.id, race);
      return this.multiplayer.sendPrivateMessage(player, 'You won the race!');
    }

    for (const result of race.results) {
      if (result.playerId === player.id) {
        return this.multiplayer.sendPrivateMessage(
          player,
          'You have already finished the race!',
        );
      }
    }

    race.results.push({
      playerId: player.id,
      time: new Date().valueOf() - race.time.valueOf(),
    });

    this.multiplayer.sendPrivateMessage(
      player,
      `You finished in place #${race.results.length}`,
    );
  }

  resetTeamRun(player: SessionPlayer) {
    if (!player.team.value || player.team.value.owner.id !== player.id) return;

    const team = player.team.value;

    for (const trigger of team.activeTriggers.keys()) {
      team.activeTriggers.set(trigger, false);
    }

    this.multiplayer.broadcastPacket(
      {
        packet: PacketType.EventPacket,
        payload: {
          type: Events.ResetTeamRun,
        },
      },
      [player.id],
      team.getIds(),
    );
  }

  ping(player: SessionPlayer) {
    const lastSync = player.ping.lastSync.valueOf();
    player.ping.lastSync = new Date();
    player.ping.latencyMs = player.ping.lastSync.valueOf() - lastSync;
    this.players.set(player.id, player);
  }
}
