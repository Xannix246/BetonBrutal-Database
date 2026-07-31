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

    try {
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
        case PacketType.CreateGroupPacket:
          packet = Packet.toBinary({
            payload: {
              oneofKind: ProtoType.CreateGroup,
              createGroup: data.payload,
            },
          });
          break;
        case PacketType.ChangeGroupPacket:
          packet = Packet.toBinary({
            payload: {
              oneofKind: ProtoType.ChangeGroup,
              changeGroup: data.payload,
            },
          });
          break;
        case PacketType.DeleteGroupPacket:
          packet = Packet.toBinary({
            payload: {
              oneofKind: ProtoType.DeleteGroup,
              deleteGroup: data.payload,
            },
          });
          break;
        case PacketType.AddBlockToGroupPacket:
          packet = Packet.toBinary({
            payload: {
              oneofKind: ProtoType.AddBlockToGroup,
              addBlockToGroup: data.payload,
            },
          });
          break;
        case PacketType.RemoveBlockFromGroupPacket:
          packet = Packet.toBinary({
            payload: {
              oneofKind: ProtoType.RemoveBlockFromGroup,
              removeBlockFromGroup: data.payload,
            },
          });
          break;
        case PacketType.CreateTriggerPacket:
          packet = Packet.toBinary({
            payload: {
              oneofKind: ProtoType.CreateTrigger,
              createTrigger: data.payload,
            },
          });
          break;
        case PacketType.ChangeTriggerPacket:
          packet = Packet.toBinary({
            payload: {
              oneofKind: ProtoType.ChangeTrigger,
              changeTrigger: data.payload,
            },
          });
          break;
        case PacketType.DeleteTriggerPacket:
          packet = Packet.toBinary({
            payload: {
              oneofKind: ProtoType.DeleteTrigger,
              deleteTrigger: data.payload,
            },
          });
          break;
        case PacketType.AddOperationPacket:
          packet = Packet.toBinary({
            payload: {
              oneofKind: ProtoType.AddOperation,
              addOperation: data.payload,
            },
          });
          break;
        case PacketType.EditOperationPacket:
          packet = Packet.toBinary({
            payload: {
              oneofKind: ProtoType.EditOperation,
              editOperation: data.payload,
            },
          });
          break;
        case PacketType.MoveOperationOrderPacket:
          packet = Packet.toBinary({
            payload: {
              oneofKind: ProtoType.ReorderOperation,
              reorderOperation: data.payload,
            },
          });
          break;
        case PacketType.RemoveOperationPacket:
          packet = Packet.toBinary({
            payload: {
              oneofKind: ProtoType.RemoveOperation,
              removeOperation: data.payload,
            },
          });
          break;
        case PacketType.PlayerDataPacket:
          packet = Packet.toBinary({
            payload: {
              oneofKind: ProtoType.PlayerData,
              playerData: data.payload,
            },
          });
          break;
        case PacketType.ActivateTriggerPacket:
          packet = Packet.toBinary({
            payload: {
              oneofKind: ProtoType.ActivateTrigger,
              activateTrigger: data.payload,
            },
          });
          break;
        case PacketType.AckResPacket:
          packet = Packet.toBinary({
            payload: {
              oneofKind: ProtoType.AckPacket,
              ackPacket: data.payload,
            },
          });
          break;
      }

      return Buffer.from(packet);
    } catch (e) {
      console.log(e);
      return Buffer.from('');
    }
  }

  private deserializePayload(data: Buffer): ProtoPacket | undefined {
    try {
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
            packet: PacketType.MapColorPacket,
            payload: packet.payload.mapColor,
          };
        case ProtoType.CreateGroup:
          return {
            packet: PacketType.CreateGroupPacket,
            payload: packet.payload.createGroup,
          };
        case ProtoType.ChangeGroup:
          return {
            packet: PacketType.ChangeGroupPacket,
            payload: packet.payload.changeGroup,
          };
        case ProtoType.DeleteGroup:
          return {
            packet: PacketType.DeleteGroupPacket,
            payload: packet.payload.deleteGroup,
          };
        case ProtoType.AddBlockToGroup:
          return {
            packet: PacketType.AddBlockToGroupPacket,
            payload: packet.payload.addBlockToGroup,
          };
        case ProtoType.RemoveBlockFromGroup:
          return {
            packet: PacketType.RemoveBlockFromGroupPacket,
            payload: packet.payload.removeBlockFromGroup,
          };
        case ProtoType.CreateTrigger:
          return {
            packet: PacketType.CreateTriggerPacket,
            payload: packet.payload.createTrigger,
          };
        case ProtoType.ChangeTrigger:
          return {
            packet: PacketType.ChangeTriggerPacket,
            payload: packet.payload.changeTrigger,
          };
        case ProtoType.DeleteTrigger:
          return {
            packet: PacketType.DeleteTriggerPacket,
            payload: packet.payload.deleteTrigger,
          };
        case ProtoType.AddOperation:
          return {
            packet: PacketType.AddOperationPacket,
            payload: packet.payload.addOperation,
          };
        case ProtoType.EditOperation:
          return {
            packet: PacketType.EditOperationPacket,
            payload: packet.payload.editOperation,
          };
        case ProtoType.ReorderOperation:
          return {
            packet: PacketType.MoveOperationOrderPacket,
            payload: packet.payload.reorderOperation,
          };
        case ProtoType.RemoveOperation:
          return {
            packet: PacketType.RemoveOperationPacket,
            payload: packet.payload.removeOperation,
          };
        case ProtoType.PlayerData:
          return {
            packet: PacketType.PlayerDataPacket,
            payload: packet.payload.playerData,
          };
        case ProtoType.ActivateTrigger:
          return {
            packet: PacketType.ActivateTriggerPacket,
            payload: packet.payload.activateTrigger,
          };
        case ProtoType.AckPacket:
          return {
            packet: PacketType.AckResPacket,
            payload: packet.payload.ackPacket,
          };
        default:
          return {
            packet: PacketType.UnknownPacket,
            payload: {
              ...packet,
            },
          };
      }
    } catch {
      return undefined;
    }
  }
}
