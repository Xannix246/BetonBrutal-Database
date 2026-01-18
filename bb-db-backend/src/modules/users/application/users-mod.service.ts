import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { auth, UserRoleSession } from 'src/modules/auth/auth.module';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { WorkshopService } from 'src/modules/workshop/domain/services/workshop.service';

@Injectable()
export class UserModService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workshopService: WorkshopService,
  ) {}

  async setRole(session: UserRoleSession, userId: string, role: Role) {
    return await auth.api.setRole({
      body: {
        userId,
        role: role,
      },
      headers: {
        Authorization: `Bearer ${session.session.token}`,
      },
    });
  }

  async forceSetRole(userId: string, role: Role) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  //async updateUser(session: UserRoleSession) {}
}
