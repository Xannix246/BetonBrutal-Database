import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { WebSocket } from 'ws';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CommandsService } from './commands.service';
import {
  MapSession,
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
    };

    await this.csm.connectPlayer(player.id);

    setPlayer(player);
    this.players.set(packet.id, player);
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

    socket.send(
      this.packetManager.serialize({
        packet: PacketType.GetPlayersPacket,
        payload: {
          players: [...this.players.values()].map((player) => {
            return {
              id: player.id,
              nickname: player.name,
              mode: packet.mode,
              mapId: player.mapId!,
              mapMode: packet.mapMode,
              mapName:
                this.mapRecords.find((record) => record.id === player.mapId)
                  ?.name ?? player.mapId,
            };
          }),
        },
      }),
    );

    this.csm.sendPacket(
      { packet: PacketType.JoinPacket, payload: packet },
      player.id,
    );

    this.joinMap(player, {
      id: player.id,
      mode: packet.mapMode,
      mapId: packet.mapId,
    } satisfies Proto.Map);

    this.logger.log(`${packet.username} joined the server`);
    console.log(this.mapSessions);
  }

  playerMove(player: SessionPlayer, packet: Proto.Move) {
    if (!player.mapId) return;

    const map = this.mapSessions.get(player.mapId)!;
    const data: SessionPlayerData = {
      mode: packet.mode,
      position: packet.position!,
      rotation: packet.rotation!,
      packetId: packet.packetId,
    };

    this.playerData.set(player.id, data);

    this.broadcastPacket(
      {
        packet: PacketType.MovePacket,
        payload: { id: player.id, ...data },
      },
      [player.id],
      [...map.players],
    );

    this.csm.sendPacket(
      { packet: PacketType.MovePacket, payload: packet },
      player.id,
    );
  }

  joinMap(player: SessionPlayer, packet: Proto.Map) {
    // if (!packet.mapId) return;
    let map = this.mapSessions.get(packet.mapId);

    if (player.mapId) {
      const map = this.mapSessions.get(player.mapId);
      if (map) {
        map.players.delete(player.id);

        if (map.players.size === 0) {
          this.mapSessions.delete(map.id);
        } else {
          this.mapSessions.set(map.id, map);
        }
      }
    }

    if (!map) {
      map = {
        id: packet.mapId,
        type: packet.mode,
        players: new Set(),
        settings: [],
      };
    }

    player.mapId = packet.mapId;
    this.players.set(player.id, player);

    map.players.add(player.id);
    this.mapSessions.set(packet.mapId, map);

    console.log('JoinMapData', {
      id: player.id,
      mode: packet.mode,
      mapId: packet.mapId,
    });

    this.broadcastPacket({
      packet: PacketType.MapPacket,
      payload: { id: player.id, mode: packet.mode, mapId: packet.mapId },
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
        message: `${player.nick ?? player.name}: ${packet.message}`,
      },
    });

    this.csm.sendPacket(
      { packet: PacketType.MessagePacket, payload: packet },
      player.id,
    );
  }

  async sendCommand(player: SessionPlayer, packet: Proto.Command) {
    console.log('got command', packet.command);
    if (
      player.proxyMode &&
      !['compatibility', 'cb', 'proxy'].includes(packet.command!)
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
    });
  }

  onDisconnect(playerId: string) {
    const player = this.players.get(playerId);

    if (!player) return;

    this.players.delete(playerId);
    const collabs = [...this.collabSessions.values()];
    const collab = collabs.find((collab) => collab.players.includes(playerId));

    if (collab) {
      collab.players = collab.players.filter((id) => id !== playerId) ?? [];
      if (collab.players.length === 0 || collab.ownerId === playerId) {
        this.collabSessions.delete(collab.id);
      } else {
        this.collabSessions.set(collab.id, collab);
      }
    }

    const races = [...this.raceSessions.values()];
    const race = races.find((race) => race.players.includes(playerId));

    if (race) {
      race.players = race.players.filter((id) => id !== playerId);
      if (race.players.length === 0) {
        this.raceSessions.delete(race.id);
      } else {
        this.raceSessions.set(race.id, race);
      }
    }

    const maps = [...this.mapSessions.values()];
    const map = maps.find((map) => map.players.has(playerId));

    if (map) {
      map.players.delete(playerId);
      if (map.players.size === 0) {
        this.mapSessions.delete(map.id);
      } else {
        this.mapSessions.set(map.id, map);
      }
    }

    this.broadcastPacket({
      packet: PacketType.DisconnectPacket,
      payload: { id: playerId },
    });

    this.csm.disconnectPlayer(playerId);
    this.csm.sendPacket(
      {
        packet: PacketType.DisconnectPacket,
        payload: { id: playerId },
      },
      playerId,
    );

    this.broadcastServer(`Player ${player?.nick} left the server`);
  }
}
