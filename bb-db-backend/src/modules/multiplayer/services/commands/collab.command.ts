import { Injectable, OnModuleInit } from '@nestjs/common';
import { CommandsService } from '../commands.service';
import {
  C,
  CommandsContext,
  Ref,
  SessionCollab,
  SessionPlayer,
} from '../../types/multiplayer';
import { Events, GameMode, PacketType } from 'src/generated/protos/multiplayer';
import { CollabService } from '../collab.service';

@Injectable()
export class CollabCommand implements OnModuleInit {
  constructor(
    private readonly commandsService: CommandsService,
    private readonly collabService: CollabService,
  ) {}

  onModuleInit() {
    this.commandsService.register({
      aliases: ['/collab', '/c'],
      args: ['[create/leave/join/close]', '<name>'],
      description: 'open or join collab',
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
        if (!args[1]) return `<color=${C.yellow}>Type name</color>`;
        return this.createCollab(player, context, args[1]);
      case 'join':
        if (!args[1]) return `<color=${C.yellow}>Type name</color>`;
        return this.joinCollab(player, context, args[1]);
      case 'leave':
        return this.leaveCollab(player, context);
      case 'close':
        return this.closeCollab(player, context);
      case 'save':
        return this.saveCollab(player, context);
      case 'restore':
        if (!args[1]) return `<color=${C.yellow}>Type name</color>`;
        return this.createCollab(player, context, args[1], true);
      case 'delete':
        if (!args[1]) return `<color=${C.yellow}>Type name</color>`;
        return this.deleteCollab(player, context, args[1]);
      case 'enable':
        return this.enable(player, context, args[1]);
      case 'disable':
        return this.disable(player, context, args[1]);
      default:
        return `<color=${C.yellow}>Unknown argument. Use create, join, leave, save, restore, delete, enable or disable</color>`;
    }
  }

  private async createCollab(
    player: SessionPlayer,
    context: CommandsContext,
    name: string,
    restore?: boolean,
  ): Promise<string> {
    if (player.collabId) return `You're already in a collab.`;

    if (context.playerData.get(player.id)?.mode.value !== GameMode.T_EDITOR)
      return `You must in the editor to collab.`;

    this.commandsService.sendMessage(
      player,
      `<color=${C.blue}>Creating collab... Please wait a moment, transfering blocks data may take a while</color>`,
    );

    let collab: SessionCollab = {
      id: name,
      ownerId: player.id,
      players: new Set([player.id]),
      blocks: new Map(),
      groups: new Map(),
      settings: new Map(),
      color: new Map(),
      triggers: new Map(),
      autosaveEnabled: new Ref(
        await this.collabService.isSavedCollabExists(player, name),
      ),
      triggersSyncEnabled: new Ref(false),
    };

    if (restore || collab.autosaveEnabled?.value) {
      const restoreData = await this.collabService.restoreCollab(player, name);

      if (restoreData) {
        collab = restoreData;
        collab.autosaveEnabled = new Ref(true);
      } else {
        return `<color=${C.red}>Restore data not found.</color>`;
      }
    }

    player.collabId = name;
    context.players.set(player.id, player);
    context.collabSessions.set(name, collab);

    this.commandsService.sendEvent(player, Events.StartCollab);

    await this.sendData(player, collab);

    return `<color=${C.green}>Collab opened!</color>`;
  }

  private async joinCollab(
    player: SessionPlayer,
    context: CommandsContext,
    name: string,
  ): Promise<string> {
    if (player.collabId)
      return `<color=${C.yellow}>You're already in a collab.</color>`;

    if (context.playerData.get(player.id)?.mode.value !== GameMode.T_EDITOR)
      return `<color=${C.red}>You must in the editor to collab.</color>`;

    const collab = context.collabSessions.get(name);
    if (!collab) return `<color=${C.yellow}>Collab not found</color>`;

    const owner = context.players.get(collab.ownerId)!;
    const map = context.mapSessions.get(owner.mapId!)!;

    player.collabId = name;
    player.mapId = map.id;
    map.players.add(player.id);
    context.players.set(player.id, player);
    collab.players.add(player.id);

    if (collab.blocks.size > 2000) {
      this.commandsService.sendMessage(
        player,
        `<color=${C.blue}>Joining to collab... Please wait a moment, transfering blocks data may take a while</color>`,
      );
    }

    this.commandsService.sendEvent(player, Events.JoinCollab);

    await this.sendData(player, collab);

    return `<color=${C.yellow}>You have joined the collab</color>`;
  }

  private async sendData(player: SessionPlayer, collab: SessionCollab) {
    for (const setting of collab.settings) {
      this.commandsService.sendPacket(player, {
        packet: PacketType.MapSettingsPacket,
        payload: { id: player.id, setting: setting[0], state: setting[1] },
      });
    }

    for (const color of collab.color) {
      this.commandsService.sendPacket(player, {
        packet: PacketType.MapColorPacket,
        payload: { id: player.id, settings: color[0], color: color[1] },
      });
    }

    const blocksPromise = await this.commandsService.sendPacketAsync(player, {
      packet: PacketType.PlaceBlocksPacket,
      payload: { id: player.id, block: [...collab.blocks.values()] },
    });

    if (!blocksPromise) {
      return `<color=${C.red}>Collab connection failed: blocks transfer timeout.</color>`;
    }

    await this.commandsService.sendPacketAsync(player, {
      packet: PacketType.CreateGroupPacket,
      payload: {
        id: player.id,
        groups: [...collab.groups.values()].map((group) => ({
          ...group,
          blocks: [...group.blocks],
        })),
      },
    });

    for (const trigger of collab.triggers.values()) {
      const triggerPromise = await this.commandsService.sendPacketAsync(
        player,
        {
          packet: PacketType.ChangeTriggerPacket,
          payload: { id: player.id, trigger },
        },
      );
      if (!triggerPromise) break;
    }
  }

  private leaveCollab(player: SessionPlayer, context: CommandsContext) {
    if (!player.collabId)
      return `<color=${C.yellow}>You're not in collab</color>`;

    const collab = context.collabSessions.get(player.collabId);

    if (!collab) return `<color=${C.red}>Collab not found</color>`;

    if (collab.ownerId === player.id) {
      return this.closeCollab(player, context);
    }

    collab.players.delete(player.id);
    this.commandsService.sendEvent(player, Events.CloseCollab);

    this.commandsService.broadcastMessage(
      `<color=${C.blue}>${player.nick} has left the collab!</color>`,
      [...collab.players],
      [player.id],
    );

    this.commandsService.sendMessage(
      player,
      `<color=${C.blue}>You left from the collab.</color>`,
    );
  }

  private closeCollab(player: SessionPlayer, context: CommandsContext) {
    if (!player.collabId) return `<color=${C.red}>You're not in collab</color>`;

    const collab = context.collabSessions.get(player.collabId);

    if (!collab) return `<color=${C.red}>Collab not found</color>`;
    if (collab.ownerId !== player.id)
      return `<color=${C.red}>You're not collab owner</color>`;

    for (const playerId of collab.players) {
      const player = context.players.get(playerId)!;
      player.collabId = undefined;
      context.players.set(playerId, player);
      this.commandsService.sendEvent(player, Events.CloseCollab);
    }

    context.collabSessions.delete(collab.id);

    this.commandsService.broadcastEvent(
      Events.CloseCollab,
      [...collab.players],
      [player.id],
    );

    this.commandsService.broadcastMessage(
      `<color=${C.blue}>Collab has been closed!</color>`,
      [...collab.players],
    );
  }

  private async saveCollab(player: SessionPlayer, context: CommandsContext) {
    if (!player.collabId) return `<color=${C.red}>You're not in collab</color>`;

    const collab = context.collabSessions.get(player.collabId);

    if (!collab) return `<color=${C.red}>Collab not found</color>`;
    if (collab.ownerId !== player.id)
      return `<color=${C.red}>You're not collab owner</color>`;

    return (await this.collabService.saveCollab(player)) ?? '';
  }

  private async deleteCollab(
    player: SessionPlayer,
    context: CommandsContext,
    name: string,
  ) {
    const collab = context.collabSessions.get(name);

    if (collab && collab.ownerId === player.id) {
      collab.autosaveEnabled?.set(false);
    }

    return await this.collabService.deleteCollab(player, name);
  }

  private enable(
    player: SessionPlayer,
    context: CommandsContext,
    param: string,
  ) {
    if (!player.collabId) return `<color=${C.red}>You're not in collab</color>`;

    const collab = context.collabSessions.get(player.collabId);

    if (!collab) return `<color=${C.red}>Collab not found</color>`;
    if (collab.ownerId !== player.id)
      return `<color=${C.red}>You're not collab owner</color>`;

    switch (param) {
      case 'autosave':
      case 'save':
        collab.autosaveEnabled?.set(true);
        return `<color=${C.green}>Autosave enabled`;
      case 'triggersync':
        collab.triggersSyncEnabled?.set(true);
        return `<color=${C.green}>Trigger sync enabled`;
      default:
        return 'Unknown param. Please use one of these params: [autosave | triggersync]';
    }
  }

  private disable(
    player: SessionPlayer,
    context: CommandsContext,
    param: string,
  ) {
    if (!player.collabId) return `<color=${C.red}>You're not in collab</color>`;

    const collab = context.collabSessions.get(player.collabId);

    if (!collab) return `<color=${C.red}>Collab not found</color>`;
    if (collab.ownerId !== player.id)
      return `<color=${C.red}>You're not collab owner</color>`;

    switch (param) {
      case 'autosave':
      case 'save':
        collab.autosaveEnabled?.set(false);
        return `<color=${C.red}>Autosave disabled`;
      case 'triggersync':
        collab.triggersSyncEnabled?.set(false);
        return `<color=${C.red}>Trigger sync disabled`;
      default:
        return 'Unknown param. Please use one of these params: [autosave | triggersync]';
    }
  }
}
