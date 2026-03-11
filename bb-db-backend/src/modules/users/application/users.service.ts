import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { auth } from 'src/modules/auth/auth.module';
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
      steamId: user.steamId,
    };
  }

  async getUserBySteamId(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { steamId: id },
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
      steamId: user.steamId,
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

  async getPublicData(userId: string): Promise<PublicData> {
    const data = await this.prisma.publicData.findUnique({
      where: { userId },
    });

    if (!data) {
      throw new NotFoundException('User data not found');
    }

    return data;
  }

  async setPublicData(
    data: PublicData,
    session: UserSession,
  ): Promise<PublicData> {
    const existingData = await this.prisma.publicData.findFirst({
      where: { userId: session.user.id },
    });

    if (existingData && existingData.userId !== session.user.id) {
      throw new ForbiddenException();
    }

    if (data.links && data.links.length > 5) {
      throw new BadRequestException('Links limit is 5');
    }

    return await this.prisma.publicData.upsert({
      where: { userId: session.user.id },
      update: {
        profilePicUrl: data.profilePicUrl,
        backgroundUrl: data.backgroundUrl,
        about: data.about,
        links: data.links,
      },
      create: {
        userId: session.user.id,
        profilePicUrl: data.profilePicUrl,
        backgroundUrl: data.backgroundUrl,
        about: data.about,
        links: data.links,
      },
    });
  }

  async deleteData(userId: string) {
    // delete all user data like favorites/comments and articles

    void (await this.prisma.favorites.deleteMany({
      where: { userId: userId },
    }));
    void (await this.prisma.comment.deleteMany({ where: { userId } }));
    void (await this.prisma.article.deleteMany({
      where: { authorId: userId },
    }));
    void (await this.prisma.publicData.deleteMany({ where: { userId } }));
  }

  async banUser(userId: string, banReason?: string) {
    return await auth.api.banUser({
      body: {
        userId,
        banReason,
      },
    });
  }
}
