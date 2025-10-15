import { Module } from '@nestjs/common';
import { CommentsController } from './presentation/controllers/comments.controller';
import { UserService } from './application/users.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersController } from './presentation/controllers/users.controller';
import { WorkshopService } from '../workshop/domain/services/workshop.service';
import { SteamApiService } from '../data-requester/application/adapters/http-steam-api';
import { FetchItemUseCase } from '../data-requester/application/use-cases/fetch-item.usecase';
import { SyncUserMapsUseCase } from '../data-requester/application/use-cases/sync-user-maps.usecase';

@Module({
  imports: [PrismaModule],
  controllers: [CommentsController, UsersController],
  providers: [
    UserService,
    WorkshopService,
    SteamApiService,
    FetchItemUseCase,
    SyncUserMapsUseCase,
  ],
})
export class UsersModule {}
