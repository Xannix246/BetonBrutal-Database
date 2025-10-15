/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { WorkshopService } from 'src/modules/workshop/domain/services/workshop.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workshopService: WorkshopService,
  ) {}

  async getUser(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return {
      id: user.id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      email: '',
      emailVerified: false,
      name: user.name,
      role: '',
      image: user.image,
    };
  }

  async getFavorites(id: string): Promise<WorkshopItemHeader[]> {
    const favList = await this.prisma.favorites.findUnique({
      where: { userId: id },
    });

    if (!favList) {
      return [];
    } else {
      return await this.workshopService.getQueryItems(favList.mapsId);
    }
  }

  async addToFavorites(userId: string, mapId: string): Promise<string[]> {
    const favList = await this.prisma.favorites.findUnique({
      where: { userId },
    });

    const returnFav = await this.prisma.favorites.upsert({
      where: { userId },
      update: {
        mapsId: [...new Set([...(favList?.mapsId || []), mapId])],
      },
      create: {
        userId,
        mapsId: [mapId],
      },
    });

    return returnFav.mapsId;
  }

  async removeFromFavorites(userId: string, mapId: string): Promise<string[]> {
    const favList = await this.prisma.favorites.findUnique({
      where: { userId },
    });

    if (!favList) {
      return [];
    }

    const returnFav = await this.prisma.favorites.upsert({
      where: { userId },
      update: {
        mapsId: favList?.mapsId.filter((map) => map !== mapId),
      },
      create: {
        userId,
        mapsId: [],
      },
    });

    return returnFav.mapsId;
  }
}
