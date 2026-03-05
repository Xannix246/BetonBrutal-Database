import 'dotenv/config';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
// import { env as prismaEnv } from 'prisma/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // constructor() {
  //   super({
  //     accelerateUrl: prismaEnv('DATABASE_URL'),
  //   });
  // }

  async onModuleInit() {
    await this.$connect();

    // migration
    // await this.leaderboardEntry.updateMany({
    //   data: {
    //     banned: false,
    //   },
    // });
    // console.log('Migration done');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
