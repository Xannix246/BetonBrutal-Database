import { Injectable, OnModuleInit } from '@nestjs/common';
import { CommandsService } from '../commands.service';
import { CommandsContext, SessionPlayer } from '../../types/multiplayer';

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
    if (!player.mapId) return "You're not in map";

    const map = context.mapSessions.get(player.mapId);

    if (player.mapId?.startsWith('E')) return 'Cannot race in editor';
    if (!map) return 'Map not found';
    if (map.players.length === 0) return 'No player to race';

    let race = context.raceSessions.get(map.type + map.id);

    if (!race) {
      race = {
        id: map.type + map.id,
        players: [],
        time: new Date(),
        started: false,
        finished: false,
        results: [],
      };
    }

    player.raceId = race.id;
    race.players.push(player.id);
    context.raceSessions.set(race.id, race);

    this.commandsService.broadcastMessage(
      'Race is starting. Type /race to join!',
      map.players,
      [player.id],
    );

    this.commandsService.broadcastMessage(
      `${player.nick} has joined the race.`,
      race.players,
    );

    if (!race.started)
      return `Race starting in ${15 - this.getSeconds(race.time.valueOf())} seconds.`;
    if (!race.finished)
      return `Race started ${this.getSeconds(race.time.valueOf())} seconds ago.`;
    return `Race is ending in ${60 - this.getSeconds(race.time.valueOf())} seconds.`;
  }

  private raceQuit(player: SessionPlayer, context: CommandsContext): string {
    if (!player.raceId) return "You're not in race";

    const race = context.raceSessions.get(player.raceId);

    if (!race) return 'Race not found';

    player.raceId = undefined;
    context.players.set(player.id, player);

    if (race.players.length < 2) {
      const player = context.players.get(race.players[0])!;
      player.raceId = undefined;
      context.players.set(player.id, player);

      this.commandsService.sendMessage(
        player,
        'Race canceled: Too many players left.',
      );

      context.raceSessions.delete(race.id);
    }

    return 'Race left successfully!';
  }

  private getSeconds(time: number) {
    return Math.floor((new Date().valueOf() - time) / 1000);
  }
}
