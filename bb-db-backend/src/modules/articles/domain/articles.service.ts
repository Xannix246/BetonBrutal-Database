/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { PostArticleDto } from '../presentation/dto/articles.dto';
import { UserRoleSession } from 'src/modules/auth/auth.module';
import { GridFSService } from 'src/modules/uploads/domain/gridfs.service';

@Injectable()
export class ArticlesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gridFs: GridFSService,
  ) {}

  async getArticles(
    sortBy: SortBy, // but used only newest and oldest for now
    quantity: number,
    timeRange?: 'day' | 'week' | 'month' | 'year',
    page: number = 1,
    tags?: string[],
    strictComparison?: boolean, // for tags
    searchText?: string,
  ): Promise<ArticleHeader[]> {
    let orderBy;

    switch (sortBy) {
      case 'newest':
        orderBy = { date: 'desc' };
        break;
      case 'oldest':
        orderBy = { date: 'asc' };
        break;
      default:
        orderBy = { date: 'desc' };
    }

    let dateFilter: Date | undefined;
    const now = new Date();

    if (timeRange) {
      switch (timeRange) {
        case 'day':
          dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          dateFilter = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          dateFilter = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }
    }

    const where: {
      date?: {
        gte: Date;
      };
      tags?: {
        hasEvery?: string[];
        hasSome?: string[];
      };
      title?: {
        contains: string;
        mode: 'insensitive';
      };
    } = {};

    if (dateFilter) {
      where.date = { gte: dateFilter };
    }

    if (tags?.length) {
      where.tags = strictComparison ? { hasEvery: tags } : { hasSome: tags };
    }

    if (searchText && searchText?.length > 0) {
      where.title = {
        contains: searchText,
        mode: 'insensitive',
      };
    }

    const articles = await this.prisma.article.findMany({
      take: quantity,
      skip: (page - 1) * quantity,
      orderBy,
      where,
    });

    const returnArticles: ArticleHeader[] = [];

    for (const article of articles) {
      returnArticles.push({
        id: article.id,
        title: article.title,
        description: article.description
          ? article.description
          : article.content.slice(0, 255),
        date: article.date,
        tags: article.tags,
        author: (
          await this.prisma.user.findUniqueOrThrow({
            where: { id: article.authorId },
          })
        ).name,
        previewUrl: article.preview ? article.preview : undefined,
      });
    }

    return returnArticles;
  }

  async getArticleById(id: string): Promise<Article> {
    const article = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!article) throw new NotFoundException();

    return {
      id: article.id,
      title: article.title,
      description: article.description ? article.description : undefined,
      content: article.content,
      date: article.date,
      tags: article.tags,
      previewUrl: article.preview ? article.preview : undefined,
      attachments: article.attachments,
      authorId: article.authorId,
      author: (
        await this.prisma.user.findUniqueOrThrow({
          where: { id: article.authorId },
        })
      ).name,
    };
  }

  async saveArticle(
    session: UserRoleSession,
    data: PostArticleDto,
  ): Promise<string> {
    if (
      !['writer', 'moderator', 'admin'].includes(session.user.role as string)
    ) {
      throw new ForbiddenException();
    }

    console.log(data);

    return (
      await this.prisma.article.create({
        data: {
          authorId: session.user.id,
          title: data.title,
          description: data.description,
          content: data.content,
          date: new Date(),
          tags: data.tags,
          preview: data.preview,
          attachments: data.attachments,
        },
      })
    ).id;
  }

  async updateArticle(
    session: UserRoleSession,
    id: string,
    data: PostArticleDto,
  ): Promise<string> {
    if (
      !['writer', 'moderator', 'admin'].includes(session.user.role as string)
    ) {
      throw new ForbiddenException();
    }

    const article = await this.prisma.article.findUnique({ where: { id } });

    if (!article) throw new NotFoundException();
    if (article.authorId !== session.user.id) throw new ForbiddenException();

    return (
      await this.prisma.article.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          content: data.content,
          date: new Date(),
          tags: data.tags,
          attachments: data.attachments,
        },
      })
    ).id;
  }

  async deleteArticle(session: UserRoleSession, id: string): Promise<void> {
    if (
      !['writer', 'moderator', 'admin'].includes(session.user.role as string)
    ) {
      throw new ForbiddenException();
    }

    const article = await this.prisma.article.findUnique({ where: { id } });

    if (!article) throw new NotFoundException();

    if (
      article.authorId !== session.user.id ||
      !['moderator', 'admin'].includes(session.user.role as string)
    ) {
      throw new ForbiddenException();
    }

    void this.prisma.article.delete({ where: { id } });

    if (article.preview) {
      const id = article.preview.split('/').at(-1);
      if (id) void this.gridFs.delete(id);
    }

    for (const attachment of article.attachments) {
      const id = attachment.url.split('/').at(-1);
      if (id) void this.gridFs.delete(id);
    }
  }
}
