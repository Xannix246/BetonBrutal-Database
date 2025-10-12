import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { SteamApiService } from '../adapters/http-steam-api';

@Injectable()
export class RefreshDatabaseUseCase {
  private readonly logger = new Logger(RefreshDatabaseUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly steamApi: SteamApiService,
  ) {}

  async execute(): Promise<void> {
    this.logger.log('Starting database refresh from Steam Workshop...');

    const total = await this.steamApi.getTotal();
    const itemsPerPage = 50;
    const pages = Math.ceil(total / itemsPerPage);

    this.logger.log(`Total maps: ${total}, pages: ${pages}`);

    for (let page = 1; page <= pages; page++) {
      this.logger.log(`Fetching page ${page}...`);
      const items = await this.steamApi.getItems(page, itemsPerPage);

      for (const item of items) {
        await this.prisma.steamUser.upsert({
          where: { steamId: item.creatorId },
          update: {},
          create: {
            steamId: item.creatorId,
            username: item.creator || 'unknown',
          },
        });

        await this.prisma.workshopItem.upsert({
          where: { steamId: item.steamId },
          update: {
            title: item.title,
            creatorId: item.creatorId,
            ratingUp: item.ratingUp,
            ratingDown: item.ratingDown,
            previewUrl: item.previewUrl,
            createDate: item.createDate,
          },
          create: {
            steamId: item.steamId,
            title: item.title,
            creator: 'unknown',
            creatorId: item.creatorId,
            ratingUp: item.ratingUp,
            ratingDown: item.ratingDown,
            createDate: item.createDate,
            previewUrl: item.previewUrl,
            previews: item.previews,
          },
        });
      }
    }

    this.logger.log('Database refresh complete!');
  }
}
