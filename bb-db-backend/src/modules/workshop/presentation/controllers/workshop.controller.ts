import { Controller, Get, HttpStatus, Param, Query, Res } from '@nestjs/common';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';
import { type Response } from 'express';
import { env } from 'process';
import { RefreshDatabaseUseCase } from 'src/modules/data-requester/application/use-cases/refresh-database.usecase';
import { WorkshopService } from 'src/modules/workshop/domain/services/workshop.service';

@Controller('workshop')
export class WorkshopController {
  constructor(
    private readonly workshopService: WorkshopService,
    private readonly refreshDb: RefreshDatabaseUseCase,
  ) {}

  @Get()
  @OptionalAuth()
  async getTotal(): Promise<number> {
    return this.workshopService.getTotal();
  }

  @Get('get-list')
  @OptionalAuth()
  async getList(
    @Query('sortBy') sortBy: SortBy,
    @Query('quantity') quantity: number,
    @Query('sendPreviews') sendPreviews: boolean,
    @Query('timeRange') timeRange?: 'day' | 'week' | 'month' | 'year',
    @Query('page') page: number = 1,
  ): Promise<WorkshopItemHeader[]> {
    return this.workshopService.getList(
      sortBy,
      Number(quantity),
      Boolean(sendPreviews),
      timeRange,
      Number(page),
    );
  }

  @Get('force-update')
  @OptionalAuth()
  async forceUpdate(@Query('secret') secret: string, @Res() res: Response) {
    console.log(secret, env.FORCE_UPDATE_SECRET);
    if (secret !== env.FORCE_UPDATE_SECRET) {
      return res.status(HttpStatus.FORBIDDEN).send();
    }

    void (await this.refreshDb.execute());
    return res.status(HttpStatus.OK).json({ message: 'done' }).send();
  }

  @Get(':id')
  @OptionalAuth()
  async getItem(@Param('id') id: string): Promise<WorkshopItem> {
    console.log(id);
    return this.workshopService.getItem(id);
  }

  // @Get(':id/replays')
  // @OptionalAuth()
  // async getReplays(@Param('id') id: string): Promise<Replay[]> {

  // }
}
