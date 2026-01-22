import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkshopController } from './presentation/controllers/workshop.controller';
import { WorkshopService } from './domain/services/workshop.service';
import { FetchItemUseCase } from '../data-requester/application/use-cases/fetch-item.usecase';
import { SteamApiService } from '../data-requester/application/adapters/http-steam-api';
import { RefreshDatabaseUseCase } from '../data-requester/application/use-cases/refresh-database.usecase';
import { SyncUserMapsUseCase } from '../data-requester/application/use-cases/sync-user-maps.usecase';
import { FetchBBLBUseCase } from '../data-requester/application/use-cases/fetch-bblb.usecase';
import { BBLBApiService } from '../data-requester/application/adapters/bblb-api';
import { WebsocketModule } from '../websocket/websocket.module';
import { SteamCmdService } from '../data-requester/application/services/steamcmd.service';
import { BullModule } from '@nestjs/bullmq';
import { MapDownloaderProcessor } from './processors/map.processor';

@Module({
  imports: [
    PrismaModule,
    WebsocketModule,
    BullModule.registerQueue({
      name: 'map-downloading',
    }),
  ],
  controllers: [WorkshopController],
  providers: [
    WorkshopService,
    FetchItemUseCase,
    RefreshDatabaseUseCase,
    SteamApiService,
    SteamCmdService,
    BBLBApiService,
    SyncUserMapsUseCase,
    FetchBBLBUseCase,
    MapDownloaderProcessor,
  ],
})
export class WorkshopModule {}
