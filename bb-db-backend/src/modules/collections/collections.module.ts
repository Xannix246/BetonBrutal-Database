import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CollectionsService } from './services/collections.service';
import { CollectionsConrtroller } from './controllers/collections.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CollectionsConrtroller],
  providers: [CollectionsService],
})
export class CollectionsModule {}
