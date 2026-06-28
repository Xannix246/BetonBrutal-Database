import { Injectable } from '@nestjs/common';
import { Packet, PacketType } from 'src/generated/protos/multiplayer';
import { ProtoType, ProtoPacket } from '../types/proto.types';

@Injectable()
export class ProtobufManager {
  public serialize(data: ProtoPacket) {
    return this.serializePayload(data);
  }

  public deserialize(data: Buffer): ProtoPacket | undefined {
    return this.deserializePayload(data);
  }

  private serializePayload(data: ProtoPacket): Buffer {
    let packet: Uint8Array;

    if (data.packet === PacketType.UnknownPacket) {
      throw new Error('Cannot create unknown packet');
    }

    switch (data.packet) {
      case PacketType.VersionPacket:
        packet = Packet.toBinary({
          payload: {
            oneofKind: ProtoType.Version,
            version: data.payload,
          },
        });
        break;
      case PacketType.EventPacket:
        packet = Packet.toBinary({
          payload: {
            oneofKind: ProtoType.Event,
            event: data.payload,
          },
        });
        break;
      case PacketType.JoinPacket:
        packet = Packet.toBinary({
          payload: {
            oneofKind: ProtoType.Join,
            join: data.payload,
          },
        });
        break;
      case PacketType.GetPlayersPacket:
        packet = Packet.toBinary({
          payload: {
            oneofKind: ProtoType.PlayerList,
            playerList: data.payload,
          },
        });
        break;
      case PacketType.DisconnectPacket:
        packet = Packet.toBinary({
          payload: {
            oneofKind: ProtoType.Disconnect,
            disconnect: data.payload,
          },
        });
        break;
      case PacketType.NicknamePacket:
        packet = Packet.toBinary({
          payload: {
            oneofKind: ProtoType.Nickname,
            nickname: data.payload,
          },
        });
        break;
      case PacketType.BodyColorPacket:
        packet = Packet.toBinary({
          payload: {
            oneofKind: ProtoType.BodyColor,
            bodyColor: data.payload,
          },
        });
        break;
      case PacketType.MovePacket:
        packet = Packet.toBinary({
          payload: {
            oneofKind: ProtoType.Move,
            move: data.payload,
          },
        });
        break;
      case PacketType.GameModePacket:
        packet = Packet.toBinary({
          payload: {
            oneofKind: ProtoType.GameMode,
            gameMode: data.payload,
          },
        });
        break;
      case PacketType.MapPacket:
        packet = Packet.toBinary({
          payload: {
            oneofKind: ProtoType.Map,
            map: data.payload,
          },
        });
        break;
      case PacketType.MessagePacket:
        packet = Packet.toBinary({
          payload: {
            oneofKind: ProtoType.Message,
            message: data.payload,
          },
        });
        break;
      case PacketType.CommandPacket:
        packet = Packet.toBinary({
          payload: {
            oneofKind: ProtoType.Command,
            command: data.payload,
          },
        });
        break;
      case PacketType.PlayersPingPacket:
        packet = Packet.toBinary({
          payload: {
            oneofKind: ProtoType.PlayersPing,
            playersPing: data.payload,
          },
        });
        break;
      case PacketType.LoadMapPacket:
        packet = Packet.toBinary({
          payload: {
            oneofKind: ProtoType.LoadMap,
            loadMap: data.payload,
          },
        });
        break;
      case PacketType.PlaceBlocksPacket:
        packet = Packet.toBinary({
          payload: {
            oneofKind: ProtoType.PlaceBlocks,
            placeBlocks: data.payload,
          },
        });
        break;
      case PacketType.PlaceBlockPacket:
        packet = Packet.toBinary({
          payload: {
            oneofKind: ProtoType.PlaceBlock,
            placeBlock: data.payload,
          },
        });
        break;
      case PacketType.DeleteBlockPacket:
        packet = Packet.toBinary({
          payload: {
            oneofKind: ProtoType.DeleteBlock,
            deleteBlock: data.payload,
          },
        });
        break;
      case PacketType.ChangeBlockPacket:
        packet = Packet.toBinary({
          payload: {
            oneofKind: ProtoType.ChangeBlock,
            changeBlock: data.payload,
          },
        });
        break;
      case PacketType.MapSettingsPacket:
        packet = Packet.toBinary({
          payload: {
            oneofKind: ProtoType.MapSettings,
            mapSettings: data.payload,
          },
        });
        break;
      case PacketType.MapColorPacket:
        packet = Packet.toBinary({
          payload: {
            oneofKind: ProtoType.MapColor,
            mapColor: data.payload,
          },
        });
        break;
    }

    return Buffer.from(packet);
  }

