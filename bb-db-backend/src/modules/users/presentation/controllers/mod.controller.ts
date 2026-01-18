import {
  Body,
  Controller,
  Get,
  Post,
  // Put,
  // Query,
  Session,
  UseGuards,
} from '@nestjs/common';
import { type UserRoleSession } from 'src/modules/auth/auth.module';
import { UserModService } from '../../application/users-mod.service';
import { UserService } from '../../application/users.service';
import { Role } from '@prisma/client';
import { AuthGuard, Roles } from 'src/modules/auth/guards/role.guard';

@Controller('manage')
export class ModController {
  constructor(
    private readonly userSevice: UserService,
    private readonly userModService: UserModService,
  ) {}

  @Get()
  @Roles('admin', 'moderator')
  @UseGuards(AuthGuard)
  allowAccess() {
    return 'ok';
  }

  @Post('set-role')
  @Roles('admin', 'moderator')
  @UseGuards(AuthGuard)
  async setRole(
    @Session() session: UserRoleSession,
    @Body() body: { id: string; role: Role },
  ) {
    return await this.userModService.setRole(session, body.id, body.role);
  }

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
  @Roles('admin', 'moderator')
  @UseGuards(AuthGuard)
  async banUser(@Body() body: { id: string; banReason: string }) {
    return await this.userSevice.banUser(body.id, body.banReason);
  }
}
