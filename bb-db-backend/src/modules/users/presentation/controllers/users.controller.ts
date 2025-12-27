import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  OptionalAuth,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';
import { UserService } from '../../application/users.service';
import { type UserRoleSession } from 'src/modules/auth/auth.module';
import { env } from 'process';
import { Role } from '@prisma/client';
import { UserModService } from '../../application/users-mod.service';

@Controller('user')
export class UsersController {
  constructor(
    private readonly userSevice: UserService,
    private readonly userModService: UserModService,
  ) {}

  @Get('me')
  getProfile(@Session() session: UserSession) {
    return { user: session.user };
  }

  @Delete('me/delete')
  async deleteData(@Session() session: UserRoleSession) {
    return await this.userSevice.deleteData(session.user.id);
  }

  @Get('favorites/add')
  async addFavorites(@Query('id') id: string, @Session() session: UserSession) {
    return await this.userSevice.addToFavorites(session.user.id, id);
  }

  @Delete('favorites/delete')
  async deleteFavorites(
    @Query('id') id: string,
    @Session() session: UserSession,
  ) {
    return await this.userSevice.removeFromFavorites(session.user.id, id);
  }

  @Get(':id/favorites')
  @OptionalAuth()
  async getFavorites(@Param('id') id: string) {
    return await this.userSevice.getFavorites(id);
  }

  @Post(':id/set-role')
  @OptionalAuth()
  async deleteItem(
    @Param('id') id: string,
    @Body() body: { secret: string; role: Role },
  ): Promise<void> {
    if (body.secret !== env.FORCE_UPDATE_SECRET) {
      throw new ForbiddenException('Invalid secret');
    }

    return await this.userModService.forceSetRole(id, body.role);
  }

  @Get(':id')
  @OptionalAuth()
  async getUser(@Param('id') id: string) {
    return await this.userSevice.getUser(id);
  }
}
