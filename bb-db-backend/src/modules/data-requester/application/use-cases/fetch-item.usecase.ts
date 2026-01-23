import { Injectable } from '@nestjs/common';
import { SteamApiService } from '../adapters/http-steam-api';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { SyncUserMapsUseCase } from './sync-user-maps.usecase';

@Injectable()
export class FetchItemUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly steamApi: SteamApiService,
    private readonly syncMapsCreator: SyncUserMapsUseCase,
  ) {}

  async execute(steamId: string): Promise<WorkshopItem | null> {
    const itemData = await this.steamApi.getItem(steamId);

    if (!itemData) return null;

    const steamUser = await this.prisma.steamUser.findUnique({
      where: { steamId: itemData.creatorId },
    });
    let map = await this.prisma.workshopItem.findUnique({
      where: { steamId: itemData.steamId },
    });
    let mapList: string[] = [];

    if (steamUser && !steamUser?.items.includes(itemData.steamId)) {
      mapList = [...steamUser.items, itemData.steamId];
    } else if (steamUser) {
      mapList = steamUser.items;
    }

    await this.prisma.steamUser.upsert({
      where: { steamId: itemData.creatorId },
      update: {
        username: itemData.creatorName,
        items: mapList,
      },
      create: {
        steamId: itemData.creatorId,
        username: itemData.creatorName,
        items: [itemData.steamId],
      },
    });

    void this.syncMapsCreator.execute(itemData.creatorId, itemData.creatorName);

    map = await this.prisma.workshopItem.upsert({
      where: { steamId: itemData.steamId },
      update: {
        title: itemData.title,
        creator: itemData.creatorName,
        creatorId: itemData.creatorId,
        ratingUp: itemData.votesUp,
        ratingDown: itemData.votesDown,
        previewUrl: itemData.previewUrl,
        previews: itemData.previews,
        description: itemData.description,
      },
      create: {
        steamId: itemData.steamId,
        title: itemData.title,
        creator: itemData.creatorName,
        creatorId: itemData.creatorId,
        ratingUp: itemData.votesUp,
        ratingDown: itemData.votesDown,
        previewUrl: itemData.previewUrl,
        createDate: itemData.createDate,
        previews: itemData.previews,
        description: itemData.description,
        filename: null,
      },
    });

    return {
      id: map.id,
      steamId: map.steamId,
      title: map.title,
      description: itemData.description,
      creator: itemData.creatorName,
      creatorId: map.creatorId,
      ratingUp: map.ratingUp,
      ratingDown: map.ratingDown,
      createDate: map.createDate,
      previewUrl: itemData.previewUrl,
      previews: itemData.previews,
      filename: map.filename,
    };
  }
}
