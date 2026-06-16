import { Injectable, Logger } from '@nestjs/common';
import { PacketSerializer } from '../infrastructure/packet/packet.serializer';
import { PacketDeserializer } from '../infrastructure/packet/packet.deserializer';
import { PacketData } from '../types/packet.types';
import { PacketType, GameMode, Vector3, Color } from '../types/multiplayer';

@Injectable()
export class PacketManager {
  private readonly logger = new Logger(PacketManager.name);

  public serialize(data: PacketData): Buffer<ArrayBuffer> {
    const serializer = new PacketSerializer(0, new Uint8Array());
    serializer.writeUInt8(data.packet);
    this.serializePayload(serializer, data);
    return Buffer.from(serializer.buffer.subarray(0, serializer.offset));
  }

  public deserialize(buffer: Buffer): PacketData | undefined {
    if (buffer.length < 1) {
      this.logger.warn('Packet buffer is too short');
      return;
    }

    const packetTypeByte = buffer.readUInt8(0);
    const packet = packetTypeByte as PacketType;
    const deserializer = new PacketDeserializer(1);
    const payload = this.deserializePayload(packet, deserializer, buffer);

    if (!payload) {
      this.logger.warn(
        `Failed to deserialize payload for packet type: ${packet}`,
      );
      return;
    }

    return payload;
  }

  private serializePayload(
    serializer: PacketSerializer,
    data: PacketData,
  ): void {
    switch (data.packet) {
      case PacketType.Version:
        serializer.writeUInt8(data.version);
        return;

      case PacketType.Event:
        serializer.writeUInt8(data.signal);
        return;

      case PacketType.Join:
        serializer.writeUInt64(data.id);
        serializer.writeString(data.name);
        serializer.writeString(data.map);
        return;

      case PacketType.GetPlayers:
        serializer.writeUInt32(data.players.length);
        for (const player of data.players) {
          serializer.writeUInt64(player.id);
          serializer.writeString(player.nick);
          serializer.writeString(player.map);
        }
        return;

      case PacketType.Disconnect:
        serializer.writeUInt64(data.id);
        return;

      case PacketType.Nickname:
        serializer.writeUInt64(data.id);
        serializer.writeString(data.nick);
        return;

      case PacketType.BodyColor:
        serializer.writeUInt64(data.id);
        serializer.writeUInt8(data.color);
        this.writeColor(
          serializer,
          data.customColor ?? { r: 0, g: 0, b: 0, a: 1 },
        );
        return;

      case PacketType.Move:
        serializer.writeUInt64(data.id!);
        this.writeGameMode(serializer, data.mode);
        this.writeVector3(serializer, data.position);
        this.writeVector3(serializer, data.rotation);
        return;

      case PacketType.GameMode:
        serializer.writeUInt64(data.id);
        this.writeGameMode(serializer, data.mode);
        return;

      case PacketType.Map:
        serializer.writeUInt64(data.id!);
        serializer.writeString(data.map);
        return;

      case PacketType.Message:
        serializer.writeUInt64(data.id!);
        serializer.writeString(data.message);
        return;

      case PacketType.Command:
        serializer.writeString(data.message ?? '');
        return;

      case PacketType.PlayersPing:
        serializer.writeUInt16(data.players.length);
        for (const player of data.players) {
          serializer.writeUInt64(player.id);
          serializer.writeUInt16(player.ping);
        }
        return;

      case PacketType.LoadMap:
        serializer.writeString(data.map);
        return;

      case PacketType.PlaceBlock:
        serializer.writeGuid(data.instanceID);
        serializer.writeInt32(data.blockID);
        this.writeVector3(serializer, data.position);
        this.writeVector3(serializer, data.rotation);
        serializer.writeFloat(data.scale);
        serializer.writeUInt8(data.color);
        this.writeColor(serializer, data.customColor);
        return;

      case PacketType.DeleteBlock:
        serializer.writeGuid(data.instanceID);
        return;

      case PacketType.PaintBlock:
        serializer.writeGuid(data.instanceID);
        serializer.writeUInt8(data.color);
        this.writeColor(serializer, data.customColor);
        return;

      case PacketType.MoveBlock:
        serializer.writeGuid(data.instanceID);
        this.writeVector3(serializer, data.position);
        this.writeVector3(serializer, data.rotation);
        serializer.writeFloat(data.scale);
        return;

      case PacketType.MapSettings:
        serializer.writeUInt8(data.settings);
        serializer.writeUInt8(data.state ? 1 : 0);
        return;

      case PacketType.MapColor:
        serializer.writeUInt8(data.settings);
        this.writeColor(serializer, data.color);
        return;

      default:
        this.logger.warn(
          `Unsupported packet type: ${(data as PacketData).packet}`,
        );
        return;
    }
  }

