import { Injectable } from '@nestjs/common';
import { PacketType, type CommandsContext, Event } from '../types/multiplayer';
import { PacketManager } from './packet-manager.service';
import { PacketData } from '../types/packet.types';
import { WebSocket } from 'ws';

@Injectable()
export class CompatibilityService {
  private readonly sockets: Map<string, WebSocket> = new Map();
  public context: CommandsContext | undefined;
  // playerId, socket

  constructor(private readonly packetManager: PacketManager) {}

  async connectPlayer(playerId: string) {
    const socket = new WebSocket('wss://betonbrutal.com:55082');

    await new Promise<void>((resolve, reject) => {
      socket.addEventListener('open', () => {
        socket.send(
          this.packetManager.serialize({
            packet: PacketType.Version,
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

  sendPacket(packet: PacketData, playerId: string) {
    const socket = this.sockets.get(playerId);

    if (!socket) return;

    if (
      packet.packet !== PacketType.Event &&
      packet.packet !== PacketType.Move
    ) {
      console.log('packet sent:', packet);
      console.log(this.packetManager.serialize(packet));
    }

    switch (packet.packet) {
      case PacketType.Version:
        socket.send(this.packetManager.serialize(packet));
        break;
      case PacketType.Join:
        socket.send(this.packetManager.serialize(packet));
        break;
      case PacketType.Event:
        switch (packet.signal) {
          case Event.Ping:
            socket.send(this.packetManager.serialize(packet));
            break;
          case Event.RunComplete:
            socket.send(this.packetManager.serialize(packet));
        }
        break;
      case PacketType.Move:
        socket.send(this.packetManager.serialize(packet));
        break;
      case PacketType.Map:
        socket.send(this.packetManager.serialize(packet));
        break;
      case PacketType.Message:
        socket.send(this.packetManager.serialize(packet));
        break;
      // case PacketType.Command:
      //   socket.send(this.packetManager.serialize(packet));
      //   break;
    }
  }

  private handleConnection(socket: WebSocket, id: string) {
    socket.on('message', (message) => {
      this.handleMessage(message as Buffer, id);
    });
  }

  private handleMessage(message: Buffer, playerId: string) {
    const packet = this.packetManager.deserialize(message, true);
    const socket = this.context!.players.get(playerId)?.socket;
    const ids = [...this.context!.players.keys()];
    console.log('packet received:', packet);

    if (!packet || !socket) return;

    if (
      [
        // PacketType.Version,
        PacketType.Join,
        PacketType.Event,
        PacketType.Move,
        PacketType.Map,
        PacketType.Message,
        PacketType.GetPlayers,
        PacketType.PlayersPing,
        // PacketType.Command,
      ].includes(packet.packet)
    ) {
      if (
        packet.packet === PacketType.Event &&
        ![Event.Ping, Event.RunComplete].includes(packet.signal)
      ) {
        return;
      }

      if (packet.packet === PacketType.GetPlayers) {
        const data = [
          ...packet.players.filter((player) => !ids.includes(player.id)),
        ];

        console.log(data);

        socket.send(
          this.packetManager.serialize({
            packet: PacketType.GetPlayers,
            players: data,
          }),
        );
        return;
      }

      if (packet.packet === PacketType.Message && ids.includes(packet.id!)) {
        return;
      }

      socket.send(this.packetManager.serialize(packet));
    }
  }
}
