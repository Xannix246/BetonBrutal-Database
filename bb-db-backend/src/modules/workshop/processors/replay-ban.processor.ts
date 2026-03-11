import { Processor, WorkerHost } from '@nestjs/bullmq';
import { WorkshopService } from '../domain/services/workshop.service';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('ban-replay')
export class BanReplayProcessor extends WorkerHost {
  private readonly logger = new Logger(BanReplayProcessor.name);
  private readonly controller = new AbortController();
  constructor(private readonly workshopService: WorkshopService) {
    super();
  }

  async process(
    job: Job<{
      id: string;
      unban?: boolean;
      deleteReplay?: boolean;
      timeout?: number;
    }>,
  ): Promise<any> {
    const timer = setTimeout(
      () => this.controller.abort(),
      job.data.timeout || 180000,
    );

    try {
      if (job.data.unban) {
        await this.workshopService.unbanReplay(job.data.id);
      } else {
        await this.workshopService.banOrDeleteLeaderboardEntry(
          job.data.id,
          job.data.deleteReplay,
        );
      }
    } catch {
      this.logger.warn('Job timeout');
    } finally {
      clearTimeout(timer);
    }
  }
}