  private deserializePayload(
    packet: PacketType,
    deserializer: PacketDeserializer,
    buffer: Buffer,
  ): PacketData | undefined {
    switch (packet) {
      case PacketType.Version:
        return {
          packet,
          version: deserializer.readUInt8(buffer),
        };

      case PacketType.Event:
        return {
          packet,
          signal: deserializer.readUInt8(buffer),
        };

      case PacketType.Join:
        return {
          packet,
          id: deserializer.readUInt64(buffer),
          name: deserializer.readString(buffer),
          map: deserializer.readString(buffer),
        };

      case PacketType.GetPlayers:
        return {
          packet,
          players: Array.from(
            { length: deserializer.readUInt32(buffer) },
            () => ({
              id: deserializer.readUInt64(buffer),
              nick: deserializer.readString(buffer),
              map: deserializer.readString(buffer),
            }),
          ),
        };

      case PacketType.Disconnect:
        return {
          packet,
          id: deserializer.readUInt64(buffer),
        };

      case PacketType.Nickname:
        return {
          packet,
          id: deserializer.readUInt64(buffer),
          nick: deserializer.readString(buffer),
        };

      case PacketType.BodyColor:
        return {
          packet,
          id: deserializer.readUInt64(buffer),
          color: deserializer.readUInt8(buffer),
          customColor: this.readColor(deserializer, buffer),
        };

      case PacketType.Move:
        return {
          packet,
          // client Move packet has no id (sent by client), server associates sender by socket
          mode: this.readGameMode(deserializer, buffer),
          position: deserializer.readVector3(buffer),
          rotation: deserializer.readVector3(buffer),
        };

      case PacketType.GameMode:
        return {
          packet,
          id: deserializer.readUInt64(buffer),
          mode: this.readGameMode(deserializer, buffer),
        };

      case PacketType.Map:
        return {
          packet,
          // id: deserializer.readUInt64(buffer),
          map: deserializer.readString(buffer),
        };

      case PacketType.Message:
        return {
          packet,
          // id: deserializer.readUInt64(buffer),
          message: deserializer.readString(buffer),
        };

      case PacketType.Command:
        return {
          packet,
          command: deserializer.readString(buffer),
        };

      case PacketType.PlayersPing:
        return {
          packet,
          players: Array.from(
            { length: deserializer.readUInt16(buffer) },
            () => ({
              id: deserializer.readUInt64(buffer),
              ping: deserializer.readUInt16(buffer),
            }),
          ),
        };

      case PacketType.LoadMap:
        return {
          packet,
          map: deserializer.readString(buffer),
        };

      case PacketType.PlaceBlock:
        return {
          packet,
          instanceID: deserializer.readGuid(buffer),
          blockID: deserializer.readInt32(buffer),
          position: deserializer.readVector3(buffer),
          rotation: deserializer.readVector3(buffer),
          scale: deserializer.readFloat(buffer),
          color: deserializer.readUInt8(buffer),
          customColor: this.readColor(deserializer, buffer),
        };

      case PacketType.DeleteBlock:
        return {
          packet,
          instanceID: deserializer.readGuid(buffer),
        };

      case PacketType.PaintBlock:
        return {
          packet,
          instanceID: deserializer.readGuid(buffer),
          color: deserializer.readUInt8(buffer),
          customColor: this.readColor(deserializer, buffer),
        };

      case PacketType.MoveBlock:
        return {
          packet,
          instanceID: deserializer.readGuid(buffer),
          position: deserializer.readVector3(buffer),
          rotation: deserializer.readVector3(buffer),
          scale: deserializer.readFloat(buffer),
        };

      case PacketType.MapSettings:
        return {
          packet,
          settings: deserializer.readUInt8(buffer),
          state: deserializer.readUInt8(buffer) === 1,
        };

      case PacketType.MapColor:
        return {
          packet,
          settings: deserializer.readUInt8(buffer),
          color: this.readColor(deserializer, buffer),
        };

      default:
        this.logger.warn(`Unsupported packet type: `, packet);
        return;
    }
  }

  private writeGameMode(serializer: PacketSerializer, mode: GameMode): void {
    const key = Object.values(GameMode).indexOf(mode);
    if (key === -1) {
      throw new Error(`Unsupported game mode: ${mode}`);
    }
    serializer.writeUInt8(key);
  }

  private readGameMode(
    deserializer: PacketDeserializer,
    buffer: Buffer,
  ): GameMode {
    const index = deserializer.readUInt8(buffer);
    const values = Object.values(GameMode) as GameMode[];
    return values[index] ?? GameMode.UNKNOWN;
  }

  private writeVector3(serializer: PacketSerializer, value: Vector3): void {
    serializer.writeFloat(value.x);
    serializer.writeFloat(value.y);
    serializer.writeFloat(value.z);
  }

  private writeColor(serializer: PacketSerializer, value: Color): void {
    serializer.writeFloat(value.r);
    serializer.writeFloat(value.g);
    serializer.writeFloat(value.b);
  }

  private readColor(deserializer: PacketDeserializer, buffer: Buffer): Color {
    return {
      r: deserializer.readFloat(buffer),
      g: deserializer.readFloat(buffer),
      b: deserializer.readFloat(buffer),
      a: 1,
    };
  }
}
