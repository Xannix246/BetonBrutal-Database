import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { env } from 'process';
import {
  apiKey,
  admin as BAdmin,
  createAuthMiddleware,
} from 'better-auth/plugins';
import { createAccessControl } from 'better-auth/plugins/access';
import { getEventEmitter } from 'src/shared/event-emitter';

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
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      const session = ctx.context.session;
      if (!session?.user) return;

      const account = await prisma.account.findUnique({
        where: { userId: session.user.id },
      });
      if (!account) return;

      getEventEmitter().emit('discord.sync', {
        userId: session.user.id,
        accountId: account.id,
      });
    }),
  },
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
    apiKey({
      apiKeyHeaders: ['x-api-key', 'api-key'],
      enableSessionForAPIKeys: true,
      rateLimit: {
        timeWindow: 60000,
        maxRequests: 600,
      },
    }),
  ],
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
    additionalFields: {
      steamId: {
        type: 'string',
        defaultValue: null,
        input: false,
        required: false,
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
  trustedOrigins: [
    env.CLIENT_URL || 'db.betonbrutal.com',
    env.MIRROR_URL || 'ru-db.betonbrutal.com',
  ],
});

export type UserRoleSession = typeof auth.$Infer.Session;
