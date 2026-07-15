import { Injectable } from '@nestjs/common';
import { MultiplayerService } from './multiplayer.service';
import { SessionCollab, SessionPlayer } from '../types/multiplayer';
import * as Proto from 'src/generated/protos/multiplayer';
import { PacketType } from 'src/generated/protos/multiplayer';

@Injectable()
export class CollabService {
  private readonly collabSessions: Map<string, SessionCollab>;
  constructor(private readonly multiplayer: MultiplayerService) {
    this.collabSessions = this.multiplayer.collabSessions;
  }

  placeBlock(
    player: SessionPlayer,
    packet: Proto.PlaceBlocks | Proto.PlaceBlock,
  ) {
    if (!player.collabId) return;

    const collab = this.collabSessions.get(player.collabId);

    if (!collab || !packet.block) return;

    if (Array.isArray(packet.block)) {
      for (const block of packet.block) {
        console.log(JSON.stringify(block));
        collab.blocks.set(block.instanceID, block);
      }

      this.multiplayer.broadcastPacket(
        {
          packet: PacketType.PlaceBlocksPacket,
          payload: { block: packet.block, id: player.id },
        },
        [player.id],
        [...collab.players],
      );
    } else {
      collab.blocks.set(packet.block.instanceID, packet.block);
      this.multiplayer.broadcastPacket(
        {
          packet: PacketType.PlaceBlockPacket,
          payload: { block: packet.block, id: player.id },
        },
        [player.id],
        [...collab.players],
      );
    }
  }

  deleteBlock(player: SessionPlayer, packet: Proto.DeleteBlock) {
    if (!player.collabId) return;

    const collab = this.collabSessions.get(player.collabId);

    if (!collab) return;

    collab.blocks.delete(packet.instanceID);
    this.multiplayer.broadcastPacket(
      { packet: PacketType.DeleteBlockPacket, payload: packet },
      [player.id],
      [...collab.players],
    );
  }

  changeBlock(player: SessionPlayer, packet: Proto.ChangeBlock) {
    if (!player.collabId) return;

    const collab = this.collabSessions.get(player.collabId);

    if (!collab) return;

    collab.blocks.set(packet.block!.instanceID, {
      ...packet.block!,
    });

    this.multiplayer.broadcastPacket(
      { packet: PacketType.ChangeBlockPacket, payload: packet },
      [player.id],
      [...collab.players],
    );
  }

  setMapSettings(player: SessionPlayer, packet: Proto.MapSettings) {
    if (!player.collabId) return;

    const collab = this.collabSessions.get(player.collabId);

    if (!collab) return;

    collab.settings.set(packet.setting, packet.state);
    this.multiplayer.broadcastPacket(
      { packet: PacketType.MapSettingsPacket, payload: packet },
      [player.id],
      [...collab.players],
    );
  }

  setMapColor(player: SessionPlayer, packet: Proto.MapColor) {
    if (!player.collabId) return;

    const collab = this.collabSessions.get(player.collabId);

    if (!collab) return;

    collab.color.set(packet.settings, packet.color!);
    this.multiplayer.broadcastPacket(
      { packet: PacketType.MapColorPacket, payload: packet },
      [player.id],
      [...collab.players],
    );
  }

  createGroup(player: SessionPlayer, packet: Proto.CreateGroup) {
    if (!player.collabId) return;

    const collab = this.collabSessions.get(player.collabId);

    if (!collab || !packet.group) return;

    const group = {
      instanceID: packet.group.instanceID,
      name: packet.group.name,
      blocks: new Set(packet.group.blocks),
      pivot: packet.group.pivot
        ? collab.blocks.get(packet.group.pivot.instanceID)
        : undefined,
    };

    collab.groups.set(packet.group.instanceID, group);
    this.multiplayer.broadcastPacket(
      { packet: PacketType.CreateGroupPacket, payload: packet },
      [player.id],
      [...collab.players],
    );
  }

  changeGroup(player: SessionPlayer, packet: Proto.ChangeGroup) {
    if (!player.collabId) return;

    const collab = this.collabSessions.get(player.collabId);

    if (!collab || !packet.group) return;

    collab.groups.set(packet.group.instanceID, {
      ...packet.group,
      blocks: new Set(packet.group.blocks),
    });

    this.multiplayer.broadcastPacket(
      { packet: PacketType.ChangeGroupPacket, payload: packet },
      [player.id],
      [...collab.players],
    );
  }

  deleteGroup(player: SessionPlayer, packet: Proto.DeleteGroup) {
    if (!player.collabId) return;

    const collab = this.collabSessions.get(player.collabId);

    if (!collab) return;

    collab.groups.delete(packet.instanceID);
    this.multiplayer.broadcastPacket(
      { packet: PacketType.DeleteGroupPacket, payload: packet },
      [player.id],
      [...collab.players],
    );
  }

  addBlockToGroup(player: SessionPlayer, packet: Proto.AddBlockToGroup) {
    if (!player.collabId) return;

    const collab = this.collabSessions.get(player.collabId);
    const group = collab?.groups.get(packet.groupInstanceId);

    if (!collab || !group) return;

    group.blocks.add(packet.blockInstanceId);
    this.multiplayer.broadcastPacket(
      { packet: PacketType.AddBlockToGroupPacket, payload: packet },
      [player.id],
      [...collab.players],
    );
  }

