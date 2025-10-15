import { Body, Controller, Delete, Get, Param, Query } from '@nestjs/common';
import {
  OptionalAuth,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';
import { UserService } from '../../application/users.service';

@Controller('user')
export class UsersController {
  constructor(private readonly userSevice: UserService) {}

  @Get('me')
  getProfile(@Session() session: UserSession) {
    return { user: session.user };
  }

  @Get('/favorites/add')
  async addFavorites(@Query('id') id: string, @Session() session: UserSession) {
    return await this.userSevice.addToFavorites(session.user.id, id);
  }

  @Delete('/favorites/delete')
  async deleteFavorites(
    @Query('id') id: string,
    @Session() session: UserSession,
  ) {
    return await this.userSevice.removeFromFavorites(session.user.id, id);
  }

  @Get('/:id/favorites')
  @OptionalAuth()
  async getFavorites(@Param('id') id: string) {
    return await this.userSevice.getFavorites(id);
  }

  @Get('/:id')
  @OptionalAuth()
  async getUser(@Param('id') id: string) {
    return await this.userSevice.getUser(id);
  }

  // mod

  // admin
}
