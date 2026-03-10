import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { env } from 'node:process';
import { SteamCmdService } from 'src/modules/data-requester/application/services/steamcmd.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Processor('map-downloading')
export class MapDownloaderProcessor extends WorkerHost {
  private readonly logger = new Logger(MapDownloaderProcessor.name);
  private readonly controller = new AbortController();
  constructor(
    private readonly prisma: PrismaService,
    private readonly steamCmd: SteamCmdService,
  ) {
    super();
  }

  async process(job: Job<{ id: string; timeout?: number }>) {
    if (Number(env.DISABLE_DOWNLOADING)) return;

    const { id } = job.data;
    const timer = setTimeout(
      () => this.controller.abort(),
      job.data.timeout || 60000,
    );

    try {
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

      await this.steamCmd.enqueue(id);
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
    } catch {
      this.logger.warn('Job timeout');
    } finally {
      clearTimeout(timer);
    }
  }
}
