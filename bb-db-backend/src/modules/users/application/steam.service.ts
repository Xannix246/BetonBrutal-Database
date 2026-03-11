import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import SteamAuth from 'node-steam-openid';
import { env } from 'process';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class SteamService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly steam = new SteamAuth({
    realm: env.CLIENT_URL!,
    returnUrl: `${env.CLIENT_URL}/api/user/link-steam`,
    apiKey: env.STEAM_WEB_API_KEY!,
  });

  async getRedirectUrl(): Promise<string> {
    return await this.steam.getRedirectUrl();
  }

  async linkSteamId(
    req: Request,
    res: Response,
    userId: string,
  ): Promise<void> {
    const user = await this.steam.authenticate(req);

    if (!user || !user.steamid) return;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        steamId: user.steamid,
      },
    });

    return res.redirect(env.CLIENT_URL!);
  }

  async unlinkSteamId(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        steamId: null,
      },
    });
  }
}
