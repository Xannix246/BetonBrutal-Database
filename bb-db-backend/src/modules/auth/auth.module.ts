import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { env } from 'process';

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'mongodb',
  }),
  // basePath: 'auth',
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    },
  },
  user: {
    modelName: 'User',
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'User',
      },
    },
  },
  verification: {
    modelName: 'Verification',
  },
  account: {
    modelName: 'Account',
  },
  session: {
    modelName: 'Session',
  },
  trustedOrigins: [env.CLIENT_URL || 'db.betonbrutal.com'],
});

@Module({
  imports: [AuthModule.forRoot({ auth })],
  exports: [AuthModule],
})
export class BAuthModule {}
