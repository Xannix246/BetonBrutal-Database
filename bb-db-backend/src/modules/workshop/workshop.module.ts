import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkshopController } from './presentation/controllers/workshop.controller';
import { WorkshopService } from './domain/services/workshop.service';
import { WebsocketModule } from '../websocket/websocket.module';
import { MapDownloaderProcessor } from './processors/map.processor';
import { MapRequesterProcessor } from './processors/workshop.processor';
import { BanReplayProcessor } from './processors/replay-ban.processor';
import { DataRequesterModule } from '../data-requester/data-requester.module';

@Module({
  imports: [
    PrismaModule,
    WebsocketModule,
    DataRequesterModule,
    BullModule.registerQueue(
      {
        name: 'map-downloading',
      },
      {
        name: 'request-map',
      },
    ),
  ],
  controllers: [WorkshopController],
  providers: [
    WorkshopService,
    MapDownloaderProcessor,
    MapRequesterProcessor,
    BanReplayProcessor,
  ],
  exports: [WorkshopService],
})
export class WorkshopModule {}
