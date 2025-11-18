import { Module } from '@nestjs/common';
import { GridFSModule } from '../uploads/gridfs.module';
import { FileController } from './presentation/files.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GridFSService } from '../uploads/domain/gridfs.service';
import { ArticlesController } from './presentation/articles.controller';
import { ArticlesService } from './domain/articles.service';

@Module({
  imports: [PrismaModule, GridFSModule],
  controllers: [FileController, ArticlesController],
  providers: [GridFSService, ArticlesService],
})
export class ArticlesModule {}
