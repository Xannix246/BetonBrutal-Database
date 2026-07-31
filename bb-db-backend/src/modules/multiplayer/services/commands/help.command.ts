import { Injectable, OnModuleInit } from '@nestjs/common';
import { CommandsService } from '../commands.service';
import { C } from '../../types/multiplayer';

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
        `<color=${C.blue}>${command.aliases[0]}${command.aliases.length > 1 ? ` (or ${command.aliases.slice(1).join('|')})` : ''}</color> <color=${C.green}>${command.args?.join(' ') ?? ''}</color> - ${command.description}`,
    );

    return commandsDescription.join('\n');
  }
}
