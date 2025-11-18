import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import {
  OptionalAuth,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';
import { type Response } from 'express';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { PostCommentDto } from './dto/comments.dto';
import { type UserRoleSession } from 'src/modules/auth/auth.module';

@Controller('comments')
export class CommentsController {
  constructor(private readonly prisma: PrismaService) {}
  @Post('post')
  async commentMap(
    @Session() session: UserSession,
    @Body() body: PostCommentDto,
  ): Promise<UserComment> {
    const comment = await this.prisma.comment.create({
      data: {
        mapId: body.mapId,
        userId: session.user.id,
        data: body.message,
        createdAt: new Date(),
      },
    });

    return {
      id: comment.id,
      mapId: comment.mapId,
      userId: comment.userId,
      username: session.user.name,
      data: comment.data,
      createdAt: comment.createdAt,
    };
  }

  @Get()
  @OptionalAuth()
  async getComments(@Query('id') id: string): Promise<UserComment[]> {
    const comments = await this.prisma.comment.findMany({
      where: { mapId: id },
    });

    const returnComments: UserComment[] = [];

    for (const comment of comments) {
      const username = (
        await this.prisma.user.findUnique({
          where: { id: comment.userId },
        })
      )?.name;

      returnComments.push({
        id: comment.id,
        mapId: comment.mapId,
        userId: comment.userId,
        username: username || 'unknown',
        data: comment.data,
        createdAt: comment.createdAt,
      });
    }
    return returnComments;
  }

  @Delete()
  async deleteComment(
    @Session() session: UserRoleSession,
    @Query('id') id: string,
    @Res() res: Response,
  ) {
    const comment = await this.prisma.comment.findUnique({ where: { id: id } });

    if (
      session.user.id === comment?.userId &&
      ['moderator', 'admin'].includes(session.user.role as string)
    ) {
      return await this.prisma.comment.delete({ where: { id: id } });
    } else {
      return res.status(HttpStatus.FORBIDDEN).send();
    }
  }
}
