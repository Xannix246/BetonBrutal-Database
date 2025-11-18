import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { env } from 'process';
import { admin as BAdmin } from 'better-auth/plugins';
import { createAccessControl } from 'better-auth/plugins/access';

const prisma = new PrismaClient();

const statement = {
  project: ['create', 'share', 'update', 'delete'],
} as const;

const ac = createAccessControl(statement);

export const user = ac.newRole({
  project: [],
});
export const writer = ac.newRole({
  project: ['create'],
});
export const moderator = ac.newRole({
  project: ['create', 'update'],
});
export const admin = ac.newRole({
  project: ['create', 'update', 'delete'],
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'mongodb',
  }),
  plugins: [
    BAdmin({
      ac,
      roles: {
        user,
        writer,
        moderator,
        admin,
      },
    }),
  ],
  // basePath: 'auth',
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    },
  },
  user: {
    modelName: 'User',
    deleteUser: {
      enabled: true,
    },
    // additionalFields: {
    //   role: {
    //     type: 'string',
    //     defaultValue: 'User',
    //     input: false,
    //   },
    // },
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

export type UserRoleSession = typeof auth.$Infer.Session;
