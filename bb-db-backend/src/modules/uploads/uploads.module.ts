import { Module } from '@nestjs/common';
import { GridFSService } from './services/gridfs.service';
import { MulterModule } from '@nestjs/platform-express';
import { MapSaveController } from './controllers/multer.controller';
import { MulterService } from './services/multer.service';

@Module({
  imports: [MulterModule],
  controllers: [MapSaveController],
  providers: [GridFSService, MulterService],
})
export class UploadModule {}
