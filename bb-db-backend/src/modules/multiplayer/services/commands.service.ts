import { Injectable } from '@nestjs/common';
import {
  CommandDefinition,
  CommandsContext,
  Event,
  PacketType,
  SessionPlayer,
} from '../types/multiplayer';
import { PacketManager } from './packet-manager.service';
import { WebSocket } from 'ws';
import { PacketData } from '../types/packet.types';

@Injectable()
export class CommandsService {
  public readonly commands = new Map<string, CommandDefinition>();
  public context: CommandsContext | undefined;

  constructor(private readonly packetManager: PacketManager) {}

  private sendServerMessage(socket: WebSocket, message: string) {
    socket.send(
      this.packetManager.serialize({
        packet: PacketType.Command,
        message,
      }),
    );
  }

  register(command: CommandDefinition) {
    for (const alias of command.aliases) {
      this.commands.set(alias.toLowerCase(), command);
    }
  }

  broadcastPacket(
    packet: PacketData,
    ignorePlayers: string[] = [],
    receivers?: string[],
  ) {
    for (const player of this.context!.players) {
      if (
        ignorePlayers.includes(player[0]) ||
        (receivers && !receivers.includes(player[0]))
      ) {
        continue;
      }

      player[1].socket.send(this.packetManager.serialize(packet));
    }
  }

  sendPacket(player: SessionPlayer, packet: PacketData) {
    player.socket.send(this.packetManager.serialize(packet));
  }

  broadcastMessage(
    message: string,
    receivers?: string[],
    ignorePlayers?: string[],
  ) {
    this.broadcastPacket(
      {
        packet: PacketType.Command,
        message,
      },
      ignorePlayers,
      receivers,
    );
  }

  sendMessage(player: SessionPlayer, message: string) {
    player.socket.send(
      this.packetManager.serialize({
        packet: PacketType.Command,
        message,
      }),
    );
  }

  broadcastEvent(event: Event, receivers?: string[], ignorePlayers?: string[]) {
    this.broadcastPacket(
      {
        packet: PacketType.Event,
        signal: event,
      },
      ignorePlayers,
      receivers,
    );
  }

  sendEvent(player: SessionPlayer, event: Event) {
    player.socket.send(
      this.packetManager.serialize({
        packet: PacketType.Event,
        signal: event,
      }),
    );
  }

  async executeCommand(
    player: SessionPlayer,
    commandLine: string,
    context: CommandsContext,
  ) {
    const [rawCommand, ...args] = commandLine.trim().split(/\s+/);

    const command = this.commands.get(rawCommand.toLowerCase());

    if (!command) {
      return this.sendServerMessage(player.socket, 'Invalid command.');
    }

    this.context = context;

    const result = await command.execute(player, args, context);

    if (result) {
      this.sendServerMessage(player.socket, result);
    }
  }
}
