import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { FetchItemUseCase } from 'src/modules/data-requester/application/use-cases/fetch-item.usecase';

@Processor('request-map')
export class MapRequesterProcessor extends WorkerHost {
  private readonly logger = new Logger(MapRequesterProcessor.name);
  private readonly controller = new AbortController();

  constructor(private readonly fetchItems: FetchItemUseCase) {
    super();
  }

  async process(job: Job<{ id: string; timeout: number }>) {
    if (!job.data.id) return;

    const timer = setTimeout(
      () => this.controller.abort(),
      job.data.timeout || 60000,
    );

    try {
      await this.fetchItems.execute(job.data.id);
    } catch {
      this.logger.warn('Job timeout');
    } finally {
      clearTimeout(timer);
    }
  }
}
