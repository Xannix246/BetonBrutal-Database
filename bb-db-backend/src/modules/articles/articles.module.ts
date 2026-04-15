import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { FileController } from './presentation/files.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ArticlesController } from './presentation/articles.controller';
import { ArticlesService } from './services/articles.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PrismaModule, StorageModule, UsersModule],
  controllers: [FileController, ArticlesController],
  providers: [ArticlesService],
})
export class ArticlesModule {}
