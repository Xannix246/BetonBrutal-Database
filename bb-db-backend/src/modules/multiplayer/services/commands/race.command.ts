import { Injectable, OnModuleInit } from '@nestjs/common';
import { CommandsService } from '../commands.service';
import {
  C,
  CommandsContext,
  SessionPlayer,
  SessionRace,
} from '../../types/multiplayer';
import { MapType } from 'src/generated/protos/multiplayer';

@Injectable()
export class RaceCommand implements OnModuleInit {
  constructor(private readonly commandsService: CommandsService) {}

  onModuleInit() {
    this.commandsService.register({
      aliases: ['/race'],
      args: ['[race name]'],
      description: 'start/join a race',
      execute: (...args) => this.raceCommand(...args),
    });
  }

  raceCommand(
    player: SessionPlayer,
    args: string[],
    context: CommandsContext,
  ): string {
    switch (args[0]) {
      case 'quit':
        return this.raceQuit(player, context);
      default:
        return this.raceJoin(player, context);
    }
  }

  private raceJoin(player: SessionPlayer, context: CommandsContext): string {
    if (!player.map.value) return `<color=${C.red}>You're not in map</color>`;

    const map = player.map.value;

    if (player.playerData.value?.mapMode.value === MapType.M_EDITOR)
      return `<color=${C.red}>Cannot race in editor</color>`;
    // if (map.players.size === 0) return 'No player to race';

    let race = context.raceSessions.get(map.id);
    if (race?.players.has(player)) {
      return `<color=${C.yellow}>You already in race</color>`;
    }

    if (!race) {
      race = new SessionRace({
        id: map.id,
        players: new Set([player]),
        time: new Date(),
        started: false,
        finished: false,
        results: [],
      });
    }

    context.raceSessions.set(race.id, race);
    player.race.set(race);

    this.commandsService.broadcastMessage(
      `<color=${C.blue}>Race is starting. Type /race to join!</color>`,
      map.getIds(),
      [player.id],
    );

    this.commandsService.broadcastMessage(
      `<color=${C.blue}>${player.nick.value} has joined the race.</color>`,
      race.getIds(),
    );

    if (!race.started)
      return `<color=${C.blue}>Race starting in ${15 - this.getSeconds(race.time.valueOf())} seconds.</color>`;
    if (!race.finished)
      return `<color=${C.yellow}>Race started ${this.getSeconds(race.time.valueOf())} seconds ago.</color>`;
    return `<color=${C.red}>Race is ending in ${((race.results[0].time / 1000) * 4 - this.getSeconds(race.time.valueOf())).toFixed(0)} seconds.</color>`;
  }

  private raceQuit(player: SessionPlayer, context: CommandsContext): string {
    if (!player.race.value)
      return `<color=${C.yellow}>You're not in race</color>`;

    const race = player.race.value;

    player.race.set(undefined);
    race.players.delete(player);

    // if (race.players.size < 2) {
    //   const player = context.players.get(race.players[0]);
    //   player.raceId = undefined;
    //   context.players.set(player.id, player);

    //   this.commandsService.sendMessage(
    //     player,
    //     `<color=${C.yellow}>Race canceled: Too many players left.</color>`,
    //   );

    //   context.raceSessions.delete(race.id);
    // }

    if (race.players.size === 0) {
      context.raceSessions.delete(race.id);
    }

    return `<color=${C.green}>Race left successfully!</color>`;
  }

  private getSeconds(time: number) {
    return Math.floor((new Date().valueOf() - time) / 1000);
  }
}
