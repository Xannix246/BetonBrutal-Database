import { Injectable, OnModuleInit } from '@nestjs/common';
import { CommandsService } from '../commands.service';
import { C, SessionPlayer } from '../../types/multiplayer';

@Injectable()
export class ProxyCommand implements OnModuleInit {
  constructor(private readonly commandsService: CommandsService) {}

  onModuleInit() {
    this.commandsService.register({
      aliases: ['/compatibility', '/cb', '/proxy'],
      description:
        'in case if you want to use commands for original BT server, this server will act as proxy',
      execute: (player) => this.proxyCommand(player),
    });
  }

  proxyCommand(player: SessionPlayer): string {
    if (!player.proxyMode.value) {
      player.proxyMode.set(true);
      return `<color=${C.yellow}>Proxy mode enabled</color>`;
    }
    {
      player.proxyMode.set(false);
      return `<color=${C.green}>Proxy mode disabled</color>`;
    }
  }
}
