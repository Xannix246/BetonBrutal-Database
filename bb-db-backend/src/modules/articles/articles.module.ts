import { Module } from '@nestjs/common';
import { UploadModule } from '../uploads/uploads.module';
import { FileController } from './presentation/files.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GridFSService } from '../uploads/services/gridfs.service';
import { ArticlesController } from './presentation/articles.controller';
import { ArticlesService } from './services/articles.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PrismaModule, UploadModule, UsersModule],
  controllers: [FileController, ArticlesController],
  providers: [GridFSService, ArticlesService],
})
export class ArticlesModule {}
