import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkshopController } from './presentation/controllers/workshop.controller';
import { WorkshopService } from './domain/services/workshop.service';
import { FetchItemUseCase } from '../data-requester/application/use-cases/fetch-item.usecase';
import { SteamApiService } from '../data-requester/application/adapters/http-steam-api';
import { RefreshDatabaseUseCase } from '../data-requester/application/use-cases/refresh-database.usecase';
import { SyncUserMapsUseCase } from '../data-requester/application/use-cases/sync-user-maps.usecase';

@Module({
  imports: [PrismaModule],
  controllers: [WorkshopController],
  providers: [
    WorkshopService,
    FetchItemUseCase,
    RefreshDatabaseUseCase,
    SteamApiService,
    SyncUserMapsUseCase,
  ],
})
export class WorkshopModule {}
