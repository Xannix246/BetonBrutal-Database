import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { SteamApiService } from './application/adapters/http-steam-api';
import { FetchItemUseCase } from './application/use-cases/fetch-item.usecase';
import { SyncUserMapsUseCase } from './application/use-cases/sync-user-maps.usecase';
import { RefreshDatabaseUseCase } from './application/use-cases/refresh-database.usecase';
import { GetNewMapsScheduler } from './infrastructure/schedulers/get-new-maps.schedule';

@Module({
  imports: [PrismaModule],
  providers: [
    SteamApiService,
    FetchItemUseCase,
    SyncUserMapsUseCase,
    RefreshDatabaseUseCase,
    GetNewMapsScheduler,
  ],
  exports: [FetchItemUseCase],
})
export class DataRequesterModule {}
