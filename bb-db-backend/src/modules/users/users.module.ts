import { Module } from '@nestjs/common';
import { CommentsController } from './presentation/controllers/comments.controller';
import { UserService } from './application/users.service';
import { UsersController } from './presentation/controllers/users.controller';
import { WorkshopService } from '../workshop/domain/services/workshop.service';
import { SteamApiService } from '../data-requester/application/adapters/http-steam-api';
import { FetchItemUseCase } from '../data-requester/application/use-cases/fetch-item.usecase';
import { SyncUserMapsUseCase } from '../data-requester/application/use-cases/sync-user-maps.usecase';
import { WebsocketModule } from '../websocket/websocket.module';
import { UserModService } from './application/users-mod.service';
import { ModController } from './presentation/controllers/mod.controller';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    WebsocketModule,
    BullModule.registerQueue(
      {
        name: 'map-downloading',
      },
      {
        name: 'request-map',
      },
    ),
  ],
  controllers: [CommentsController, UsersController, ModController],
  providers: [
    UserModService,
    UserService,
    WorkshopService,
    SteamApiService,
    FetchItemUseCase,
    SyncUserMapsUseCase,
  ],
})
export class UsersModule {}
