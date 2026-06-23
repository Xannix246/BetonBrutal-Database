import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { WebSocketServer, WebSocket } from 'ws';
import { PacketManager } from '../services/packet-manager.service';
import { MultiplayerService } from '../services/multiplayer.service';
import { Event, PacketType, SessionPlayer } from '../types/multiplayer';
import { v4 } from 'uuid';

@Injectable()
export class MultiplayerWebsocketGateway implements OnModuleInit {
  private readonly logger = new Logger(MultiplayerWebsocketGateway.name);
  private readonly users: Map<string, string> = new Map();
  private server!: WebSocketServer;

  constructor(
    private readonly packetManager: PacketManager,
    private readonly multiplayer: MultiplayerService,
  ) {}

  onModuleInit() {
    this.server = new WebSocketServer({
      port: 8080,
    });

    this.server.on('connection', (socket) => {
      const uuid = v4();
      this.handleConnection(socket, uuid);
    });
  }

  private handleConnection(socket: WebSocket, uuid: string) {
    let player: SessionPlayer | undefined;
    const setPlayer = (p: SessionPlayer) => {
      player = p;
    };
    this.logger.log('Client connected');

    socket.on('message', (data: Buffer) => {
      this.handleMessage(socket, uuid, setPlayer, player, data);
    });

    socket.on('close', () => {
      const user = this.users.get(uuid);

      if (user) {
        this.multiplayer.onDisconnect(user);
      }

      this.users.delete(uuid);
      console.log('Client disconnected');
      console.log(this.users);
    });
  }

  private handleMessage(
    socket: WebSocket,
    uuid: string,
    setPlayer: (p: SessionPlayer) => void,
    player: SessionPlayer | undefined,
    data: Buffer,
  ) {
    const packet = this.packetManager.deserialize(data);

    if (!packet) {
      this.logger.log('failed to parse packet');
      socket.close();
      return;
    }

    // if (
    //   packet.packet !== PacketType.Event &&
    //   packet.packet !== PacketType.Move
    // ) {
    //   this.logger.log(packet);
    // }

    switch (packet.packet) {
      case PacketType.Version:
        this.multiplayer.getVersion(socket, packet);
        break;
      case PacketType.Join:
        this.users.set(uuid, packet.id);
        console.log(this.users);
        void this.multiplayer.join(socket, setPlayer, packet);
        break;
      case PacketType.Event:
        switch (packet.signal) {
          case Event.Ping:
            if (!player) return;
            this.multiplayer.ping(player, socket);
            break;
          case Event.RunComplete:
            this.multiplayer.completeRun(player!);
        }
        break;
      case PacketType.Move:
        if (!player) return;
        this.multiplayer.playerMove(player, packet);
        break;
      case PacketType.Map:
        if (!player) return;
        this.multiplayer.joinMap(player, packet);
        break;
      case PacketType.Message:
        this.multiplayer.sendMessage(player!, packet);
        break;
      case PacketType.Command:
        void this.multiplayer.sendCommand(player!, packet);
        break;
      case PacketType.PlaceBlocks:
        this.multiplayer.placeBlock(player!, packet);
        break;
      case PacketType.DeleteBlocks:
        this.multiplayer.deleteBlock(player!, packet);
        break;
      case PacketType.PaintBlocks:
        this.multiplayer.paintBlock(player!, packet);
        break;
      case PacketType.MoveBlocks:
        this.multiplayer.moveBlock(player!, packet);
        break;
      case PacketType.MapSettings:
        this.multiplayer.setMapSettings(player!, packet);
        break;
      case PacketType.MapColor:
        this.multiplayer.setMapColor(player!, packet);
        break;
      case PacketType.Disconnect:
        this.multiplayer.onDisconnect(packet.id);
        break;
    }
  }
}
