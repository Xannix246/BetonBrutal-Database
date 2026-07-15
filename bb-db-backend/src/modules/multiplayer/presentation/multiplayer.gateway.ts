import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { WebSocketServer, WebSocket } from 'ws';
// import { PacketManager } from '../services/packet-manager.service';
import { MultiplayerService } from '../services/multiplayer.service';
import { SessionPlayer } from '../types/multiplayer';
import { v4 } from 'uuid';
import { ProtobufManager } from '../services/protobuf-manager.service';
import { Events, PacketType } from 'src/generated/protos/multiplayer';
import { CollabService } from '../services/collab.service';
import { EventsService } from '../services/events.service';

@Injectable()
export class MultiplayerWebsocketGateway implements OnModuleInit {
  private readonly logger = new Logger(MultiplayerWebsocketGateway.name);
  private readonly users: Map<string, string> = new Map();
  private server!: WebSocketServer;

  constructor(
    private readonly packetManager: ProtobufManager,
    private readonly multiplayer: MultiplayerService,
    private readonly collab: CollabService,
    private readonly events: EventsService,
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
        void this.multiplayer.onDisconnect(user);
        console.log(`${user} disconnected`);
      }

      this.users.delete(uuid);
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

    if (
      packet.packet !== PacketType.EventPacket &&
      packet.packet !== PacketType.MovePacket &&
      packet.packet !== PacketType.PlayerDataPacket
    ) {
      this.logger.log(packet);
    }

    switch (packet.packet) {
      case PacketType.VersionPacket:
        this.multiplayer.getVersion(socket, packet.payload);
        break;
      case PacketType.JoinPacket:
        this.users.set(uuid, packet.payload.id.toString());
        console.log(this.users);
        void this.multiplayer.join(socket, setPlayer, packet.payload);
        break;
      case PacketType.EventPacket:
        switch (packet.payload.type) {
          case Events.Ping:
            if (!player) return;
            this.events.ping(player);
            break;
          case Events.RunComplete:
            this.events.completeRun(player!);
        }
        break;
      case PacketType.AckResPacket:
        this.multiplayer.handleAckPacket(packet.payload);
        break;
      case PacketType.MovePacket:
        if (!player) return;
        this.multiplayer.playerMove(player, packet.payload);
        break;
      case PacketType.BodyColorPacket:
        this.multiplayer.setColor(player!, packet.payload);
        break;
      case PacketType.MapPacket:
        if (!player) return;
        this.multiplayer.joinMap(player, packet.payload);
        break;
      case PacketType.MessagePacket:
        this.multiplayer.sendMessage(player!, packet.payload);
        break;
      case PacketType.CommandPacket:
        void this.multiplayer.sendCommand(player!, packet.payload);
        break;
      case PacketType.PlaceBlocksPacket:
      case PacketType.PlaceBlockPacket:
        this.collab.placeBlock(player!, packet.payload);
        break;
      case PacketType.DeleteBlockPacket:
        this.collab.deleteBlock(player!, packet.payload);
        break;
      case PacketType.ChangeBlockPacket:
        this.collab.changeBlock(player!, packet.payload);
        break;
      case PacketType.MapSettingsPacket:
        this.collab.setMapSettings(player!, packet.payload);
        break;
      case PacketType.MapColorPacket:
        this.collab.setMapColor(player!, packet.payload);
        break;
      case PacketType.CreateGroupPacket:
        this.collab.createGroup(player!, packet.payload);
        break;
      case PacketType.ChangeGroupPacket:
        this.collab.changeGroup(player!, packet.payload);
        break;
      case PacketType.DeleteGroupPacket:
        this.collab.deleteGroup(player!, packet.payload);
        break;
      case PacketType.AddBlockToGroupPacket:
        this.collab.addBlockToGroup(player!, packet.payload);
        break;
      case PacketType.RemoveBlockFromGroupPacket:
        this.collab.removeBlockFromGroup(player!, packet.payload);
        break;
      case PacketType.CreateTriggerPacket:
        this.collab.createTrigger(player!, packet.payload);
        break;
      case PacketType.ChangeTriggerPacket:
        this.collab.changeTrigger(player!, packet.payload);
        break;
      case PacketType.DeleteTriggerPacket:
        this.collab.deleteTrigger(player!, packet.payload);
        break;
      case PacketType.AddOperationPacket:
        this.collab.addOperation(player!, packet.payload);
        break;
      case PacketType.EditOperationPacket:
        this.collab.editOperation(player!, packet.payload);
        break;
      case PacketType.MoveOperationOrderPacket:
        this.collab.moveOperation(player!, packet.payload);
        break;
      case PacketType.RemoveOperationPacket:
        this.collab.removeOperation(player!, packet.payload);
        break;
      case PacketType.PlayerDataPacket:
        this.multiplayer.updatePlayerData(player!, packet.payload);
    }
  }
}
