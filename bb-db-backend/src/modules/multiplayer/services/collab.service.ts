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
        collab.blocks.set(block.instanceID, block);
      }

      this.multiplayer.broadcastPacket(
        {
          packet: PacketType.PlaceBlocksPacket,
          payload: { block: packet.block, id: player.id },
        },
        [player.id],
        collab?.players,
      );
    } else {
      collab.blocks.set(packet.block.instanceID, packet.block);
      this.multiplayer.broadcastPacket(
        {
          packet: PacketType.PlaceBlockPacket,
          payload: { block: packet.block, id: player.id },
        },
        [player.id],
        collab.players,
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
      collab.players,
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
      collab.players,
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
      collab.players,
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
      collab.players,
    );
  }

  createGroup(player: SessionPlayer, packet: Proto.CreateGroup) {
    if (!player.collabId) return;

    const collab = this.collabSessions.get(player.collabId);

    if (!collab || !packet.group) return;

    collab.groups.set(packet.group.instanceID, {
      instanceID: packet.group.instanceID,
      name: packet.group.name,
      blocks: packet.group.blocks,
      pivot: packet.group.pivot
        ? collab.blocks.get(packet.group.pivot.instanceID)
        : undefined,
    });

    this.multiplayer.broadcastPacket(
      { packet: PacketType.CreateGroupPacket, payload: packet },
      [player.id],
      collab.players,
    );
  }

  changeGroup(player: SessionPlayer, packet: Proto.ChangeGroup) {
    if (!player.collabId) return;

    const collab = this.collabSessions.get(player.collabId);

    if (!collab || !packet.group) return;

    collab.groups.set(packet.group.instanceID, packet.group);
    this.multiplayer.broadcastPacket(
      { packet: PacketType.ChangeGroupPacket, payload: packet },
      [player.id],
      collab.players,
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
      collab.players,
    );
  }

  addBlockToGroup(player: SessionPlayer, packet: Proto.AddBlockToGroup) {
    if (!player.collabId) return;

    const collab = this.collabSessions.get(player.collabId);
    const group = collab?.groups.get(packet.groupInstanceID);

    if (!collab || !group) return;

    group.blocks.push(packet.blockInstanceID);
    this.multiplayer.broadcastPacket(
      { packet: PacketType.AddBlockToGroupPacket, payload: packet },
      [player.id],
      collab.players,
    );
  }

  removeBlockFromGroup(
    player: SessionPlayer,
    packet: Proto.RemoveBlockFromGroup,
  ) {
    if (!player.collabId) return;

    const collab = this.collabSessions.get(player.collabId);
    const group = collab?.groups.get(packet.groupInstanceID);

    if (!collab || !group) return;

    group.blocks = group.blocks.filter(
      (block) => block !== packet.blockInstanceID,
    );

    collab.groups.set(group.instanceID, group);

    this.multiplayer.broadcastPacket(
      { packet: PacketType.RemoveBlockFromGroupPacket, payload: packet },
      [player.id],
      collab.players,
    );
  }
}
