import { Injectable, OnModuleInit } from '@nestjs/common';
import { CommandsService } from '../commands.service';
import { C, SessionPlayer } from '../../types/multiplayer';
import { PacketType } from 'src/generated/protos/multiplayer';

@Injectable()
export class NickCommand implements OnModuleInit {
  constructor(private readonly commandsService: CommandsService) {}

  onModuleInit() {
    this.commandsService.register({
      aliases: ['/nick'],
      args: ['[nickname]'],
      description: 'change your nickname',
      execute: (player, args) => this.nickCommand(player, args),
    });
  }

  nickCommand(player: SessionPlayer, args: string[]): string {
    const nickname = args[0];
    if (!nickname) return `<color=${C.yellow}>Write your nickname</color>`;

    player.nick.set(nickname);
    this.commandsService.broadcastPacket({
      packet: PacketType.NicknamePacket,
      payload: { id: player.id, nickname: player.nick.value },
    });

    return `<color=${C.green}>Nickname set to: ${nickname}</color>`;
  }
}
