import { Injectable } from '@nestjs/common';
import {
  PacketType as LegacyPacketType,
  type CommandsContext,
  Event,
  MapType as LegacyMapType,
  GameMode as LegacyGameMode,
} from '../types/multiplayer';
import { PacketManager } from './packet-manager.service';
import { WebSocket } from 'ws';
import { ProtoPacket } from '../types/proto.types';
import {
  Events,
  MapType,
  GameMode,
  PacketType,
} from 'src/generated/protos/multiplayer';
import { ProtobufManager } from './protobuf-manager.service';

@Injectable()
export class CompatibilityService {
  private readonly sockets: Map<string, WebSocket> = new Map();
  public context: CommandsContext | undefined;
  // playerId, socket

  constructor(
    private readonly legacyPacketManager: PacketManager,
    private readonly packetManager: ProtobufManager,
  ) {}

  async connectPlayer(playerId: string) {
    const socket = new WebSocket('wss://betonbrutal.com:55082');

    await new Promise<void>((resolve, reject) => {
      socket.addEventListener('open', () => {
        socket.send(
          this.legacyPacketManager.serialize({
            packet: LegacyPacketType.Version,
            version: 1,
          }),
        );
        resolve();
      });

      socket.addEventListener('error', (error) => {
        reject(Error(error.type));
      });
    });

    this.sockets.set(playerId, socket);
    this.handleConnection(socket, playerId);
  }

  disconnectPlayer(id: string) {
    const socket = this.sockets.get(id);

    if (socket) {
      socket.close();
      this.sockets.delete(id);
    }
  }

  sendPacket(packet: ProtoPacket, playerId: string) {
    const player = this.context!.players.get(playerId);
    const socket = this.sockets.get(playerId);

    if (!socket || !player) return;

    if (
      packet.packet !== PacketType.EventPacket &&
      packet.packet !== PacketType.MovePacket
    ) {
      console.log('packet sent:', packet);
    }

    switch (packet.packet) {
      // case PacketType.VersionPacket:
      //   socket.send(this.legacyPacketManager.serialize(packet));
      //   break;
      case PacketType.JoinPacket:
        socket.send(
          this.legacyPacketManager.serialize({
            packet: LegacyPacketType.Join,
            id: packet.payload.id,
            name: packet.payload.username,
            map:
              this.convertMapTypeL(packet.payload.mapMode) +
              packet.payload.mapId,
          }),
        );
        break;
      case PacketType.EventPacket:
        switch (packet.payload.type) {
          case Events.Ping:
            socket.send(
              this.legacyPacketManager.serialize({
                packet: LegacyPacketType.Event,
                signal: Event.Ping,
              }),
            );
            break;
          case Events.RunComplete:
            socket.send(
              this.legacyPacketManager.serialize({
                packet: LegacyPacketType.Event,
                signal: Event.RunComplete,
              }),
            );
        }
        break;
      case PacketType.MovePacket:
        socket.send(
          this.legacyPacketManager.serialize({
            packet: LegacyPacketType.Move,
            mode: this.convertGML(packet.payload.mode),
            position: packet.payload.position!,
            rotation: packet.payload.rotation!,
          }),
        );
        break;
      case PacketType.MapPacket:
        socket.send(
          this.legacyPacketManager.serialize({
            packet: LegacyPacketType.Map,
            map:
              this.convertMapTypeL(packet.payload.mode) + packet.payload.mapId,
          }),
        );
        break;
      case PacketType.LoadMapPacket:
        socket.send(
          this.legacyPacketManager.serialize({
            packet: LegacyPacketType.LoadMap,
            map:
              this.convertMapTypeL(packet.payload.mode) + packet.payload.mapId,
          }),
        );
        break;
      case PacketType.NicknamePacket:
        socket.send(
          this.legacyPacketManager.serialize({
            packet: LegacyPacketType.Nickname,
            id: packet.payload.id,
            nick: packet.payload.nickname,
          }),
        );
        break;
      case PacketType.MessagePacket:
        socket.send(
          this.legacyPacketManager.serialize({
            packet: LegacyPacketType.Message,
            message: packet.payload.message,
          }),
        );
        break;
      case PacketType.CommandPacket:
        if (player.proxyMode) {
          if (packet.payload.command?.includes('collab')) return;

          socket.send(
            this.legacyPacketManager.serialize({
              packet: LegacyPacketType.Command,
              command: packet.payload.command,
            }),
          );
        }
        break;
    }
  }

