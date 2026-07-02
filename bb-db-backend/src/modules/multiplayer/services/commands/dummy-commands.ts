import { Injectable, OnModuleInit } from '@nestjs/common';
import { CommandsService } from '../commands.service';

@Injectable()
export class DummyCommands implements OnModuleInit {
  constructor(private readonly commandsService: CommandsService) {}

  onModuleInit() {
    this.commandsService.register({
      aliases: ['/color'],
      args: ['[color|rgb]'],
      description: 'change player color',
    });
  }
}