  private deserializePayload(data: Buffer): ProtoPacket | undefined {
    const packet = Packet.fromBinary(data);

    switch (packet.payload.oneofKind) {
      case ProtoType.Version:
        return {
          packet: PacketType.VersionPacket,
          payload: packet.payload.version,
        };
      case ProtoType.Event:
        return {
          packet: PacketType.EventPacket,
          payload: packet.payload.event,
        };
      case ProtoType.Join:
        return {
          packet: PacketType.JoinPacket,
          payload: packet.payload.join,
        };
      case ProtoType.PlayerList:
        return {
          packet: PacketType.GetPlayersPacket,
          payload: packet.payload.playerList,
        };
      case ProtoType.Disconnect:
        return {
          packet: PacketType.DisconnectPacket,
          payload: packet.payload.disconnect,
        };
      case ProtoType.Nickname:
        return {
          packet: PacketType.NicknamePacket,
          payload: packet.payload.nickname,
        };
      case ProtoType.BodyColor:
        return {
          packet: PacketType.BodyColorPacket,
          payload: packet.payload.bodyColor,
        };
      case ProtoType.Move:
        if (!packet.payload.move.position || !packet.payload.move.rotation) {
          return;
        }
        return {
          packet: PacketType.MovePacket,
          payload: packet.payload.move,
        };
      case ProtoType.GameMode:
        return {
          packet: PacketType.GameModePacket,
          payload: packet.payload.gameMode,
        };
      case ProtoType.Map:
        return {
          packet: PacketType.MapPacket,
          payload: packet.payload.map,
        };
      case ProtoType.Message:
        return {
          packet: PacketType.MessagePacket,
          payload: packet.payload.message,
        };
      case ProtoType.Command:
        return {
          packet: PacketType.CommandPacket,
          payload: packet.payload.command,
        };
      case ProtoType.PlayersPing:
        return {
          packet: PacketType.PlayersPingPacket,
          payload: packet.payload.playersPing,
        };
      case ProtoType.LoadMap:
        return {
          packet: PacketType.LoadMapPacket,
          payload: packet.payload.loadMap,
        };
      case ProtoType.PlaceBlocks:
        if (!packet.payload.placeBlocks.block) return;
        return {
          packet: PacketType.PlaceBlocksPacket,
          payload: packet.payload.placeBlocks,
        };
      case ProtoType.PlaceBlock:
        if (!packet.payload.placeBlock.block) return;
        return {
          packet: PacketType.PlaceBlockPacket,
          payload: packet.payload.placeBlock,
        };
      case ProtoType.DeleteBlock:
        return {
          packet: PacketType.DeleteBlockPacket,
          payload: packet.payload.deleteBlock,
        };
      case ProtoType.ChangeBlock:
        if (!packet.payload.changeBlock.block) return;
        return {
          packet: PacketType.ChangeBlockPacket,
          payload: packet.payload.changeBlock,
        };
      case ProtoType.MapSettings:
        return {
          packet: PacketType.MapSettingsPacket,
          payload: packet.payload.mapSettings,
        };
      case ProtoType.MapColor:
        return {
          packet: PacketType.PlaceBlockPacket,
          payload: packet.payload.mapColor,
        };
    }

    return {
      packet: PacketType.UnknownPacket,
      payload: {
        ...packet,
      },
    };
  }
}
