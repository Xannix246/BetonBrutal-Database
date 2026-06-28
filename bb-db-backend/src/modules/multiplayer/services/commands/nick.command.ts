import { Injectable, OnModuleInit } from '@nestjs/common';
import { CommandsService } from '../commands.service';
import { CommandsContext, SessionPlayer } from '../../types/multiplayer';
import { PacketType } from 'src/generated/protos/multiplayer';

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
    const nickname = args[0];
    if (!nickname) return 'Write your nickname';

    player.nick = nickname;

    context.players.set(player.id, player);
    this.commandsService.broadcastPacket({
      packet: PacketType.NicknamePacket,
      payload: { id: player.id, nickname: player.nick },
    });

    return `Nickname set to: ${nickname}`;
  }
}
