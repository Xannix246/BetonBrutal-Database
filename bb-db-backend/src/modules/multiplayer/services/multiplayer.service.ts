import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { WebSocket } from 'ws';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { PacketManager } from './packet-manager.service';
import { CommandsService } from './commands.service';
import {
  Event,
  MapSession,
  MapType,
  PacketType,
  SessionCollab,
  SessionPlayer,
  SessionPlayerData,
  SessionRace,
} from '../types/multiplayer';
import {
  CommandPacket,
  DeleteBlockPacket,
  MapColorPacket,
  MapPacket,
  MapSettingsPacket,
  MessagePacket,
  MoveBlockPacket,
  MovePacket,
  PacketData,
  PaintBlockPacket,
  PlaceBlockPacket,
  PlayerJoinPacket,
  VersionPacket,
} from '../types/packet.types';

@Injectable()
export class MultiplayerService implements OnModuleInit {
  private readonly logger = new Logger(MultiplayerService.name);
  private readonly mapRecords: Record<string, string>[] = [];

  public players: Map<string, SessionPlayer> = new Map();
  public playerData: Map<string, SessionPlayerData> = new Map();
  public mapSessions: Map<string, MapSession> = new Map();
  public raceSessions: Map<string, SessionRace> = new Map();
  public collabSessions: Map<string, SessionCollab> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly packetManager: PacketManager,
    private readonly commands: CommandsService,
  ) {}

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
    packet: PacketData,
    ignorePlayers: string[] = [],
    receivers?: string[],
  ) {
    for (const player of this.players) {
      if (
        ignorePlayers.includes(player[0]) ||
        (receivers && !receivers.includes(player[0]))
      ) {
        continue;
      }

      player[1].socket.send(this.packetManager.serialize(packet));
    }
  }

  broadcastServer(message: string, players: string[]) {
    this.broadcastPacket(
      {
        packet: PacketType.Command,
        message: message,
      },
      [],
      players,
    );
  }

  sendPrivateMessage(player: SessionPlayer, message: string) {
    player.socket.send(
      this.packetManager.serialize({
        packet: PacketType.Command,
        message,
      }),
    );
  }

  getVersion(socket: WebSocket, packet: VersionPacket) {
    socket.send(
      this.packetManager.serialize({
        packet: PacketType.Version,
        version: packet.version,
      }),
    );
  }

  join(
    socket: WebSocket,
    setPlayer: (p: SessionPlayer) => void,
    packet: PlayerJoinPacket,
  ) {
    if (this.players.has(packet.id)) {
      return socket.close();
    }

    const player: SessionPlayer = {
      id: packet.id,
      nick: packet.name,
      name: packet.name,
      socket,
      ping: {
        lastSync: new Date(),
        latencyMs: 0,
      },
      mapId: packet.map,
    };

    setPlayer(player);
    this.players.set(packet.id, player);

    this.ping(player, socket);

    this.broadcastPacket(
      {
        packet: PacketType.Join,
        id: player.id,
        name: player.name,
        map:
          this.mapRecords.find((record) => record.id === player.mapId)?.name ??
          packet.map ??
          'unknown',
      },
      [player.id],
    );

    socket.send(
      this.packetManager.serialize({
        packet: PacketType.GetPlayers,
        players: [...this.players.values()].map((player) => {
          return {
            id: player.id,
            nick: player.name,
            map:
              this.mapRecords.find((record) => record.id === player.mapId)
                ?.name ??
              packet.map ??
              'unknown',
          };
        }),
      }),
    );

    this.logger.log(`${packet.name} joined the server`);
  }

  ping(player: SessionPlayer, socket: WebSocket) {
    socket.send(
      this.packetManager.serialize({
        packet: PacketType.Event,
        signal: Event.Ping,
      }),
    );

    const lastSync = player.ping.lastSync.valueOf();
    player.ping.lastSync = new Date();
    player.ping.latencyMs = player.ping.lastSync.valueOf() - lastSync;
  }

  playerMove(player: SessionPlayer, packet: MovePacket) {
    const data: SessionPlayerData = {
      mode: packet.mode,
      position: packet.position,
      rotation: packet.rotation,
    };

    this.playerData.set(player.id, data);

    this.broadcastPacket(
      {
        packet: PacketType.Move,
        id: player.id,
        ...data,
      },
      [player.id],
    );
  }

  joinMap(player: SessionPlayer, packet: MapPacket) {
    let map = this.mapSessions.get(packet.map);
    const mapType = packet.map.slice(0, 1) as MapType;

    if (!map) {
      map = {
        id: packet.map.slice(1),
        type: mapType,
        players: [],
        settings: [],
      };
    }

    map.players.push(player.id);
    this.mapSessions.set(packet.map, map);

    this.broadcastPacket({
      packet: PacketType.Map,
      id: player.id,
      map: packet.map,
    });

    this.logger.log(`${player.name} joined map: ${map.id}`);
  }

  sendMessage(player: SessionPlayer, packet: MessagePacket) {
    this.broadcastPacket({
      packet: PacketType.Message,
      id: player.id,
      message: packet.message,
    });
  }

  async sendCommand(player: SessionPlayer, packet: CommandPacket) {
    await this.commands.executeCommand(player, packet.command!, {
      players: this.players,
      playerData: this.playerData,
      mapSessions: this.mapSessions,
      raceSessions: this.raceSessions,
      collabSessions: this.collabSessions,
      mapRecords: this.mapRecords,
    });
  }

  placeBlock(player: SessionPlayer, packet: PlaceBlockPacket) {
    if (!player.collabId) return;

    const collab = this.collabSessions.get(player.collabId);

    if (!collab) return;

    collab.blocks.set(packet.instanceID, {
      ...packet,
    });
    this.broadcastPacket({ ...packet }, [player.id], collab?.players);
    this.collabSessions.set(collab.id, collab);
  }

  deleteBlock(player: SessionPlayer, packet: DeleteBlockPacket) {
    if (!player.collabId) return;

    const collab = this.collabSessions.get(player.collabId);

    if (!collab) return;

    collab.blocks.delete(packet.instanceID);
    this.broadcastPacket({ ...packet }, [player.id], collab?.players);
    this.collabSessions.set(collab.id, collab);
  }

  paintBlock(player: SessionPlayer, packet: PaintBlockPacket) {
    if (!player.collabId) return;

    const collab = this.collabSessions.get(player.collabId);

    if (!collab) return;

    const block = collab.blocks.get(packet.instanceID)!;

    collab.blocks.set(packet.instanceID, {
      ...block,
      ...packet,
    });
    this.broadcastPacket({ ...packet }, [player.id], collab?.players);
    this.collabSessions.set(collab.id, collab);
  }

  moveBlock(player: SessionPlayer, packet: MoveBlockPacket) {
    if (!player.collabId) return;

    const collab = this.collabSessions.get(player.collabId);

    if (!collab) return;

    const block = collab.blocks.get(packet.instanceID)!;

    collab.blocks.set(packet.instanceID, {
      ...block,
      ...packet,
    });
    this.broadcastPacket({ ...packet }, [player.id], collab?.players);
    this.collabSessions.set(collab.id, collab);
  }

  setMapSettings(player: SessionPlayer, packet: MapSettingsPacket) {
    if (!player.collabId) return;

    const collab = this.collabSessions.get(player.collabId);

    if (!collab) return;

    collab.settings.set(packet.settings, packet.state);
    this.broadcastPacket({ ...packet }, [player.id], collab?.players);
    this.collabSessions.set(collab.id, collab);
  }

  setMapColor(player: SessionPlayer, packet: MapColorPacket) {
    if (!player.collabId) return;

    const collab = this.collabSessions.get(player.collabId);

    if (!collab) return;

    collab.color.set(packet.settings, packet.color);

    this.broadcastPacket({ ...packet }, [player.id], collab?.players);
    this.collabSessions.set(collab.id, collab);
  }

  onDisconnect(playerId: string) {
    this.players.delete(playerId);
    const collabs = [...this.collabSessions.values()];
    const collab = collabs.find((collab) => collab.players.includes(playerId));

    if (collab) {
      collab.players = collab?.players.filter((id) => id !== playerId) ?? [];
      if (collab.players.length === 0) this.collabSessions.delete(collab.id);
    }

    const races = [...this.raceSessions.values()];
    const race = races.find((race) => race.players.includes(playerId));

    if (race) {
      race.players = race.players.filter((id) => id !== playerId);
      if (race.players.length === 0) this.raceSessions.delete(race.id);
    }

    const maps = [...this.mapSessions.values()];
    const map = maps.find((map) => map.players.includes(playerId));

    if (map) {
      map.players = map.players.filter((id) => id !== playerId);
      if (map.players.length === 0) this.mapSessions.delete(map.type + map.id);
    }
  }

  // events

  completeRun(player: SessionPlayer) {
    if (!player.raceId) return;

    const race = this.raceSessions.get(player.raceId)!;

    if (!race.started) return;

    if (!race.finished) {
      race.finished = true;

      race.results.push({
        playerId: player.id,
        time: new Date().valueOf() - race.time.valueOf(),
      });

      race.time = new Date();

      this.raceSessions.set(race.id, race);

      return this.sendPrivateMessage(player, 'You won the race!');
    }

    for (const result of race.results) {
      if (result.playerId === player.id) {
        return this.sendPrivateMessage(
          player,
          'You have already finished the race!',
        );
      }
    }

    race.results.push({
      playerId: player.id,
      time: new Date().valueOf() - race.time.valueOf(),
    });

    this.raceSessions.set(race.id, race);
    this.sendPrivateMessage(
      player,
      `You finished in place #${race.results.length}`,
    );
  }
}
