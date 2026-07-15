import { Injectable, OnModuleInit } from '@nestjs/common';
import { CommandsService } from '../commands.service';
import { C, CommandsContext, SessionPlayer } from '../../types/multiplayer';

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
    console.log(player, context.mapSessions);
    if (!player.mapId) return `<color=${C.red}>You're not in map</color>`;

    const map = context.mapSessions.get(player.mapId);

    console.log(player.mapId, context.mapSessions);

    if (player.mapId?.startsWith('E'))
      return `<color=${C.red}>Cannot race in editor</color>`;
    if (!map) return `<color=${C.red}>Map not found</color>`;
    // if (map.players.size === 0) return 'No player to race';

    let race = context.raceSessions.get(map.id);
    if (race?.players.has(player.id)) {
      return `<color=${C.yellow}>You already in race</color>`;
    }

    if (!race) {
      race = {
        id: map.id,
        players: new Set([player.id]),
        time: new Date(),
        started: false,
        finished: false,
        results: [],
      };
    }

    player.raceId = race.id;
    context.players.set(player.id, player);
    context.raceSessions.set(race.id, race);

    this.commandsService.broadcastMessage(
      `<color=${C.blue}>Race is starting. Type /race to join!</color>`,
      [...map.players],
      [player.id],
    );

    this.commandsService.broadcastMessage(
      `<color=${C.blue}>${player.nick} has joined the race.</color>`,
      [...race.players],
    );

    if (!race.started)
      return `<color=${C.blue}>Race starting in ${15 - this.getSeconds(race.time.valueOf())} seconds.</color>`;
    if (!race.finished)
      return `<color=${C.yellow}>Race started ${this.getSeconds(race.time.valueOf())} seconds ago.</color>`;
    return `<color=${C.red}>Race is ending in ${((race.results[0].time / 1000) * 4 - this.getSeconds(race.time.valueOf())).toFixed(0)} seconds.</color>`;
  }

  private raceQuit(player: SessionPlayer, context: CommandsContext): string {
    if (!player.raceId) return `<color=${C.yellow}>You're not in race</color>`;

    const race = context.raceSessions.get(player.raceId);

    if (!race) return `<color=${C.red}>Race not found</color>`;

    player.raceId = undefined;
    context.players.set(player.id, player);

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
