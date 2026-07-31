import { Injectable } from '@nestjs/common';
import {
  PacketType as LegacyPacketType,
  type CommandsContext,
  Event,
  MapType as LegacyMapType,
  GameMode as LegacyGameMode,
  Ref,
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
  private readonly proxyPlayers: Map<
    string,
    {
      nickname: Ref<string>;
      mapType?: Ref<MapType | undefined>;
      mode?: Ref<MapType | undefined>;
    }
  > = new Map();
  public context: CommandsContext | undefined;
  // playerId, socket

  constructor(
    private readonly legacyPacketManager: PacketManager,
    private readonly packetManager: ProtobufManager,
  ) {}

  async connectPlayer(playerId: string) {
    // return;
    // wss://betonbrutal.com:55071 - exp
    // wss://betonbrutal.com:55082 - dev
    const socket = new WebSocket('wss://betonbrutal.com:55071');

    await new Promise<void>((resolve, reject) => {
      const player = this.context!.players.get(playerId)!;
      socket.addEventListener('open', () => {
        socket.send(
          this.legacyPacketManager.serialize({
            packet: LegacyPacketType.Version,
            version: 1,
          }),
        );

        socket.send(
          this.legacyPacketManager.serialize({
            packet: LegacyPacketType.Join,
            id: playerId,
            name: player?.nick.value ?? player.name,
            map:
              this.convertMapTypeL(
                this.context!.playerData.get(playerId)?.mapMode.value ??
                  MapType.MAIN,
              ) + player.map.value?.id,
          }),
        );
        resolve();
        this.sockets.set(playerId, socket);
        console.log('Client connected to compability server');
      });

      socket.addEventListener('error', (error) => {
        reject(new Error(error.message));
      });

      socket.addEventListener('close', (msg) => {
        console.log(
          `Client ${player.name} (${playerId}) disconnected from compability server:`,
          msg.reason,
        );
      });
    });
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

    switch (packet.packet) {
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
            console.log('Sent Run Complete event', packet);
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
            mode: this.convertGML(
              this.context!.playerData.get(playerId)!.mode.value,
            ),
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
              this.convertMapTypeL(
                this.context!.playerData.get(playerId)!.mapMode.value,
              ) + packet.payload.mapId,
          }),
        );
        break;
      case PacketType.LoadMapPacket:
        socket.send(
          this.legacyPacketManager.serialize({
            packet: LegacyPacketType.LoadMap,
            map:
              this.convertMapTypeL(
                this.context!.playerData.get(playerId)!.mapMode.value,
              ) + packet.payload.mapId,
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
          // console.log('here is packet', packet);
          socket.send(
            this.legacyPacketManager.serialize({
              packet: LegacyPacketType.Command,
              command: `${packet.payload.command}`,
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
    const socket = this.sockets.get(playerId);
    const ids = [...this.context!.players.keys()];
    let data: {
      id: string;
      nick?: string;
      map?: string;
      ping?: number;
    }[] = [];

    if (
      packet?.packet === LegacyPacketType.PlayersPing ||
      packet?.packet === LegacyPacketType.GetPlayers
    ) {
      data = [...packet.players.filter((player) => !ids.includes(player.id))];
    }

    if (!packet || !player) return;

    if (
      packet.packet !== LegacyPacketType.Event &&
      packet.packet !== LegacyPacketType.Move &&
      packet.packet !== LegacyPacketType.PlayersPing
    ) {
      console.log('packet received:', packet);
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
        LegacyPacketType.Disconnect,
      ].includes(packet.packet)
    ) {
      if (
        packet.packet === LegacyPacketType.Event &&
        ![Event.Ping, Event.RaceStart].includes(packet.signal)
      ) {
        return;
      }

      if (packet.packet === LegacyPacketType.GetPlayers) {
        for (const player of packet.players) {
          if (ids.includes(player.id)) continue;
          this.proxyPlayers.set(player.id, {
            nickname: new Ref(player.nick),
            mapType: new Ref<MapType | undefined>(
              this.convertMapType(player.map.slice(0, 1) as LegacyMapType),
            ),
          });
        }

        return player.socket.send(
          this.packetManager.serialize({
            packet: PacketType.GetPlayersPacket,
            payload: {
              players: data.map((player) => ({
                id: player.id,
                nickname: player.nick!,
                mapMode: this.convertMapType(
                  player.map!.slice(0, 1) as LegacyMapType,
                ),
                mapId: player.map!.slice(1),
                playerColor: { r: 0.5, g: 0.5, b: 0.5, a: 1 },
              })),
            },
          }),
        );
      }

      if (
        packet.packet === LegacyPacketType.Message &&
        ids.includes(packet.id!)
      ) {
        return;
      }

      switch (packet.packet) {
        case LegacyPacketType.Join:
          if (ids.includes(packet.id)) return;
          this.proxyPlayers.set(player.id, {
            nickname: new Ref(packet.name),
            mapType: new Ref<MapType | undefined>(
              this.convertMapType(packet.map.slice(0, 1) as LegacyMapType),
            ),
          });

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
                mapName: !Number(packet.map.slice(1))
                  ? packet.map.slice(1)
                  : undefined,
              },
            }),
          );
          this.sendPrivateMessage(
            player.id,
            `Player ${packet.name} joined the server`,
          );
          break;
        case LegacyPacketType.Event:
          switch (packet.signal) {
            case Event.Ping:
              socket?.send(
                this.legacyPacketManager.serialize({
                  packet: LegacyPacketType.Event,
                  signal: Event.Ping,
                }),
              );
              break;
            case Event.RaceStart:
              player.socket.send(
                this.packetManager.serialize({
                  packet: PacketType.EventPacket,
                  payload: {
                    type: Events.RaceStart,
                  },
                }),
              );
              player.socket.send(
                this.packetManager.serialize({
                  packet: PacketType.CommandPacket,
                  payload: {
                    message: 'Race has started, GO!',
                  },
                }),
              );
              break;
          }
          break;
        case LegacyPacketType.Move:
          if (!packet.id) return;
          if (!this.proxyPlayers.has(packet.id)) return;
          player.socket.send(
            this.packetManager.serialize({
              packet: PacketType.MovePacket,
              payload: {
                ...packet,
                id: packet.id,
              },
            }),
          );
          break;
        case LegacyPacketType.Map:
          if (!packet.id) return;
          if (packet.id === player.id) return;
          if (!ids.includes(packet.id)) {
            const proxyPlayer = this.proxyPlayers.get(packet.id)!;
            proxyPlayer?.mapType?.set(
              this.convertMapType(packet.map.slice(0, 1) as LegacyMapType),
            );
          }
          player.socket.send(
            this.packetManager.serialize({
              packet: PacketType.MapPacket,
              payload: {
                id: packet.id,
                mapId: packet.map.slice(1),
              },
            }),
          );
          console.log(
            'Maptype:',
            this.proxyPlayers.get(packet.id)?.mapType?.value,
          );
          player.socket.send(
            this.packetManager.serialize({
              packet: PacketType.PlayerDataPacket,
              payload: {
                id: packet.id,
                mapMode:
                  this.proxyPlayers.get(packet.id)?.mapType?.value ??
                  MapType.CUSTOM,
                mode: GameMode.PLAY,
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
              payload: {
                players: data.map((player) => ({
                  id: player.id,
                  ping: player.ping!,
                })),
              },
            }),
          );
          break;
        case LegacyPacketType.Command:
          if (player.proxyMode) {
            let data = packet.command?.split('\n');
            if (packet.command?.includes('help')) {
              data = data?.filter((str) => !str.includes('collab'));
              data?.push('/compatibility (or /cb|/proxy) - disable proxy mode');
            }

            player.socket.send(
              this.packetManager.serialize({
                packet: PacketType.CommandPacket,
                payload: { message: data?.join('\n') },
              }),
            );
          }
          break;
        case LegacyPacketType.Disconnect:
          if (!this.proxyPlayers.has(packet.id)) return;
          player.socket.send(
            this.packetManager.serialize({
              packet: PacketType.DisconnectPacket,
              payload: { id: packet.id },
            }),
          );
          this.sendPrivateMessage(
            player.id,
            `Player ${this.proxyPlayers.get(packet.id)?.nickname.value} left the server`,
          );
          this.proxyPlayers.delete(packet.id);
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

  private sendPrivateMessage(playerId: string, message: string) {
    const player = this.context?.players.get(playerId);

    if (!player) return;

    player.socket.send(
      this.packetManager.serialize({
        packet: PacketType.CommandPacket,
        payload: { message },
      }),
    );
  }
}
