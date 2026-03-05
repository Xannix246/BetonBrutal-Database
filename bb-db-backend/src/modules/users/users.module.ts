import { Module } from '@nestjs/common';
import { CommentsController } from './presentation/controllers/comments.controller';
import { UserService } from './application/users.service';
import { UsersController } from './presentation/controllers/users.controller';
import { WebsocketModule } from '../websocket/websocket.module';
import { ModService } from './application/mod.service';
import { ModController } from './presentation/controllers/mod.controller';
import { WorkshopModule } from '../workshop/workshop.module';
import { BullModule } from '@nestjs/bullmq';
import { SteamService } from './application/steam.service';

@Module({
  imports: [
    WebsocketModule,
    WorkshopModule,
    BullModule.registerQueue({ name: 'ban-replay' }),
  ],
  controllers: [CommentsController, UsersController, ModController],
  providers: [ModService, UserService, SteamService],
  exports: [ModService, UserService],
})
export class UsersModule {}
