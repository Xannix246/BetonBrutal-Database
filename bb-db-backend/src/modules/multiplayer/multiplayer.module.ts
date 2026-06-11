import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkshopModule } from '../workshop/workshop.module';
import { CommandsService } from './services/commands.service';
import { MultiplayerService } from './services/multiplayer.service';
import { PacketManager } from './services/packet-manager.service';
import { MultiplayerWebsocketGateway } from './presentation/multiplayer.gateway';
import { HelpCommand } from './services/commands/help.command';
import { NickCommand } from './services/commands/nick.command';
import { PingCommand } from './services/commands/ping.command';
import { RaceCommand } from './services/commands/race.command';
import { CheckRacesScheduler } from './infrastructure/schedulers/check-races.schedule';
import { CollabCommand } from './services/commands/collab.command';

@Module({
  imports: [PrismaModule, WorkshopModule],
  providers: [
    MultiplayerService,
    CommandsService,
    PacketManager,
    MultiplayerWebsocketGateway,
    HelpCommand,
    NickCommand,
    PingCommand,
    RaceCommand,
    CollabCommand,
    CheckRacesScheduler,
  ],
  exports: [MultiplayerService],
})
export class MultiplayerModule {}
