import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  // Query,
  UseGuards,
} from '@nestjs/common';
import { ModService } from '../../application/mod.service';
import { UserService } from '../../application/users.service';
import { AuthGuard, Roles } from 'src/modules/auth/guards/role.guard';
import { WorkshopService } from 'src/modules/workshop/domain/services/workshop.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('manage')
@Roles('admin', 'moderator')
@UseGuards(AuthGuard)
export class ModController {
  constructor(
    private readonly userSevice: UserService,
    private readonly modService: ModService,
    private readonly workshopService: WorkshopService,
    @InjectQueue('ban-replay') private readonly banQueue: Queue,
  ) {}

  @Get()
  allowAccess() {
    return 'ok';
  }

  // @Post('set-role')
  // async setRole(
  //   @Session() session: UserRoleSession,
  //   @Body() body: { id: string; role: Role },
  // ) {
  //   return await this.userModService.setRole(session, body.id, body.role);
  // }

  // @Put('update-user')
  // updateUser(@Session() session: UserRoleSession) {
  //   this.checkRole(session);
  // }

  // @Get('ban-entry')
  // banEntry(@Session() session: UserRoleSession, @Query('id') id: string) {
  //   this.checkRole(session);
  // }

  // @Get('ban-player')
  // banPlayer(@Session() session: UserRoleSession, @Query('id') id: string) {
  //   this.checkRole(session);
  // }

  @Post('ban-user')
  @Roles('admin')
  @UseGuards(AuthGuard)
  async banUser(@Body() body: { id: string; banReason: string }) {
    return await this.userSevice.banUser(body.id, body.banReason);
  }

  @Delete('replays/:id')
  async deleteReplay(@Param('id') id: string): Promise<void> {
    await this.banQueue.add(
      'ban-entry',
      { id, deleteReplay: true },
      { jobId: `ban-${id}` },
    );
  }

  @Put('replays/:id/ban')
  async banReplay(@Param('id') id: string): Promise<void> {
    await this.banQueue.add(
      'ban-entry',
      { id, deleteReplay: false },
      { jobId: `ban-${id}` },
    );
  }

  @Put('replays/:id/unban')
  async unbanReplay(@Param('id') id: string): Promise<void> {
    await this.workshopService.unbanReplay(id);
  }

  @Delete('workshop/:id/delete')
  @Roles('admin')
  @UseGuards(AuthGuard)
  async deleteItem(@Param('id') id: string): Promise<void> {
    return await this.workshopService.deleteItem(id);
  }
}
