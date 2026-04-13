import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CollectionsService } from './services/collections.service';
import { CollectionsConrtroller } from './controllers/collections.controller';
import { WorkshopModule } from '../workshop/workshop.module';

@Module({
  imports: [PrismaModule, WorkshopModule],
  controllers: [CollectionsConrtroller],
  providers: [CollectionsService],
})
export class CollectionsModule {}
