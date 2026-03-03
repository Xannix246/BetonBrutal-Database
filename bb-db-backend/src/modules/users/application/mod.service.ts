import { BadRequestException, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { auth, UserRoleSession } from 'src/modules/auth/auth.module';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { WorkshopService } from 'src/modules/workshop/domain/services/workshop.service';

@Injectable()
export class ModService {
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

  // workshop
  async upsertMap(id: string, workshopItem: WorkshopItemUpsert) {
    if (
      workshopItem.type !== 'WorkshopItemCreate' &&
      workshopItem.type !== 'WorkshopItemUpdate'
    ) {
      console.log(workshopItem);
      throw new BadRequestException(
        'Type should be "WorkshopItemCreate" or "WorkshopItemUpdate"',
      );
    }

    return await this.workshopService.upsertItem(id, workshopItem);
  }
}
