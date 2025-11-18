import { Module } from '@nestjs/common';
import { GridFSService } from './domain/gridfs.service';

@Module({
  imports: [],
  controllers: [],
  providers: [GridFSService],
})
export class GridFSModule {}
