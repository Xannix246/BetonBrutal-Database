import { Injectable } from '@nestjs/common';
import { MultiplayerService } from './multiplayer.service';
import { Ref, SessionCollab, SessionPlayer } from '../types/multiplayer';
import * as Proto from 'src/generated/protos/multiplayer';
import { PacketType } from 'src/generated/protos/multiplayer';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { deserializeCollab, serializeCollab } from 'src/shared/bbmapUtility';

@Injectable()
export class CollabService {
  private readonly collabSessions: Map<string, SessionCollab>;
  constructor(
    private readonly multiplayer: MultiplayerService,
    private readonly prisma: PrismaService,
  ) {
    this.collabSessions = this.multiplayer.collabSessions;
  }

  placeBlock(
    player: SessionPlayer,
    packet: Proto.PlaceBlocks | Proto.PlaceBlock,
  ) {
    if (!player.collab.value || !packet.block) return;

    const collab = player.collab.value;

    if (Array.isArray(packet.block)) {
      for (const block of packet.block) {
        collab.blocks.set(block.instanceId, block);
      }

      this.multiplayer.broadcastPacket(
        {
          packet: PacketType.PlaceBlocksPacket,
          payload: { block: packet.block, id: player.id },
        },
        [player.id],
        collab.getIds(),
      );
    } else {
      collab.blocks.set(packet.block.instanceId, packet.block);
      this.multiplayer.broadcastPacket(
        {
          packet: PacketType.PlaceBlockPacket,
          payload: { block: packet.block, id: player.id },
        },
        [player.id],
        collab.getIds(),
      );
    }
  }

  deleteBlock(player: SessionPlayer, packet: Proto.DeleteBlock) {
    if (!player.collab.value) return;

    const collab = player.collab.value;

    collab.blocks.delete(packet.instanceId);
    this.multiplayer.broadcastPacket(
      { packet: PacketType.DeleteBlockPacket, payload: packet },
      [player.id],
      collab.getIds(),
    );
  }

  changeBlock(player: SessionPlayer, packet: Proto.ChangeBlock) {
    if (!player.collab.value) return;

    const collab = player.collab.value;

    collab.blocks.set(packet.block!.instanceId, {
      ...packet.block!,
    });

    this.multiplayer.broadcastPacket(
      { packet: PacketType.ChangeBlockPacket, payload: packet },
      [player.id],
      collab.getIds(),
    );
  }

  setMapSettings(player: SessionPlayer, packet: Proto.MapSettings) {
    if (!player.collab.value) return;

    const collab = player.collab.value;

    collab.settings.set(packet.setting, packet.state);
    this.multiplayer.broadcastPacket(
      { packet: PacketType.MapSettingsPacket, payload: packet },
      [player.id],
      collab.getIds(),
    );
  }

  setMapColor(player: SessionPlayer, packet: Proto.MapColor) {
    if (!player.collab.value) return;

    const collab = player.collab.value;

    collab.color.set(packet.settings, packet.color!);
    this.multiplayer.broadcastPacket(
      { packet: PacketType.MapColorPacket, payload: packet },
      [player.id],
      collab.getIds(),
    );
  }

  createGroup(player: SessionPlayer, packet: Proto.CreateGroup) {
    if (!player.collab.value || !packet.groups) return;

    const collab = player.collab.value;

    for (const group of packet.groups) {
      const newGroup = {
        instanceId: group.instanceId,
        name: group.name,
        blocks: new Set(group.blocks),
        pivot: group.pivot
          ? collab.blocks.get(group.pivot.instanceId)
          : undefined,
      };

      collab.groups.set(group.instanceId, newGroup);
    }

    this.multiplayer.broadcastPacket(
      { packet: PacketType.CreateGroupPacket, payload: packet },
      [player.id],
      collab.getIds(),
    );
  }

  changeGroup(player: SessionPlayer, packet: Proto.ChangeGroup) {
    if (!player.collab.value || !packet.group) return;

    const collab = player.collab.value;

    collab.groups.set(packet.group.instanceId, {
      ...packet.group,
      blocks: new Set(packet.group.blocks),
    });

    this.multiplayer.broadcastPacket(
      { packet: PacketType.ChangeGroupPacket, payload: packet },
      [player.id],
      collab.getIds(),
    );
  }

