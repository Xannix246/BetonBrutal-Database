import { Injectable, OnModuleInit } from '@nestjs/common';
import { CommandsService } from '../commands.service';
import {
  CommandsContext,
  Event,
  GameMode,
  PacketType,
  SessionCollab,
  SessionPlayer,
} from '../../types/multiplayer';

@Injectable()
export class CollabCommand implements OnModuleInit {
  constructor(private readonly commandsService: CommandsService) {}

  onModuleInit() {
    this.commandsService.register({
      aliases: ['/collab'],
      args: ['[create/leave/join/close]', '<name>'],
      description: 'show this list',
      execute: (...args) => this.collabCommand(...args),
    });
  }

  collabCommand(
    player: SessionPlayer,
    args: string[],
    context: CommandsContext,
  ) {
    switch (args[0]) {
      case 'create':
        if (!args[1]) return 'Type name';
        return this.createCollab(player, context, args[1]);
      case 'join':
        if (!args[1]) return 'Type name';
        return this.joinCollab(player, context, args[1]);
      case 'leave':
        return this.leaveCollab(player, context);
      case 'close':
        return this.closeCollab(player, context);
      default:
        return 'Unknown argument. Use create, join or leave';
    }
  }

  private createCollab(
    player: SessionPlayer,
    context: CommandsContext,
    name: string,
  ): string {
    if (player.collabId) return "You're already in a collab.";

    if (context.playerData.get(player.id)!.mode !== GameMode.EDITOR)
      return 'You must in the editor to collab.';

    this.commandsService.sendMessage(
      player,
      'Creating collab... Please wait a moment, transfering blocks data may take a while',
    );

    const collab: SessionCollab = {
      id: name,
      ownerId: player.id,
      players: [player.id],
      blocks: new Map(),
      settings: new Map(),
      color: new Map(),
    };

    player.collabId = name;
    context.players.set(player.id, player);
    context.collabSessions.set(name, collab);

    this.commandsService.sendEvent(player, Event.StartCollab);

    return 'Collab opened!';
  }

  private joinCollab(
    player: SessionPlayer,
    context: CommandsContext,
    name: string,
  ): string {
    if (player.collabId) return "You're already in a collab.";

    if (context.playerData.get(player.id)!.mode !== GameMode.EDITOR)
      return 'You must in the editor to collab.';

    const collab = context.collabSessions.get(name);
    if (!collab) return 'Collab not found';

    player.collabId = name;
    context.players.set(player.id, player);
    collab.players.push(player.id);
    context.collabSessions.set(name, collab);

    this.commandsService.sendEvent(player, Event.JoinCollab);

    if (collab.blocks.size > 2000) {
      this.commandsService.sendMessage(
        player,
        'Joining to collab... Please wait a moment, transfering blocks data may take a while',
      );
    }

    for (const setting of collab.settings) {
      this.commandsService.sendPacket(player, {
        packet: PacketType.MapSettings,
        settings: setting[0],
        state: setting[1],
      });
    }

    for (const color of collab.color) {
      this.commandsService.sendPacket(player, {
        packet: PacketType.MapColor,
        settings: color[0],
        color: color[1],
      });
    }

    this.commandsService.sendPacket(player, {
      packet: PacketType.PlaceBlocks,
      blocks: [...collab.blocks.values()],
    });

    return 'You have joined the collab';
  }

  private leaveCollab(player: SessionPlayer, context: CommandsContext) {
    if (!player.collabId) return "You're not in collab";

    const collab = context.collabSessions.get(player.collabId);

    if (!collab) return 'Collab not found';

    if (collab.ownerId === player.id) {
      return this.closeCollab(player, context);
    }

    this.commandsService.broadcastMessage(
      `${player.nick} has left the collab!`,
      collab.players,
      [player.id],
    );

    this.commandsService.sendMessage(player, 'You left from the collab.');
  }

  private closeCollab(player: SessionPlayer, context: CommandsContext) {
    if (!player.collabId) return "You're not in collab";

    const collab = context.collabSessions.get(player.collabId);

    if (!collab) return 'Collab not found';
    if (collab.ownerId !== player.id) return "You're not collab owner";

    for (const playerId of collab.players) {
      const player = context.players.get(playerId)!;
      player.collabId = undefined;
      context.players.set(playerId, player);
    }

    context.collabSessions.delete(collab.id);

    this.commandsService.broadcastEvent(Event.CloseCollab, collab.players, [
      player.id,
    ]);

    this.commandsService.broadcastMessage(
      'Collab has been closed!',
      collab.players,
    );
  }
}