  removeBlockFromGroup(
    player: SessionPlayer,
    packet: Proto.RemoveBlockFromGroup,
  ) {
    if (!player.collabId) return;

    const collab = this.collabSessions.get(player.collabId);
    const group = collab?.groups.get(packet.groupInstanceId);

    if (!collab || !group) return;

    group.blocks.delete(packet.blockInstanceId);
    this.multiplayer.broadcastPacket(
      { packet: PacketType.RemoveBlockFromGroupPacket, payload: packet },
      [player.id],
      [...collab.players],
    );
  }

  createTrigger(player: SessionPlayer, packet: Proto.CreateTrigger) {
    if (!player.collabId || !packet.trigger) return;

    const collab = this.collabSessions.get(player.collabId);

    if (!collab) return;

    const trigger = {
      instanceId: packet.trigger.instanceId,
      triggerId: packet.trigger.triggerId,
      retriggerable: packet.trigger.retriggerable,
      triggerWhenRunning: packet.trigger.triggerWhenRunning,
      resetOnRetrigger: packet.trigger.resetOnRetrigger,
      operations: packet.trigger.operations,
    };

    collab.triggers.set(trigger.instanceId, trigger);
    // this.multiplayer.broadcastPacket(
    //   { packet: PacketType.CreateTriggerPacket, payload: packet },
    //   [player.id],
    //   [...collab.players],
    // );
  }

  changeTrigger(player: SessionPlayer, packet: Proto.ChangeTrigger) {
    if (!player.collabId || !packet.trigger) return;

    const collab = this.collabSessions.get(player.collabId);
    const trigger = collab?.triggers.get(packet.trigger.instanceId);

    if (!collab || !trigger) return;

    collab.triggers.set(packet.trigger.instanceId, {
      ...packet.trigger,
      operations: trigger.operations,
    });

    this.multiplayer.broadcastPacket(
      { packet: PacketType.ChangeTriggerPacket, payload: packet },
      [player.id],
      [...collab.players],
    );
  }

  deleteTrigger(player: SessionPlayer, packet: Proto.DeleteTrigger) {
    if (!player.collabId) return;

    const collab = this.collabSessions.get(player.collabId);

    if (!collab) return;

    collab.triggers.delete(packet.instanceID);
    // this.multiplayer.broadcastPacket(
    //   { packet: PacketType.DeleteTriggerPacket, payload: packet },
    //   [player.id],
    //   [...collab.players],
    // );
  }

  addOperation(player: SessionPlayer, packet: Proto.AddOperation) {
    if (!player.collabId || !packet.operation) return;

    const collab = this.collabSessions.get(player.collabId);
    const trigger = collab?.triggers.get(packet.triggerInstanceId);

    // if (!collab || !trigger) return;

    if (!collab) {
      return console.log('Collab not found');
    }

    if (!trigger) {
      return console.log('Trigger not found', collab.triggers);
    }

    trigger.operations.push(packet.operation);
    this.multiplayer.broadcastPacket(
      { packet: PacketType.AddOperationPacket, payload: packet },
      [player.id],
      [...collab.players],
    );

    // console.log('Added operation', trigger.operations);
  }

  editOperation(player: SessionPlayer, packet: Proto.EditOperation) {
    if (!player.collabId || !packet.operation) return;

    const collab = this.collabSessions.get(player.collabId);
    const trigger = collab?.triggers.get(packet.triggerInstanceId);

    if (!collab || !trigger) return;

    trigger.operations.splice(packet.opIndex, 1, packet.operation);
    this.multiplayer.broadcastPacket(
      { packet: PacketType.EditOperationPacket, payload: packet },
      [player.id],
      [...collab.players],
    );

    // console.log('Edited operation', trigger.operations);
  }

  moveOperation(player: SessionPlayer, packet: Proto.ReorderOperation) {
    if (!player.collabId) return;

    const collab = this.collabSessions.get(player.collabId);
    const trigger = collab?.triggers.get(packet.triggerInstanceId);
    const opIndex = packet.opIndex;
    const moveTo = packet.moveTo;

    if (!collab || !trigger) return;
    if (opIndex + moveTo < 0 || opIndex + moveTo >= trigger.operations.length) {
      return;
    }

    const operation = structuredClone(trigger.operations[opIndex]);
    trigger.operations.splice(opIndex, 1);
    trigger.operations.splice(opIndex + moveTo, 0, operation);

    this.multiplayer.broadcastPacket(
      { packet: PacketType.MoveOperationOrderPacket, payload: packet },
      [player.id],
      [...collab.players],
    );

    // console.log('Moved operation', trigger.operations);
  }

  removeOperation(player: SessionPlayer, packet: Proto.RemoveOperation) {
    if (!player.collabId) return;

    const collab = this.collabSessions.get(player.collabId);
    const trigger = collab?.triggers.get(packet.triggerInstanceId);

    if (!collab || !trigger) return;

    trigger.operations.splice(packet.opIndex, 1);
    this.multiplayer.broadcastPacket(
      { packet: PacketType.RemoveOperationPacket, payload: packet },
      [player.id],
      [...collab.players],
    );

    // console.log('Removed operation', trigger.operations);
  }
}
