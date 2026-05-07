import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseArrayPipe,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  Session,
} from '@nestjs/common';
import { ApiExcludeEndpoint, ApiQuery } from '@nestjs/swagger';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';
import { type Response } from 'express';
import { env } from 'process';
import { FetchBBLBUseCase } from 'src/modules/data-requester/application/use-cases/fetch-bblb.usecase';
import { RefreshDatabaseUseCase } from 'src/modules/data-requester/application/use-cases/refresh-database.usecase';
import { WorkshopService } from 'src/modules/workshop/domain/services/workshop.service';
import { GetQueryListDto, GetQueryReplaysDto } from '../dto/workshop.dto';
import { MapTierService } from '../../domain/services/map-tier.service';
import { TierData, TierEntry } from '@prisma/client';
import { type UserRoleSession } from 'src/modules/auth/auth.module';

@Controller('workshop')
export class WorkshopController {
  constructor(
    private readonly workshopService: WorkshopService,
    private readonly refreshDb: RefreshDatabaseUseCase,
    private readonly fetchBblb: FetchBBLBUseCase,
    private readonly tierService: MapTierService,
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
    required: false,
  })
  async getList(
    @Query('sortBy') sortBy: SortBy,
    @Query('quantity', ParseIntPipe) quantity: number,
    @Query('sendPreviews', new ParseBoolPipe({ optional: true }))
    sendPreviews: boolean,
    @Query('tags', new ParseArrayPipe({ optional: true })) tags: string[],
    @Query('timeRange') timeRange?: 'day' | 'week' | 'month' | 'year',
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('tier', new ParseIntPipe({ optional: true })) tier?: number,
  ): Promise<WorkshopItemHeader[]> {
    if (!quantity) {
      throw new BadRequestException('Quantity is required');
    }

    return await this.workshopService.getList(
      sortBy,
      quantity,
      sendPreviews,
      timeRange,
      page,
      tags,
      tier,
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
    @Query('sendPreviews', new ParseBoolPipe({ optional: true }))
    sendPreviews: boolean = false,
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

    return this.workshopService.getQueryReplays(
      body.ids,
      body.requestMapNames,
      body.hideBanned,
    );
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

  @Get('get-tier-entries')
  @OptionalAuth()
  async getTierEntries(
    @Query('mapId') mapId: string,
    @Query('userId') userId: string,
    @Query('tierId') tierId: string,
    @Query('type') type: 'accepted' | 'denied' | 'pending',
  ) {
    return this.tierService.getTierEntries({ userId, tierId, mapId, type });
  }

  @Get('force-update')
  @OptionalAuth()
  @ApiExcludeEndpoint()
  async forceUpdate(
    @Query('secret') secret: string,
    @Query('refreshDb', new ParseBoolPipe({ optional: true }))
    refreshDb: boolean,
    @Query('fetchBblb', new ParseBoolPipe({ optional: true }))
    fetchBblb: boolean,
    @Query('clearQueue', new ParseBoolPipe({ optional: true }))
    clearQueue: boolean,
    @Res() res: Response,
  ) {
    if (secret !== env.FORCE_UPDATE_SECRET) {
      return res.status(HttpStatus.FORBIDDEN).send();
    }

    if (refreshDb) {
      console.log('db refreshing...');
      void (await this.refreshDb.execute());
    }

    if (fetchBblb) {
      console.log('bblb fetching...');
      void (await this.fetchBblb.execute());
    }

    if (clearQueue) {
      console.log('clearing queue...');
      void this.workshopService.clearQueue();
    }

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
    @Query('getMapName', new ParseBoolPipe({ optional: true }))
    getMapName?: boolean,
    @Query('hideBanned', new ParseBoolPipe({ optional: true }))
    hideBanned?: boolean,
  ): Promise<Replay[]> {
    const leaderboard = await this.workshopService.getLeaderboard(id);

    const replays = this.workshopService.getQueryReplays(
      leaderboard?.enteries || [],
      getMapName,
      hideBanned,
    );

    return replays;
  }

  @Get(':id/tier')
  @OptionalAuth()
  async getTier(@Param('id') id: string): Promise<TierData | null> {
    return this.tierService.getTierData(id);
  }

  @Post(':id/tier')
  async postTier(
    @Param('id') id: string,
    @Session() session: UserRoleSession,
    @Body() body: { tier: number },
  ): Promise<TierEntry> {
    return this.tierService.createTierEntry(session.user.id, id, body.tier);
  }

  @Put(':id/tier')
  async updateTier(
    @Param('id') id: string,
    @Session() session: UserRoleSession,
    @Body() body: { tier: number },
  ): Promise<TierEntry> {
    return this.tierService.updateUserEntry(session.user.id, id, body.tier);
  }
}
