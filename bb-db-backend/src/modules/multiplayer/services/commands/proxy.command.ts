import { Injectable, OnModuleInit } from '@nestjs/common';
import { CommandsService } from '../commands.service';
import { C, CommandsContext, SessionPlayer } from '../../types/multiplayer';

@Injectable()
export class ProxyCommand implements OnModuleInit {
  constructor(private readonly commandsService: CommandsService) {}

  onModuleInit() {
    this.commandsService.register({
      aliases: ['/compatibility', '/cb', '/proxy'],
      description:
        'in case if you want to use commands for original BT server, this server will act as proxy',
      execute: (player, args: string[], context: CommandsContext) =>
        this.proxyCommand(player, context),
    });
  }

  proxyCommand(player: SessionPlayer, context: CommandsContext): string {
    if (!player.proxyMode) {
      player.proxyMode = true;
      context.players.set(player.id, player);
      return `<color=${C.yellow}>Proxy mode enabled</color>`;
    }
    {
      player.proxyMode = false;
      context.players.set(player.id, player);
      return `<color=${C.green}>Proxy mode disabled</color>`;
    }
  }
}
