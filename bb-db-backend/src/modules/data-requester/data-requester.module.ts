import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { SteamApiService } from './application/adapters/http-steam-api';
import { FetchItemUseCase } from './application/use-cases/fetch-item.usecase';
import { SyncUserMapsUseCase } from './application/use-cases/sync-user-maps.usecase';
import { RefreshDatabaseUseCase } from './application/use-cases/refresh-database.usecase';
import { GetNewMapsScheduler } from './infrastructure/schedulers/get-new-maps.schedule';
import { FetchBBLBUseCase } from './application/use-cases/fetch-bblb.usecase';
import { BBLBApiService } from './application/adapters/bblb-api';

@Module({
  imports: [PrismaModule],
  providers: [
    SteamApiService,
    BBLBApiService,
    FetchItemUseCase,
    SyncUserMapsUseCase,
    RefreshDatabaseUseCase,
    GetNewMapsScheduler,
    FetchItemUseCase,
    FetchBBLBUseCase,
  ],
  exports: [FetchItemUseCase, FetchBBLBUseCase],
})
export class DataRequesterModule {}
