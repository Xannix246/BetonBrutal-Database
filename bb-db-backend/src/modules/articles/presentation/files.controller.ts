import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Res,
  ForbiddenException,
  Session,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';
import { type Response } from 'express';
import { type UserRoleSession } from 'src/modules/auth/auth.module';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { GridFSService } from 'src/modules/uploads/domain/gridfs.service';

@Controller('files')
export class FileController {
  constructor(
    private readonly gridFs: GridFSService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: ArticleFile,
    @Session() session: UserRoleSession,
  ) {
    if (
      !['writer', 'moderator', 'admin'].includes(session.user.role as string)
    ) {
      throw new ForbiddenException();
    }

    const id = await this.gridFs.upload(
      file.originalname,
      file.buffer,
      file.mimetype,
    );

    const attachment = await this.prisma.attachment.create({
      data: {
        name: file.originalname,
        fileId: id.toString(),
        mimeType: file.mimetype,
      },
    });

    return { url: `/api/files/${id.toString()}`, attachment };
  }

  @Get(':id')
  @OptionalAuth()
  getFile(@Param('id') id: string, @Res() res: Response) {
    const stream = this.gridFs.getFileStream(id);
    stream.on('error', () => res.status(404).send('File not found'));
    stream.pipe(res);
  }
}