  deleteGroup(player: SessionPlayer, packet: Proto.DeleteGroup) {
    if (!player.collab.value) return;

    const collab = player.collab.value;

    collab.groups.delete(packet.instanceId);
    this.multiplayer.broadcastPacket(
      { packet: PacketType.DeleteGroupPacket, payload: packet },
      [player.id],
      collab.getIds(),
    );
  }

  addBlockToGroup(player: SessionPlayer, packet: Proto.AddBlockToGroup) {
    if (!player.collab.value) return;

    const collab = player.collab.value;
    const group = collab?.groups.get(packet.groupInstanceId);

    if (!group) return;

    group.blocks.add(packet.blockInstanceId);
    this.multiplayer.broadcastPacket(
      { packet: PacketType.AddBlockToGroupPacket, payload: packet },
      [player.id],
      collab.getIds(),
    );
  }

  removeBlockFromGroup(
    player: SessionPlayer,
    packet: Proto.RemoveBlockFromGroup,
  ) {
    if (!player.collab.value) return;

    const collab = player.collab.value;
    const group = collab?.groups.get(packet.groupInstanceId);

    if (!group) return;

    group.blocks.delete(packet.blockInstanceId);
    this.multiplayer.broadcastPacket(
      { packet: PacketType.RemoveBlockFromGroupPacket, payload: packet },
      [player.id],
      collab.getIds(),
    );
  }

  createTrigger(player: SessionPlayer, packet: Proto.CreateTrigger) {
    if (!player.collab.value || !packet.trigger) return;

    const collab = player.collab.value;

    const trigger = {
      instanceId: packet.trigger.instanceId,
      triggerId: packet.trigger.triggerId,
      retriggerable: packet.trigger.retriggerable,
      triggerWhenRunning: packet.trigger.triggerWhenRunning,
      resetOnRetrigger: packet.trigger.resetOnRetrigger,
      operations: packet.trigger.operations,
      isActive: new Ref(false),
    };

    collab.triggers.set(trigger.instanceId, trigger);
    // this.multiplayer.broadcastPacket(
    //   { packet: PacketType.CreateTriggerPacket, payload: packet },
    //   [player.id],
    //   collab.getIds(),
    // );
  }

  changeTrigger(player: SessionPlayer, packet: Proto.ChangeTrigger) {
    if (!player.collab.value || !packet.trigger) return;

    const collab = player.collab.value;
    const trigger = collab?.triggers.get(packet.trigger.instanceId);

    if (!trigger) return;

    collab.triggers.set(packet.trigger.instanceId, {
      ...packet.trigger,
      operations: trigger.operations,
    });

    this.multiplayer.broadcastPacket(
      { packet: PacketType.ChangeTriggerPacket, payload: packet },
      [player.id],
      collab.getIds(),
    );
  }

  deleteTrigger(player: SessionPlayer, packet: Proto.DeleteTrigger) {
    if (!player.collab.value) return;

    const collab = player.collab.value;

    collab.triggers.delete(packet.instanceId);
    // this.multiplayer.broadcastPacket(
    //   { packet: PacketType.DeleteTriggerPacket, payload: packet },
    //   [player.id],
    //   collab.getIds(),
    // );
  }

  addOperation(player: SessionPlayer, packet: Proto.AddOperation) {
    if (!player.collab.value || !packet.operation) return;

    const collab = player.collab.value;
    const trigger = collab?.triggers.get(packet.triggerInstanceId);

    if (!trigger) return;

    trigger.operations.push(packet.operation);
    this.multiplayer.broadcastPacket(
      { packet: PacketType.AddOperationPacket, payload: packet },
      [player.id],
      collab.getIds(),
    );
  }

  editOperation(player: SessionPlayer, packet: Proto.EditOperation) {
    if (!player.collab.value || !packet.operation) return;

    const collab = player.collab.value;
    const trigger = collab?.triggers.get(packet.triggerInstanceId);

    if (!trigger) return;

    trigger.operations.splice(packet.opIndex, 1, packet.operation);
    this.multiplayer.broadcastPacket(
      { packet: PacketType.EditOperationPacket, payload: packet },
      [player.id],
      collab.getIds(),
    );
  }

