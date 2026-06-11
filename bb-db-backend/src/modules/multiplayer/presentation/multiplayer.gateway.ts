import { Injectable, OnModuleInit } from '@nestjs/common';
import { WebSocketServer, WebSocket } from 'ws';
import { PacketManager } from '../services/packet-manager.service';
import { MultiplayerService } from '../services/multiplayer.service';
import { Event, PacketType, SessionPlayer } from '../types/multiplayer';

@Injectable()
export class MultiplayerWebsocketGateway implements OnModuleInit {
  private server!: WebSocketServer;
  constructor(
    private readonly packetManager: PacketManager,
    private readonly multiplayer: MultiplayerService,
  ) {}

  onModuleInit() {
    this.server = new WebSocketServer({
      port: 80,
    });

    this.server.on('connection', (socket) => {
      this.handleConnection(socket);
    });
  }

  private handleConnection(socket: WebSocket) {
    let player: SessionPlayer | undefined;
    const setPlayer = (p: SessionPlayer) => {
      player = p;
    };
    console.log('Client connected');

    socket.on('message', (data: Buffer) => {
      this.handleMessage(socket, setPlayer, player, data);
    });

    socket.on('close', () => {
      console.log('Client disconnected');
    });
  }

  private handleMessage(
    socket: WebSocket,
    setPlayer: (p: SessionPlayer) => void,
    player: SessionPlayer | undefined,
    data: Buffer,
  ) {
    const packet = this.packetManager.deserialize(data);

    if (!packet) {
      console.log('failed to parse packet');
      socket.close();
      return;
    }

    if (
      packet.packet !== PacketType.Event &&
      packet.packet !== PacketType.Move
    ) {
      console.log(packet);
    }

    switch (packet.packet) {
      case PacketType.Version:
        this.multiplayer.getVersion(socket, packet);
        break;
      case PacketType.Join:
        this.multiplayer.join(socket, setPlayer, packet);
        break;
      case PacketType.Event:
        switch (packet.signal) {
          case Event.Ping:
            this.multiplayer.ping(player!, socket);
            break;
          case Event.RunComplete:
            this.multiplayer.completeRun(player!);
        }
        break;
      case PacketType.Move:
        this.multiplayer.playerMove(player!, packet);
        break;
      case PacketType.Map:
        this.multiplayer.joinMap(player!, packet);
        break;
      case PacketType.Message:
        this.multiplayer.sendMessage(player!, packet);
        break;
      case PacketType.Command:
        void this.multiplayer.sendCommand(player!, packet);
        break;
      case PacketType.PlaceBlock:
        this.multiplayer.placeBlock(player!, packet);
        break;
      case PacketType.DeleteBlock:
        this.multiplayer.deleteBlock(player!, packet);
        break;
      case PacketType.PaintBlock:
        this.multiplayer.paintBlock(player!, packet);
        break;
      case PacketType.MoveBlock:
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
