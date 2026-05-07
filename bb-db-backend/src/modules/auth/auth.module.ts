import 'dotenv/config';
import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { UsersModule } from '../users/users.module';
import { DiscordSyncListener } from './listeners/discord.listener';
import { auth } from './services/auth.shared';
// import { env as prismaEnv } from 'prisma/config';

@Module({
  imports: [AuthModule.forRoot({ auth }), UsersModule],
  providers: [DiscordSyncListener],
})
export class BAuthModule {}

export type UserRoleSession = typeof auth.$Infer.Session;