  private handleConnection(socket: WebSocket, id: string) {
    socket.on('message', (message) => {
      this.handleMessage(message as Buffer, id);
    });
  }

  private handleMessage(message: Buffer, playerId: string) {
    const packet = this.legacyPacketManager.deserialize(message, true);
    const player = this.context!.players.get(playerId);
    const ids = [...this.context!.players.keys()];
    // console.log('packet received:', packet);

    if (!packet || !player) return;

    if (
      packet.packet !== LegacyPacketType.Event &&
      packet.packet !== LegacyPacketType.Move
    ) {
      console.log('packet received:', packet);
      // console.log(this.packetManager.serialize(packet));
    }

    if (
      [
        // PacketType.Version,
        LegacyPacketType.Join,
        LegacyPacketType.Event,
        LegacyPacketType.Move,
        LegacyPacketType.Map,
        LegacyPacketType.LoadMap,
        LegacyPacketType.Nickname,
        LegacyPacketType.Message,
        LegacyPacketType.GetPlayers,
        LegacyPacketType.PlayersPing,
        LegacyPacketType.Command,
      ].includes(packet.packet)
    ) {
      if (
        packet.packet === LegacyPacketType.Event &&
        ![Event.Ping, Event.RunComplete].includes(packet.signal)
      ) {
        return;
      }

      if (packet.packet === LegacyPacketType.GetPlayers) {
        const data = [
          ...packet.players.filter((player) => !ids.includes(player.id)),
        ];

        console.log(data);

        player.socket.send(
          this.packetManager.serialize({
            packet: PacketType.GetPlayersPacket,
            payload: {
              players: data.map((player) => ({
                id: player.id,
                nickname: player.nick,
                mapMode: this.convertMapType(
                  player.map.slice(0, 1) as LegacyMapType,
                ),
                mapId: player.map.slice(1),
              })),
            },
          }),
        );
        return;
      }

      if (
        packet.packet === LegacyPacketType.Message &&
        ids.includes(packet.id!)
      ) {
        return;
      }

      switch (packet.packet) {
        case LegacyPacketType.Join:
          player.socket.send(
            this.packetManager.serialize({
              packet: PacketType.JoinPacket,
              payload: {
                id: packet.id,
                username: packet.name,
                mode: GameMode.MENU,
                mapMode: this.convertMapType(
                  packet.map.slice(0, 1) as LegacyMapType,
                ),
                mapId: packet.map.slice(1),
              },
            }),
          );
          break;
        case LegacyPacketType.Event:
          player.socket.send(
            this.packetManager.serialize({
              packet: PacketType.EventPacket,
              payload: {
                type: packet.signal as unknown as Events,
              },
            }),
          );
          break;
        case LegacyPacketType.Move:
          if (!packet.id) return;
          player.socket.send(
            this.packetManager.serialize({
              packet: PacketType.MovePacket,
              payload: {
                ...packet,
                id: packet.id,
                mode: this.convertGM(packet.mode),
              },
            }),
          );
          break;
        case LegacyPacketType.Map:
          if (!packet.id) return;
          player.socket.send(
            this.packetManager.serialize({
              packet: PacketType.MapPacket,
              payload: {
                id: packet.id,
                mode: this.convertMapType(
                  packet.map.slice(0, 1) as LegacyMapType,
                ),
                mapId: packet.map.slice(1),
              },
            }),
          );
          break;
        case LegacyPacketType.LoadMap:
          player.socket.send(
            this.packetManager.serialize({
              packet: PacketType.LoadMapPacket,
              payload: {
                id: player.id,
                mode: this.convertMapType(
                  packet.map.slice(0, 1) as LegacyMapType,
                ),
                mapId: packet.map.slice(1),
              },
            }),
          );
          break;
        case LegacyPacketType.Nickname:
          player.socket.send(
            this.packetManager.serialize({
              packet: PacketType.NicknamePacket,
              payload: { id: packet.id, nickname: packet.nick },
            }),
          );
          break;
        case LegacyPacketType.Message:
          if (!packet.id) return;
          player.socket.send(
            this.packetManager.serialize({
              packet: PacketType.MessagePacket,
              payload: { id: packet.id, message: packet.message },
            }),
          );
          break;
        case LegacyPacketType.PlayersPing:
          player.socket.send(
            this.packetManager.serialize({
              packet: PacketType.PlayersPingPacket,
              payload: { players: packet.players },
            }),
          );
          break;
        case LegacyPacketType.Command:
          if (player.proxyMode) {
            let data = packet.message?.split('\n');
            data = data?.filter((str) => !str.includes('collab'));
            data?.push('/cb - disable proxy mode');

            player.socket.send(
              this.packetManager.serialize({
                packet: PacketType.CommandPacket,
                payload: { message: data?.join('\n') },
              }),
            );
          }
          break;
      }
    }
  }

