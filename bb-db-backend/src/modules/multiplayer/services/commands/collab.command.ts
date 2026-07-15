import { Injectable, OnModuleInit } from '@nestjs/common';
import { CommandsService } from '../commands.service';
import {
  C,
  CommandsContext,
  SessionCollab,
  SessionPlayer,
} from '../../types/multiplayer';
import { Events, GameMode, PacketType } from 'src/generated/protos/multiplayer';

@Injectable()
export class CollabCommand implements OnModuleInit {
  constructor(private readonly commandsService: CommandsService) {}

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
      default:
        return `<color=${C.yellow}>Unknown argument. Use create, join or leave</color>`;
    }
  }

  private createCollab(
    player: SessionPlayer,
    context: CommandsContext,
    name: string,
  ): string {
    if (player.collabId) return `You're already in a collab.`;

    if (context.playerData.get(player.id)?.mode.value !== GameMode.T_EDITOR)
      return `You must in the editor to collab.`;

    this.commandsService.sendMessage(
      player,
      `<color=${C.blue}>Creating collab... Please wait a moment, transfering blocks data may take a while</color>`,
    );

    const collab: SessionCollab = {
      id: name,
      ownerId: player.id,
      players: new Set([player.id]),
      blocks: new Map(),
      groups: new Map(),
      settings: new Map(),
      color: new Map(),
      triggers: new Map(),
    };

    player.collabId = name;
    context.players.set(player.id, player);
    context.collabSessions.set(name, collab);

    this.commandsService.sendEvent(player, Events.StartCollab);

    // void this.test(player, context);

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

    console.log('Sending groups...');
    for (const group of collab.groups.values()) {
      const groupPromise = await this.commandsService.sendPacketAsync(player, {
        packet: PacketType.CreateGroupPacket,
        payload: {
          id: player.id,
          group: {
            ...group,
            blocks: [...group.blocks],
          },
        },
      });
      if (!groupPromise) break;
    }

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

    return `<color=${C.yellow}>You have joined the collab</color>`;
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

  // private async test(player: SessionPlayer, context: CommandsContext) {
  //   for (let i = 0; i < 3; i++) {
  //     const id = v4();
  //     const block = JSON.parse(
  //       `{"instanceID":"${id}","blockID":191013585,"scale":1,"color":0,"position":{"x":${-19.5 - i * 2},"y":-2.875188975792753e-10,"z":-2.5},"rotation":{"x":0,"y":0,"z":3.660806102701031e-9},"customColor":{"r":1,"g":1,"b":1,"a":1}}`,
  //     ) as Block;
  //     const trigger = JSON.parse(
  //       `{"instanceId":"${id}","triggerId":"ID123${i}","retriggerable":true,"triggerWhenRunning":true,"resetOnRetrigger":false,"operations":[{"isEnabled":true,"isLinked":false,"operation":{"oneofKind":"move","move":{"currentOffsetMode":0,"duration":1,"currentDurationMode":0,"currentEasingMode":0,"targetGroupName":"Group","offset":{"x":0,"y":1,"z":0},"currentSpaceMode":0,"currentPivotSource":0,"pivotSourceGroupName":"Group"}}},{"isEnabled":true,"isLinked":false,"operation":{"oneofKind":"rotate","rotate":{"currentOffsetMode":0,"duration":1,"currentDurationMode":0,"currentEasingMode":0,"targetGroupName":"Group","offset":{"x":2,"y":0,"z":0},"currentPivotSource":0,"pivotSourceGroupName":"Group","currentSpaceMode":0,"currentSpacePivotSource":0,"spacePivotSourceGroupName":"Group"}}},{"isEnabled":true,"isLinked":true,"operation":{"oneofKind":"color","color":{"targetMode":0,"targetGroupName":"dd","blendMode":0,"duration":3,"color":{"r":1,"g":1,"b":1,"a":1},"colorMode":0}}},{"isEnabled":true,"isLinked":false,"operation":{"oneofKind":"sound","sound":{"soundObjectName":"-","playMode":0,"soundId":"ID","volume":1,"fadeIn":2,"fadeOut":0,"pitch":1,"startOffset":0,"maxPlaytime":0,"loop":false,"panningMode":0,"range":10,"attach":true,"useVolumeSettings":true}}},{"isEnabled":true,"isLinked":false,"operation":{"oneofKind":"wait","wait":{"duration":2}}},{"isEnabled":true,"isLinked":false,"operation":{"oneofKind":"restart","restart":{"restart":false,"reset":true}}},{"isEnabled":true,"isLinked":false,"operation":{"oneofKind":"sendEvent","sendEvent":{"targetGroup":"w","eventName":"Event","targetMode":0,"targetTriggerId":"Trigger ID"}}},{"isEnabled":true,"isLinked":true,"operation":{"oneofKind":"receiveEvent","receiveEvent":{"eventName":"Event","jump":true,"canTrigger":false,"wait":true}}}]}`,
  //     ) as Trigger;

  //     console.log('Sending blocks...');
  //     await this.commandsService.sendPacketAsync(player, {
  //       packet: PacketType.PlaceBlockPacket,
  //       payload: { id: player.id, block },
  //     });

  //     console.log('Sending triggers...');
  //     await this.commandsService.sendPacketAsync(player, {
  //       packet: PacketType.ChangeTriggerPacket,
  //       payload: { id: player.id, trigger },
  //     });
  //   }
  // }
}
