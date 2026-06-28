import { Injectable, OnModuleInit } from '@nestjs/common';
import { CommandsService } from '../commands.service';

@Injectable()
export class ProxyCommand implements OnModuleInit {
  constructor(private readonly commandsService: CommandsService) {}

  onModuleInit() {
    this.commandsService.register({
      aliases: ['/compatibility', '/cb', '/proxy'],
      description:
        'in case if you want to use commands for original BT server, this server will act as proxy',
      execute: () => this.proxyCommand(),
    });
  }

  proxyCommand(): string {
    const commands = [...this.commandsService.commands.values()];
    const commandsDescription = commands.map(
      (command) =>
        `${command.aliases[0]} ${command.args?.join(' ') ?? ''} - ${command.description}`,
    );

    return commandsDescription.join('\n');
  }
}
