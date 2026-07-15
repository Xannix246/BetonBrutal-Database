import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { WebSocket } from 'ws';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CommandsService } from './commands.service';
import {
  C,
  MapSession,
  Ref,
  SessionCollab,
  SessionPlayer,
  SessionPlayerData,
  SessionRace,
} from '../types/multiplayer';
import { CompatibilityService } from './compatibility.service';
import { ProtoPacket } from '../types/proto.types';
import { ProtobufManager } from './protobuf-manager.service';
import { PacketType } from 'src/generated/protos/multiplayer';
import * as Proto from 'src/generated/protos/multiplayer';

@Injectable()
export class MultiplayerService implements OnModuleInit {
  private readonly logger = new Logger(MultiplayerService.name);
  private readonly mapRecords: Record<string, string>[] = [];

  public readonly players: Map<string, SessionPlayer> = new Map();
  public readonly playerData: Map<string, SessionPlayerData> = new Map();
  public readonly mapSessions: Map<string, MapSession> = new Map();
  public readonly raceSessions: Map<string, SessionRace> = new Map();
  public readonly collabSessions: Map<string, SessionCollab> = new Map();
  public readonly asyncPackets: Map<string, (value: void) => void> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly packetManager: ProtobufManager,
    private readonly commands: CommandsService,
    private readonly csm: CompatibilityService,
  ) {
    csm.context = {
      players: this.players,
      playerData: this.playerData,
      mapSessions: this.mapSessions,
      mapRecords: this.mapRecords,
      raceSessions: this.raceSessions,
      collabSessions: this.collabSessions,
      asyncPackets: this.asyncPackets,
    };
  }

  async onModuleInit() {
    const maps = await this.prisma.workshopItem.findMany({
      select: {
        id: true,
        title: true,
      },
    });

    for (const map of maps) {
      this.mapRecords.push({ id: map.id, name: map.title });
    }
  }

  broadcastPacket(
    packet: ProtoPacket,
    ignorePlayers: string[] = [],
    receivers?: string[],
  ) {
    for (const player of this.players) {
      if (receivers && receivers.length === 0) return;
      if (
        ignorePlayers.includes(player[0]) ||
        (receivers && receivers.length > 0 && !receivers.includes(player[0]))
      ) {
        continue;
      }

      player[1].socket.send(this.packetManager.serialize(packet));
    }
  }

  broadcastServer(message: string, players?: string[]) {
    this.broadcastPacket(
      {
        packet: PacketType.CommandPacket,
        payload: { message },
      },
      [],
      players,
    );
  }

  sendPrivateMessage(player: SessionPlayer, message: string) {
    player.socket.send(
      this.packetManager.serialize({
        packet: PacketType.CommandPacket,
        payload: { message },
      }),
    );
  }

  sendEvent(player: SessionPlayer, event: Proto.Events) {
    player.socket.send(
      this.packetManager.serialize({
        packet: PacketType.EventPacket,
        payload: { type: event },
      }),
    );
  }

  handleAckPacket(packet: Proto.AckPacket) {
    if (this.asyncPackets.has(packet.id)) {
      this.asyncPackets.get(packet.id)!();
      this.asyncPackets.delete(packet.id);
    }
  }

  getVersion(socket: WebSocket, packet: Proto.Version) {
    socket.send(
      this.packetManager.serialize({
        packet: PacketType.VersionPacket,
        payload: { version: packet.version },
      }),
    );
  }

  async join(
    socket: WebSocket,
    setPlayer: (p: SessionPlayer) => void,
    packet: Proto.Join,
  ) {
    if (this.players.has(packet.id)) {
      console.log(packet);
      console.log('This player already exists!');
      // return socket.close();
      return;
    }

    const player: SessionPlayer = {
      id: packet.id,
      nick: packet.username,
      name: packet.username,
      socket,
      ping: {
        lastSync: new Date(),
        latencyMs: 0,
      },
      mapId: packet.mapId,
      color: { r: 0.5, g: 0.5, b: 0.5, a: 1 },
    };

    const data: SessionPlayerData = {
      mode: new Ref(packet.mode),
      mapMode: new Ref(packet.mapMode),
      position: new Ref({ x: 0, y: 0, z: 0 }),
      rotation: new Ref({ x: 0, y: 0, z: 0 }),
    };

    setPlayer(player);
    this.players.set(packet.id, player);
    this.playerData.set(packet.id, data);
    this.broadcastPacket(
      {
        packet: PacketType.JoinPacket,
        payload: {
          id: player.id,
          username: player.name,
          mode: packet.mode,
          mapId: player.mapId!,
          mapMode: packet.mapMode,
          mapName:
            this.mapRecords.find((record) => record.id === player.mapId)
              ?.name ?? packet.mapName,
        },
      },
      [player.id],
    );

    this.joinMap(player, {
      id: player.id,
      mapId: packet.mapId,
    } satisfies Proto.Map);

    socket.send(
      this.packetManager.serialize({
        packet: PacketType.GetPlayersPacket,
        payload: {
          players: [...this.players.values()].map((player) => {
            return {
              id: player.id,
              nickname: player.name,
              mode: this.playerData.get(player.id)?.mode.value,
              mapId: player.mapId!,
              mapMode:
                this.playerData.get(player.id)?.mapMode.value ??
                Proto.MapType.MAIN,
              mapName:
                this.mapRecords.find((record) => record.id === player.mapId)
                  ?.name ?? player.mapId,
              playerColor: player.color,
            };
          }),
        },
      }),
    );

    try {
      await this.csm.connectPlayer(player.id);
    } catch (err) {
      this.logger.warn('Connection failed in compatibility service', err);
    }

    this.csm.sendPacket(
      { packet: PacketType.JoinPacket, payload: packet },
      player.id,
    );

    this.broadcastServer(
      `Player ${player.nick} <color=${C.green}>joined</color> the server`,
      [...this.players.values()]
        .filter((p) => p.id !== packet.id)
        .map((p) => p.id),
    );

    this.logger.log(`${packet.username} joined the server`);
  }

  playerMove(player: SessionPlayer, packet: Proto.Move) {
    if (!player.mapId) return;
    const map = this.mapSessions.get(player.mapId);
    const playerData = this.playerData.get(player.id);

    if (!map || !playerData) return;

    playerData.position.set(packet.position!);
    playerData.rotation.set(packet.rotation!);

    // this.playerData.set(player.id, data);
    this.broadcastPacket(
      {
        packet: PacketType.MovePacket,
        payload: { id: player.id, ...packet },
      },
      [player.id],
      [...map.players],
    );

    this.csm.sendPacket(
      { packet: PacketType.MovePacket, payload: packet },
      player.id,
    );
  }

  updatePlayerData(player: SessionPlayer, packet: Proto.PlayerData) {
    let playerData = this.playerData.get(player.id);

    if (!playerData) {
      console.log('PlayerData not found!');
      playerData = {
        mode: new Ref<Proto.GameMode>(Proto.GameMode.PLAY),
        mapMode: new Ref<Proto.MapType>(Proto.MapType.MAIN),
        position: new Ref({ x: 0, y: 0, z: 0 }),
        rotation: new Ref({ x: 0, y: 0, z: 0 }),
      };

      this.playerData.set(player.id, playerData);
    }

    playerData.mode.set(packet.mode);
    playerData.mapMode.set(packet.mapMode);

    // console.log(`Broadcasting playerData:`, playerData);

    this.broadcastPacket({
      packet: PacketType.PlayerDataPacket,
      payload: packet,
    });
  }

  setColor(player: SessionPlayer, packet: Proto.BodyColor) {
    player.color = packet.customColor;

    this.players.set(player.id, player);

    const readyPacket: ProtoPacket = {
      packet: PacketType.BodyColorPacket,
      payload: packet,
    };

    this.broadcastPacket(readyPacket);
    this.csm.sendPacket(readyPacket, player.id);
  }

  joinMap(player: SessionPlayer, packet: Proto.Map) {
    // if (!packet.mapId) return;
    const collab = this.collabSessions.get(player.collabId ?? '');
    const race = this.raceSessions.get(player.raceId ?? '');
    let map = this.mapSessions.get(packet.mapId);

    if (player.mapId) {
      const map = this.mapSessions.get(player.mapId);
      if (map) {
        map.players.delete(player.id);
      }
    }

    if (!map) {
      map = {
        id: packet.mapId,
        players: new Set(),
      };
    }

    if (collab) {
      if (collab.ownerId === player.id) {
        this.closeCollab(collab.id);
      } else {
        this.broadcastServer(
          `<color=${C.yellow}>${player.nick} left the collab`,
          [...collab.players],
        );
        collab.players.delete(player.id);
      }
    }

    if (race) {
      this.broadcastServer(`<color=${C.yellow}>${player.nick} left the race`, [
        ...race.players,
      ]);
      race.players.delete(player.id);
      if (race.players.size === 0) {
        this.raceSessions.delete(race.id);
      }
    }

    player.mapId = packet.mapId;
    player.collabId = undefined;
    player.raceId = undefined;
    map.players.add(player.id);
    this.players.set(player.id, player);
    this.mapSessions.set(map.id, map);

    this.broadcastPacket({
      packet: PacketType.MapPacket,
      payload: { id: player.id, mapId: packet.mapId },
    });

    this.csm.sendPacket(
      { packet: PacketType.MapPacket, payload: packet },
      player.id,
    );

    this.logger.log(`${player.name} joined map: ${map.id}`);
  }

  sendMessage(player: SessionPlayer, packet: Proto.Message) {
    this.broadcastPacket({
      packet: PacketType.MessagePacket,
      payload: {
        id: player.id,
        message: `<color=${C.yellow}>${player.nick ?? player.name}</color>: ${packet.message}`,
      },
    });

    this.csm.sendPacket(
      { packet: PacketType.MessagePacket, payload: packet },
      player.id,
    );
  }

  async sendCommand(player: SessionPlayer, packet: Proto.Command) {
    if (
      player.proxyMode &&
      !['/compatibility', '/cb', '/proxy'].includes(packet.command!)
    ) {
      return this.csm.sendPacket(
        { packet: PacketType.CommandPacket, payload: packet },
        player.id,
      );
    }

    await this.commands.executeCommand(player, packet.command!, {
      players: this.players,
      playerData: this.playerData,
      mapSessions: this.mapSessions,
      raceSessions: this.raceSessions,
      collabSessions: this.collabSessions,
      mapRecords: this.mapRecords,
      asyncPackets: this.asyncPackets,
    });
  }

  onDisconnect(playerId: string) {
    const player = this.players.get(playerId);

    if (!player) return;

    const collabs = [...this.collabSessions.values()];
    const collab = collabs.find((collab) => collab.players.has(playerId));
    if (collab) {
      collab.players.delete(playerId);
      if (collab.players.size === 0 || collab.ownerId === playerId) {
        this.closeCollab(collab.id);
      }
    }

    const races = [...this.raceSessions.values()];
    const race = races.find((race) => race.players.has(playerId));
    if (race) {
      race.players.delete(playerId);
      if (race.players.size === 0) {
        this.raceSessions.delete(race.id);
      }
    }

    const map = this.mapSessions.get(player.mapId ?? '');
    if (map) {
      map.players.delete(playerId);
    }

    this.broadcastPacket({
      packet: PacketType.DisconnectPacket,
      payload: { id: playerId },
    });

    this.csm.disconnectPlayer(playerId);
    this.players.delete(playerId);
    this.broadcastServer(
      `Player ${player?.nick} <color=${C.red}>left</color> the server`,
    );
  }

  private closeCollab(collabId: string) {
    const collab = this.collabSessions.get(collabId);

    if (!collab) return;

    for (const playerId of collab.players) {
      const player = this.players.get(playerId)!;

      player.collabId = undefined;
      this.players.set(playerId, player);
      this.sendEvent(player, Proto.Events.CloseCollab);
    }

    this.broadcastServer(`<color=${C.yellow}>Collab has been closed`, [
      ...collab.players,
    ]);

    this.collabSessions.delete(collab.id);
  }
}
