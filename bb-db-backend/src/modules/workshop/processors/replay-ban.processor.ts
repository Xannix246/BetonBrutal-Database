import { Processor, WorkerHost } from '@nestjs/bullmq';
import { WorkshopService } from '../domain/services/workshop.service';
import { Job } from 'bullmq';

@Processor('ban-replay')
export class BanReplayProcessor extends WorkerHost {
  constructor(private readonly workshopService: WorkshopService) {
    super();
  }

  async process(
    job: Job<{ id: string; deleteReplay?: boolean }>,
  ): Promise<any> {
    await this.workshopService.banOrDeleteLeaderboardEntry(
      job.data.id,
      job.data.deleteReplay,
    );
  }
}
