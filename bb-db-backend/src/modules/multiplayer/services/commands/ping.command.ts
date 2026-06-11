import { Injectable, OnModuleInit } from '@nestjs/common';
import { CommandsService } from '../commands.service';
import { SessionPlayer } from '../../types/multiplayer';

@Injectable()
export class PingCommand implements OnModuleInit {
  constructor(private readonly commandsService: CommandsService) {}

  onModuleInit() {
    this.commandsService.register({
      aliases: ['/ping'],
      description: 'show your ping',
      execute: (player) => this.pingCommand(player),
    });
  }

  pingCommand(player: SessionPlayer): string {
    return `Ping: ${player.ping.latencyMs}ms`;
  }
}
