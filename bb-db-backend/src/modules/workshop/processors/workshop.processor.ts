import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import axios from 'axios';
import { Job } from 'bullmq';
import { FetchItemUseCase } from 'src/modules/data-requester/application/use-cases/fetch-item.usecase';
import { RestorePreviewUseCase } from 'src/modules/storage/use-cases/restore-preview.usecase';

@Processor('request-map')
export class MapRequesterProcessor extends WorkerHost {
  private readonly logger = new Logger(MapRequesterProcessor.name);
  private readonly controller = new AbortController();

  constructor(
    private readonly fetchItems: FetchItemUseCase,
    private readonly restorePreview: RestorePreviewUseCase,
  ) {
    super();
  }

  async process(job: Job<{ id: string; timeout: number }>) {
    if (!job.data.id) return;

    const timer = setTimeout(
      () => this.controller.abort(),
      job.data.timeout || 60000,
    );

    try {
      const workshopItem = await this.fetchItems.execute(job.data.id);

      if (
        workshopItem &&
        new URL(workshopItem.previewUrl).hostname.includes('steam')
      ) {
        await axios
          .get(workshopItem.previewUrl, {
            timeout: 5000,
          })
          .catch(() => this.restorePreview.execute(job.data.id));
      }

      if (!workshopItem) {
        await this.restorePreview.execute(job.data.id);
      }
    } catch {
      this.logger.warn('Job timeout');
    } finally {
      clearTimeout(timer);
    }
  }
}
