import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { FetchItemUseCase } from 'src/modules/data-requester/application/use-cases/fetch-item.usecase';

@Processor('request-map')
export class MapRequesterProcessor extends WorkerHost {
  constructor(private readonly fetchItems: FetchItemUseCase) {
    super();
  }

  async process(job: Job<{ id: string }>) {
    if (!job.data.id) return;

    await this.fetchItems.execute(job.data.id);
  }
}