  private convertMapType(mode: LegacyMapType): MapType {
    switch (mode) {
      case LegacyMapType.MAIN:
        return MapType.MAIN;
      case LegacyMapType.CUSTOM:
        return MapType.CUSTOM;
      case LegacyMapType.EDITOR:
        return MapType.M_EDITOR;
      case LegacyMapType.HUB:
        return MapType.HUB;
      default:
        throw new Error('Failed to convert MapType');
    }
  }

  private convertMapTypeL(mode: MapType): LegacyMapType {
    switch (mode) {
      case MapType.MAIN:
        return LegacyMapType.MAIN;
      case MapType.CUSTOM:
        return LegacyMapType.CUSTOM;
      case MapType.M_EDITOR:
        return LegacyMapType.EDITOR;
      case MapType.HUB:
        return LegacyMapType.HUB;
      default:
        throw new Error('Failed to convert MapType');
    }
  }

  private convertGM(mode: LegacyGameMode): GameMode {
    switch (mode) {
      case LegacyGameMode.MENU:
        return GameMode.MENU;
      case LegacyGameMode.PLAY:
        return GameMode.PLAY;
      case LegacyGameMode.SCOUT:
        return GameMode.SCOUT;
      case LegacyGameMode.PRACTICE:
        return GameMode.PRACTICE;
      case LegacyGameMode.REPLAY:
        return GameMode.REPLAY;
      case LegacyGameMode.EDITOR:
        return GameMode.T_EDITOR;
      case LegacyGameMode.UNKNOWN:
        return GameMode.UNKNOWN;
      default:
        throw new Error('Failed to convert GameMode');
    }
  }

  private convertGML(mode: GameMode): LegacyGameMode {
    switch (mode) {
      case GameMode.MENU:
        return LegacyGameMode.MENU;
      case GameMode.PLAY:
        return LegacyGameMode.PLAY;
      case GameMode.SCOUT:
        return LegacyGameMode.SCOUT;
      case GameMode.PRACTICE:
        return LegacyGameMode.PRACTICE;
      case GameMode.REPLAY:
        return LegacyGameMode.REPLAY;
      case GameMode.T_EDITOR:
        return LegacyGameMode.EDITOR;
      case GameMode.UNKNOWN:
        return LegacyGameMode.UNKNOWN;
      default:
        throw new Error('Failed to convert GameMode');
    }
  }
}
