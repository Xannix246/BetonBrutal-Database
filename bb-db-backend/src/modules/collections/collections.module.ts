import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CollectionsService } from './services/collections.service';
import { CollectionsConrtroller } from './controllers/collections.controller';
import { WorkshopModule } from '../workshop/workshop.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [PrismaModule, WorkshopModule, StorageModule],
  controllers: [CollectionsConrtroller],
  providers: [CollectionsService],
})
export class CollectionsModule {}
