import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

@Controller('users')
export class UsersController {
  @Get('me')
  getProfile(@Session() session: UserSession) {
    return { user: session.user };
  }

  @Get('user/:id/favorite')
  async getFavorites(@Param('id') id: string) {}

  // mod

  // admin
}
