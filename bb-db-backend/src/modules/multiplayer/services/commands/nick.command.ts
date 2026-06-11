import { Injectable, OnModuleInit } from '@nestjs/common';
import { CommandsService } from '../commands.service';
import {
  CommandsContext,
  PacketType,
  SessionPlayer,
} from '../../types/multiplayer';

@Injectable()
export class NickCommand implements OnModuleInit {
  constructor(private readonly commandsService: CommandsService) {}

  onModuleInit() {
    this.commandsService.register({
      aliases: ['/nick'],
      args: ['[nickname]'],
      description: 'change your nickname',
      execute: (...args) => this.nickCommand(...args),
    });
  }

  nickCommand(
    player: SessionPlayer,
    args: string[],
    context: CommandsContext,
  ): string {
    const nick = args[0];
    if (!nick) return 'Write your nickname';

    player.nick = nick;

    context.players.set(player.id, player);
    this.commandsService.broadcastPacket({
      packet: PacketType.Nickname,
      id: player.id,
      nick: player.nick,
    });

    return `Nickname set to: ${nick}`;
  }
}
