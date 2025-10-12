import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class SyncUserMapsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(steamId: string, username: string): Promise<void> {
    await this.prisma.workshopItem.updateMany({
      where: { creatorId: steamId },
      data: { creator: username },
    });

    const maps = await this.prisma.workshopItem.findMany({
      where: { creatorId: steamId },
    });

    await this.prisma.steamUser.update({
      where: { steamId },
      data: {
        items: maps.map((m) => m.steamId),
      },
    });
  }
}
