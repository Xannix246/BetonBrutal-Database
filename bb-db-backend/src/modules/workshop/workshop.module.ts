import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkshopController } from './presentation/controllers/workshop.controller';
import { WorkshopService } from './domain/services/workshop.service';
import { RefreshDatabaseUseCase } from '../data-requester/application/use-cases/refresh-database.usecase';
import { SyncUserMapsUseCase } from '../data-requester/application/use-cases/sync-user-maps.usecase';
import { FetchBBLBUseCase } from '../data-requester/application/use-cases/fetch-bblb.usecase';
import { WebsocketModule } from '../websocket/websocket.module';
import { BullModule } from '@nestjs/bullmq';
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
      {
        name: 'ban-replay',
      },
    ),
  ],
  controllers: [WorkshopController],
  providers: [
    WorkshopService,
    RefreshDatabaseUseCase,
    SyncUserMapsUseCase,
    FetchBBLBUseCase,
    MapDownloaderProcessor,
    MapRequesterProcessor,
    BanReplayProcessor,
  ],
  exports: [
    WorkshopService,
    RefreshDatabaseUseCase,
    SyncUserMapsUseCase,
    FetchBBLBUseCase,
  ],
})
export class WorkshopModule {}
