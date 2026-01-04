import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { ApiExcludeEndpoint, ApiQuery } from '@nestjs/swagger';
import { OptionalAuth, Session } from '@thallesp/nestjs-better-auth';
import { type Response } from 'express';
import { env } from 'process';
import { FetchBBLBUseCase } from 'src/modules/data-requester/application/use-cases/fetch-bblb.usecase';
import { RefreshDatabaseUseCase } from 'src/modules/data-requester/application/use-cases/refresh-database.usecase';
import { WorkshopService } from 'src/modules/workshop/domain/services/workshop.service';
import { GetQueryListDto, GetQueryReplaysDto } from './workshop.dto';
import { type UserRoleSession } from 'src/modules/auth/auth.module';

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
    description: "one of 'mostPopular', 'newest' or 'oldest'", // or mostPlayed
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
    @Param('hideBanned') hideBanned: boolean,
  ): Promise<Replay[]> {
    const leaderboard = await this.workshopService.getLeaderboard(id);

    const replays = this.workshopService.getQueryReplays(
      leaderboard?.enteries || [],
      hideBanned,
    );

    return replays;
  }

  @Delete(':id/replays')
  async deleteReplay(
    @Param('id') id: string,
    @Session() session: UserRoleSession,
  ): Promise<void> {
    if (!['moderator', 'admin'].includes(session.user.role as string)) {
      throw new ForbiddenException('Forbidden');
    }

    await this.workshopService.banOrDeleteLeaderboardEntry(id, true);
  }

  @Put(':id/replays/ban')
  async banReplay(
    @Param('id') id: string,
    @Session() session: UserRoleSession,
  ): Promise<void> {
    if (!['moderator', 'admin'].includes(session.user.role as string)) {
      throw new ForbiddenException('Forbidden');
    }

    await this.workshopService.banOrDeleteLeaderboardEntry(id);
  }

  @Put(':id/replays/unban')
  async unbanReplay(
    @Param('id') id: string,
    @Session() session: UserRoleSession,
  ): Promise<void> {
    if (!['moderator', 'admin'].includes(session.user.role as string)) {
      throw new ForbiddenException('Forbidden');
    }

    await this.workshopService.unbanReplay(id);
  }

  @Delete(':id/delete')
  async deleteItem(
    @Param('id') id: string,
    @Session() session: UserRoleSession,
  ): Promise<void> {
    if (!['moderator', 'admin'].includes(session.user.role as string)) {
      throw new ForbiddenException('Forbidden');
    }

    return await this.workshopService.deleteItem(id);
  }
}
