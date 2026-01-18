import { Controller, Get, Module } from '@nestjs/common';
import { WorkshopModule } from './modules/workshop/workshop.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { DataRequesterModule } from './modules/data-requester/data-requester.module';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';
import { ScheduleModule } from '@nestjs/schedule';
import { BAuthModule } from './modules/auth/auth.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { UploadModule } from './modules/uploads/uploads.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CollectionsModule } from './modules/collections/collections.module';

@Controller()
class AppController {
  @Get('/')
  @OptionalAuth()
  ping(): string {
    return 'ok';
  }
}

@Module({
  imports: [
    BAuthModule,
    ScheduleModule.forRoot(),
    WorkshopModule,
    UsersModule,
    PrismaModule,
    DataRequesterModule,
    UploadModule,
    ArticlesModule,
    CollectionsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'assets'),
      serveRoot: '/assets',
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