  moveOperation(player: SessionPlayer, packet: Proto.ReorderOperation) {
    if (!player.collab.value) return;

    const collab = player.collab.value;
    const trigger = collab?.triggers.get(packet.triggerInstanceId);
    const opIndex = packet.opIndex;
    const moveTo = packet.moveTo;

    if (!trigger) return;
    if (opIndex + moveTo < 0 || opIndex + moveTo >= trigger.operations.length) {
      return;
    }

    const operation = structuredClone(trigger.operations[opIndex]);
    trigger.operations.splice(opIndex, 1);
    trigger.operations.splice(opIndex + moveTo, 0, operation);

    this.multiplayer.broadcastPacket(
      { packet: PacketType.MoveOperationOrderPacket, payload: packet },
      [player.id],
      collab.getIds(),
    );
  }

  removeOperation(player: SessionPlayer, packet: Proto.RemoveOperation) {
    if (!player.collab.value) return;

    const collab = player.collab.value;
    const trigger = collab?.triggers.get(packet.triggerInstanceId);

    if (!collab || !trigger) return;

    trigger.operations.splice(packet.opIndex, 1);
    this.multiplayer.broadcastPacket(
      { packet: PacketType.RemoveOperationPacket, payload: packet },
      [player.id],
      collab.getIds(),
    );
  }

  changeTriggerState(player: SessionPlayer, packet: Proto.ActivateTrigger) {
    if (!player.collab.value) return;

    const collab = player.collab.value;
    const trigger = collab?.triggers.get(packet.triggerId);

    if (!collab || !trigger) return;
    if (!collab.triggersSyncEnabled?.value) return;

    if (trigger.isActive === undefined) {
      trigger.isActive = new Ref(false);
      collab.triggers.set(trigger.instanceId, trigger);
    }

    if (packet.active && !trigger.isActive.value) {
      trigger.isActive.set(true);
      this.multiplayer.broadcastPacket(
        { packet: PacketType.ActivateTriggerPacket, payload: packet },
        [player.id],
        collab.getIds(),
      );
    } else if (!packet.active && trigger.isActive.value) {
      trigger.isActive.set(false);
      this.multiplayer.broadcastPacket(
        { packet: PacketType.ActivateTriggerPacket, payload: packet },
        [player.id],
        collab.getIds(),
      );
    }
  }

  // only for internal use

  async saveCollab(player: SessionPlayer, checkAutosave = false) {
    if (!player.userId) return 'User not found. Did you linked your account?';
    if (!player.collab.value) return;

    const collab = player.collab.value;

    if (collab.owner.id !== player.id) return;
    if (checkAutosave && !collab.autosaveEnabled) return;

    try {
      await this.prisma.mapSave.upsert({
        where: {
          userId_saveName: { userId: player.userId, saveName: collab.id },
        },
        update: {
          data: serializeCollab(collab),
        },
        create: {
          userId: player.userId,
          saveName: collab.id,
          data: serializeCollab(collab),
        },
      });

      return 'Collab was saved';
    } catch (err) {
      return `Failed to save collab: ${err}`;
    }
  }

  async restoreCollab(player: SessionPlayer, name: string) {
    if (!player.userId) return;

    const collab = await this.prisma.mapSave.findUnique({
      where: { userId_saveName: { userId: player.userId, saveName: name } },
    });

    if (collab) {
      return deserializeCollab(Buffer.from(collab.data), player);
    }
  }

  async deleteCollab(player: SessionPlayer, name: string) {
    if (!player.userId) return 'User not found. Did you linked your account?';

    const collab = await this.prisma.mapSave.findUnique({
      where: { userId_saveName: { userId: player.userId, saveName: name } },
    });

    if (collab) {
      await this.prisma.mapSave.delete({ where: { id: collab.id } });
      return 'Collab was deleted';
    } else {
      return 'Collab not found';
    }
  }

  async isSavedCollabExists(player: SessionPlayer, name: string) {
    if (!player.userId) return false;

    const collab = await this.prisma.mapSave.findUnique({
      where: { userId_saveName: { userId: player.userId, saveName: name } },
      select: {
        id: true,
      },
    });

    if (collab?.id) {
      return true;
    } else {
      return false;
    }
  }
}
