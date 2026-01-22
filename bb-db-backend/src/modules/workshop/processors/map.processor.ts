import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { SteamCmdService } from 'src/modules/data-requester/application/services/steamcmd.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Processor('map-downloading')
export class MapDownloaderProcessor extends WorkerHost {
  private readonly logger = new Logger(MapDownloaderProcessor.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly steamCmd: SteamCmdService,
  ) {
    super();
  }

  async process(job: Job<{ id: string }>) {
    const { id } = job.data;

    const map = await this.prisma.workshopItem.findUnique({
      where: { steamId: id },
    });

    if (!map) {
      return this.logger.warn('Map not found');
    }

    if (typeof map.filename === 'string') {
      return;
    }

    this.logger.log(`Trying to download ${id}`);

    await this.steamCmd.downloadWorkshopItem(id);
    const filename = await this.steamCmd.copyFileToStorage(id);

    if (!filename) {
      return this.logger.warn('Failed to download map');
    }

    await this.prisma.workshopItem.update({
      where: { steamId: id },
      data: {
        filename,
      },
    });

    this.logger.log(`${id} was downloaded successfuly`);
  }
}
