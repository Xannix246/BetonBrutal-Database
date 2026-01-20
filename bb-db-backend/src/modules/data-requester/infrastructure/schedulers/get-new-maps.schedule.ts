import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { SteamApiService } from '../../application/adapters/http-steam-api';
import { SteamCmdService } from '../../application/services/steamcmd.service';

@Injectable()
export class GetNewMapsScheduler {
  private readonly logger = new Logger(GetNewMapsScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly steamApi: SteamApiService,
    private readonly steamCmd: SteamCmdService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCron() {
    this.logger.log('Checking for new maps in Steam Workshop...');

    const lastMap = await this.prisma.workshopItem.findFirst({
      orderBy: { createDate: 'desc' },
    });

    const lastTimestamp = lastMap
      ? Math.floor(lastMap.createDate.getTime() / 1000)
      : 0;

    let newItemsCount = 0;

    const items = await this.steamApi.getItems(1, 50);

    const newItems = items.filter(
      (i) => Math.floor(i.createDate.getTime() / 1000) > lastTimestamp,
    );

    newItemsCount = newItems.length;

    for (const item of newItems) {
      await this.steamCmd.downloadWorkshopItem(item.steamId);
      const isDownloaded = await this.steamCmd.copyFileToStorage(item.steamId);

      await this.prisma.workshopItem.upsert({
        where: { steamId: item.steamId },
        update: {
          title: item.title,
          creator: item.creator,
          creatorId: item.creatorId,
          ratingUp: item.ratingUp,
          ratingDown: item.ratingDown,
          previewUrl: item.previewUrl,
          previews: item.previews,
          filename: isDownloaded ? isDownloaded : null,
        },
        create: {
          steamId: item.steamId,
          title: item.title,
          creator: item.creator,
          creatorId: item.creatorId,
          ratingUp: item.ratingUp,
          ratingDown: item.ratingDown,
          previewUrl: item.previewUrl,
          createDate: item.createDate,
          previews: item.previews,
          filename: isDownloaded ? isDownloaded : null,
        },
      });
    }

    this.logger.log(`Finished checking. ${newItemsCount} new maps added.`);
  }
}
