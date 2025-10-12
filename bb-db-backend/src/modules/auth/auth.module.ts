import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaService } from 'src/modules/prisma/prisma.service';

export const auth = betterAuth({
  database: prismaAdapter(PrismaService, {
    provider: 'mongodb',
  }),
});

@Module({
  imports: [AuthModule.forRoot({ auth })],
  exports: [AuthModule.forRoot({ auth })],
})
export class BAuthModule {}
