import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiExcludeEndpoint, ApiQuery } from '@nestjs/swagger';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';
import { type Response } from 'express';
import { env } from 'process';
import { FetchBBLBUseCase } from 'src/modules/data-requester/application/use-cases/fetch-bblb.usecase';
import { RefreshDatabaseUseCase } from 'src/modules/data-requester/application/use-cases/refresh-database.usecase';
import { WorkshopService } from 'src/modules/workshop/domain/services/workshop.service';
import { GetQueryListDto, GetQueryReplaysDto } from './workshop.dto';

@Controller('workshop')
export class WorkshopController {
  constructor(
    private readonly workshopService: WorkshopService,
    private readonly refreshDb: RefreshDatabaseUseCase,
    private readonly fetchBblb: FetchBBLBUseCase,
  ) {}

  @Get()
  @OptionalAuth()
  async getTotal(): Promise<number> {
    return this.workshopService.getTotal();
  }

  @Get('get-list')
  @OptionalAuth()
  @ApiQuery({
    name: 'sortBy',
    description: "one of 'mostPopular', 'newest', 'oldest' or 'mostPlayed'",
  })
  @ApiQuery({
    name: 'timeRange',
    description: "one of 'day', 'week', 'month' or 'year'",
  })
  async getList(
    @Query('sortBy') sortBy: SortBy,
    @Query('quantity') quantity: number,
    @Query('sendPreviews') sendPreviews: boolean,
    @Query('timeRange') timeRange?: 'day' | 'week' | 'month' | 'year',
    @Query('page') page: number = 1,
  ): Promise<WorkshopItemHeader[]> {
    if (!quantity) {
      throw new BadRequestException('Quantity is required');
    }

    return await this.workshopService.getList(
      sortBy,
      Number(quantity),
      Boolean(sendPreviews),
      timeRange,
      Number(page),
    );
  }

  @Get('get-random-item')
  @OptionalAuth()
  async getRandomItem(): Promise<string> {
    return await this.workshopService.getRandomItem();
  }

  @Post('get-query-list')
  @OptionalAuth()
  async getQueryList(
    @Query('sendPreviews') sendPreviews: boolean = false,
    @Body() body: GetQueryListDto,
  ): Promise<WorkshopItemHeader[]> {
    if (!body.ids) {
      throw new BadRequestException('Quantity is required');
    }

    return this.workshopService.getQueryItems(body.ids, sendPreviews);
  }

  @Post('get-query-replays')
  @OptionalAuth()
  async getReplaysByQuery(@Body() body: GetQueryReplaysDto): Promise<Replay[]> {
    if (!body.ids) {
      throw new BadRequestException('Quantity is required');
    }

    return this.workshopService.getQueryReplays(body.ids, body.requestMapNames);
  }

  @Get('search')
  @OptionalAuth()
  async search(@Query('q') query: string = '') {
    return this.workshopService.searchWorkshopItems(query);
  }

  @Post('leaderboards')
  @OptionalAuth()
  async getLeaderboards(
    @Body() body: { ids?: string[] },
  ): Promise<Leaderboard[]> {
    const leaderboard = await this.workshopService.getQueryLeaderboards(
      body?.ids,
    );

    return leaderboard;
  }

  @Get('force-update')
  @OptionalAuth()
  @ApiExcludeEndpoint()
  async forceUpdate(@Query('secret') secret: string, @Res() res: Response) {
    if (secret !== env.FORCE_UPDATE_SECRET) {
      return res.status(HttpStatus.FORBIDDEN).send();
    }

    void (await this.refreshDb.execute());
    void (await this.fetchBblb.execute());
    return res.status(HttpStatus.OK).json({ message: 'done' }).send();
  }

  @Get('player/:id')
  @OptionalAuth()
  async getPlayer(@Param('id') id: string): Promise<Player | null> {
    return await this.workshopService.getPlayer(id);
  }

  @Get(':id')
  @OptionalAuth()
  async getItem(@Param('id') id: string): Promise<WorkshopItem | null> {
    return await this.workshopService.getItem(id);
  }

  @Get(':id/replays')
  @OptionalAuth()
  async getReplays(
    @Param('id') id: string,
    @Query('hideBanned') hideBanned: boolean,
  ): Promise<Replay[]> {
    const leaderboard = await this.workshopService.getLeaderboard(id);

    const replays = this.workshopService.getQueryReplays(
      leaderboard?.enteries || [],
      hideBanned,
    );

    return replays;
  }
}
