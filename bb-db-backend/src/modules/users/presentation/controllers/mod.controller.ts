import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  // Put,
  // Query,
  Session,
} from '@nestjs/common';
import { type UserRoleSession } from 'src/modules/auth/auth.module';
import { UserModService } from '../../application/users-mod.service';
import { UserService } from '../../application/users.service';
import { Role } from '@prisma/client';

@Controller('manage')
export class ModController {
  constructor(
    private readonly userSevice: UserService,
    private readonly userModService: UserModService,
  ) {}

  private checkRole(session: UserRoleSession) {
    if (!['moderator', 'admin'].includes(session.user.role as string)) {
      throw new ForbiddenException();
    }
  }

  @Get()
  allowAccess(@Session() session: UserRoleSession) {
    this.checkRole(session);

    return 'ok';
  }

  @Post('set-role')
  async setRole(
    @Session() session: UserRoleSession,
    @Body() body: { id: string; role: Role },
  ) {
    this.checkRole(session);

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
  async banUser(
    @Session() session: UserRoleSession,
    @Body() body: { id: string; banReason: string },
  ) {
    this.checkRole(session);

    return await this.userSevice.banUser(body.id, body.banReason);
  }
}
