import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
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
import { ModService } from '../../application/mod.service';
import { SteamService } from '../../application/steam.service';
import { type Response } from 'express';
import { UpdatePublicDataDto } from './dto/update-data.dto';

@Controller('user')
export class UsersController {
  constructor(
    private readonly userSevice: UserService,
    private readonly modService: ModService,
    private readonly steamService: SteamService,
  ) {}

  @Get('me')
  getProfile(@Session() session: UserSession) {
    return { user: session.user };
  }

  @Get('me/update')
  updateProfile(@Session() session: UserSession) {
    return this.userSevice.syncUserData(session.user.id);
  }

  @Delete('me/delete')
  async deleteData(@Session() session: UserRoleSession) {
    return this.userSevice.deleteData(session.user.id);
  }

  @Get('favorites/add')
  async addFavorites(@Query('id') id: string, @Session() session: UserSession) {
    return this.userSevice.addToFavorites(session.user.id, id);
  }

  @Delete('favorites/delete')
  async deleteFavorites(
    @Query('id') id: string,
    @Session() session: UserSession,
  ) {
    return this.userSevice.removeFromFavorites(session.user.id, id);
  }

  @Get('public-data/:id')
  @OptionalAuth()
  async getPublicData(@Param('id') id: string) {
    return this.userSevice.getPublicData(id);
  }

  @Put('public-data')
  async setPublicData(
    @Body() body: UpdatePublicDataDto,
    @Session() session: UserSession,
  ) {
    return this.userSevice.setPublicData(
      {
        ...body,
        userId: session.user.id,
      },
      session,
    );
  }

  @Get('steam')
  async steam(@Res() res: Response) {
    const url = await this.steamService.getRedirectUrl();
    return res.redirect(url);
  }

  @Get('link-steam')
  async linkSteam(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: UserRoleSession,
  ) {
    return this.steamService.linkSteamId(req, res, session.user.id);
  }

  @Get('unlink-steam')
  async unlinkSteam(@Session() session: UserRoleSession) {
    return this.steamService.unlinkSteamId(session.user.id);
  }

  @Get('s-id/:id')
  @OptionalAuth()
  async getBySteamId(@Param('id') id: string) {
    return this.userSevice.getUserBySteamId(id);
  }

  @Get(':id/favorites')
  @OptionalAuth()
  async getFavorites(@Param('id') id: string) {
    return this.userSevice.getFavorites(id);
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

    return this.modService.forceSetRole(id, body.role);
  }

  @Get(':id')
  @OptionalAuth()
  async getUser(@Param('id') id: string) {
    return this.userSevice.getUser(id);
  }
}
