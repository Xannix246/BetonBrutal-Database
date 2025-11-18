import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { OptionalAuth, Session } from '@thallesp/nestjs-better-auth';
import { type UserRoleSession } from 'src/modules/auth/auth.module';
import { PostArticleDto } from './dto/articles.dto';
import { ArticlesService } from '../domain/articles.service';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articles: ArticlesService) {}

  @Get('get-articles')
  @OptionalAuth()
  async getArticles(
    @Query('sortBy') sortBy: SortBy, // but used only newest and oldest for now
    @Query('quantity') quantity: number,
    @Query('timeRange') timeRange?: 'day' | 'week' | 'month' | 'year',
    @Query('page') page: number = 1,
    @Query('tags') tags: string = '',
    @Query('strictComparison') strictComparison?: boolean,
    @Query('searchText') searchText: string = '',
  ) {
    if (!quantity) {
      throw new BadRequestException();
    }

    return await this.articles.getArticles(
      sortBy,
      Number(quantity),
      timeRange,
      Number(page),
      tags.length > 0 ? tags.split(',') : [],
      strictComparison,
      searchText,
    );
  }

  @Post('new-article')
  async postArticle(
    @Session() session: UserRoleSession,
    @Body() body: PostArticleDto,
  ) {
    if (!body) {
      throw new BadRequestException();
    }

    return { id: await this.articles.saveArticle(session, body) };
  }

  @Delete(':id/delete')
  async deleteArticle(
    @Session() session: UserRoleSession,
    @Param('id') id: string,
  ) {
    return await this.articles.deleteArticle(session, id);
  }

  @Put(':id/update')
  async updateArticle(
    @Session() session: UserRoleSession,
    @Param('id') id: string,
    @Body() body: PostArticleDto,
  ) {
    if (!body) {
      throw new BadRequestException();
    }

    return await this.articles.updateArticle(session, id, body);
  }

  @Get(':id')
  @OptionalAuth()
  async getArticle(@Param('id') id: string) {
    return await this.articles.getArticleById(id);
  }
}
