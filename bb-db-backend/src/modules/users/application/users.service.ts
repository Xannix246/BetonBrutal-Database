import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserSession } from '@thallesp/nestjs-better-auth';
import axios from 'axios';
import { DiscordOAuthData, DiscordTokenRefreshResponce } from 'd.types/auth';
import { auth } from '../../auth/services/auth.shared';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { WorkshopService } from 'src/modules/workshop/domain/services/workshop.service';
import { env } from 'process';

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

  async syncUserData(id: string): Promise<User | null> {
    let userData = await this.prisma.account.findUnique({
      where: { userId: id },
    });

    if (!userData) {
      throw new NotFoundException('Account not found');
    }

    if (
      userData.lastUpdated &&
      userData.lastUpdated.valueOf() + 1000 * 60 * 60 > new Date().valueOf()
    ) {
      return null;
    }

    if (
      !userData.accessTokenExpiresAt ||
      userData.accessTokenExpiresAt < new Date()
    ) {
      const data = (
        await axios.post(
          'https://discord.com/api/oauth2/token',
          new URLSearchParams({
            client_id: env.DISCORD_CLIENT_ID!,
            client_secret: env.DISCORD_CLIENT_SECRET!,
            grant_type: 'refresh_token',
            refreshToken: userData.refreshToken!,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        )
      ).data as DiscordTokenRefreshResponce;

      userData = await this.prisma.account.update({
        where: { userId: id },
        data: {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          accessTokenExpiresAt: new Date(
            new Date().valueOf() + data.expires_in,
          ),
          lastUpdated: new Date(),
        },
      });
    }

    const updatedUserData = (
      await axios.get('https://discord.com/api/oauth2/@me', {
        headers: {
          Authorization: `Bearer ${userData.accessToken}`,
        },
      })
    ).data as DiscordOAuthData;

    await this.prisma.account.update({
      where: { userId: id },
      data: { lastUpdated: new Date() },
    });

    return this.prisma.user.update({
      where: { id },
      data: {
        name: updatedUserData.user.global_name,
        image: `https://cdn.discordapp.com/avatars/${updatedUserData.user.id}/${updatedUserData.user.avatar}.png`,
      },
    });
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
