import { Injectable } from '@nestjs/common';
import {
  C,
  CommandDefinition,
  CommandsContext,
  SessionPlayer,
} from '../types/multiplayer';
import { WebSocket } from 'ws';
import { ProtobufManager } from './protobuf-manager.service';
import { Events, PacketType } from 'src/generated/protos/multiplayer';
import { ProtoPacket } from '../types/proto.types';
import { v4 } from 'uuid';

@Injectable()
export class CommandsService {
  public readonly commands = new Map<string, CommandDefinition>();
  public context: CommandsContext | undefined;

  constructor(private readonly packetManager: ProtobufManager) {}

  private sendServerMessage(socket: WebSocket, message: string) {
    socket.send(
      this.packetManager.serialize({
        packet: PacketType.CommandPacket,
        payload: { message },
      }),
    );
  }

  register(command: CommandDefinition) {
    // for (const alias of command.aliases) {
    //   this.commands.set(alias.toLowerCase(), command);
    // }
    this.commands.set(command.aliases[0].toLowerCase(), command);
  }

  broadcastPacket(
    packet: ProtoPacket,
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

  sendPacket(player: SessionPlayer, packet: ProtoPacket) {
    player.socket.send(this.packetManager.serialize(packet));
  }

  async sendPacketAsync(
    player: SessionPlayer,
    packet: ProtoPacket,
    timeoutMs = 8000,
  ) {
    const uuid = v4();

    player.socket.send(
      this.packetManager.serialize({
        packet: PacketType.AckResPacket,
        payload: {
          id: uuid,
          packetType: packet.packet,
        },
      }),
    );

    return new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => {
        if (this.context!.asyncPackets.has(uuid)) {
          this.context!.asyncPackets.delete(uuid);
          resolve(false);
        }
      }, timeoutMs);

      const handleResolve = () => {
        clearTimeout(timeout);
        resolve(true);
      };

      player.socket.send(this.packetManager.serialize(packet));
      this.context!.asyncPackets.set(uuid, handleResolve);
    });
  }

  broadcastMessage(
    message: string,
    receivers?: string[],
    ignorePlayers?: string[],
  ) {
    this.broadcastPacket(
      {
        packet: PacketType.CommandPacket,
        payload: { message },
      },
      ignorePlayers,
      receivers,
    );
  }

  sendMessage(player: SessionPlayer, message: string) {
    player.socket.send(
      this.packetManager.serialize({
        packet: PacketType.CommandPacket,
        payload: { message },
      }),
    );
  }

  broadcastEvent(
    event: Events,
    receivers?: string[],
    ignorePlayers?: string[],
  ) {
    this.broadcastPacket(
      {
        packet: PacketType.EventPacket,
        payload: { type: event },
      },
      ignorePlayers,
      receivers,
    );
  }

  sendEvent(player: SessionPlayer, event: Events) {
    player.socket.send(
      this.packetManager.serialize({
        packet: PacketType.EventPacket,
        payload: { type: event },
      }),
    );
  }

  async executeCommand(
    player: SessionPlayer,
    commandLine: string,
    context: CommandsContext,
  ) {
    const [rawCommand, ...args] = commandLine.trim().split(/\s+/);

    const command = [...this.commands.values()].find((command) =>
      command.aliases.includes(rawCommand.toLowerCase()),
    );

    if (!command) {
      return this.sendServerMessage(
        player.socket,
        `<color=${C.red}>Invalid command.</color>`,
      );
    }

    this.context = context;

    if (!command.execute) return;

    const result = await command.execute(player, args, context);

    if (result) {
      this.sendServerMessage(player.socket, result);
    }
  }
}
