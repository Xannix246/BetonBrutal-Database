import { Module } from '@nestjs/common';
import { CommentsController } from './presentation/controllers/comments.controller';
import { UserService } from './application/users.service';
import { UsersController } from './presentation/controllers/users.controller';
import { WebsocketModule } from '../websocket/websocket.module';
import { UserModService } from './application/users-mod.service';
import { ModController } from './presentation/controllers/mod.controller';
import { WorkshopModule } from '../workshop/workshop.module';

@Module({
  imports: [WebsocketModule, WorkshopModule],
  controllers: [CommentsController, UsersController, ModController],
  providers: [UserModService, UserService],
  exports: [UserModService, UserService],
})
export class UsersModule {}
