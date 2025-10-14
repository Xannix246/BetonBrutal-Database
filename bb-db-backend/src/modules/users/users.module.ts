import { Module } from '@nestjs/common';
import { CommentsController } from './presentation/controllers/comments.controller';

@Module({
  imports: [],
  controllers: [CommentsController],
  providers: [],
})
export class UsersModule {}
