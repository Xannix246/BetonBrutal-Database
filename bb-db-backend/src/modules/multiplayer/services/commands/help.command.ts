import { Injectable, OnModuleInit } from '@nestjs/common';
import { CommandsService } from '../commands.service';

@Injectable()
export class HelpCommand implements OnModuleInit {
  constructor(private readonly commandsService: CommandsService) {}

  onModuleInit() {
    this.commandsService.register({
      aliases: ['/help'],
      description: 'show this list',
      execute: () => this.helpCommand(),
    });
  }

  helpCommand(): string {
    const commands = [...this.commandsService.commands.values()];
    const commandsDescription = commands.map(
      (command) =>
        `${command.aliases[0]} ${command.args?.join(' ') ?? ''} - ${command.description}`,
    );

    return commandsDescription.join('\n');
  }
}
