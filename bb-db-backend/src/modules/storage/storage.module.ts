import { Module } from '@nestjs/common';
import { GridFSService } from './services/gridfs.service';
import { MulterModule } from '@nestjs/platform-express';
import { MapSaveController } from './controllers/multer.controller';
import { MulterService } from './services/multer.service';
import { MulterInternalService } from './services/internal-multer.service';
import { RestorePreviewUseCase } from './use-cases/restore-preview.usecase';

@Module({
  imports: [MulterModule],
  controllers: [MapSaveController],
  providers: [
    GridFSService,
    MulterService,
    MulterInternalService,
    RestorePreviewUseCase,
  ],
  exports: [RestorePreviewUseCase],
})
export class StorageModule {}
