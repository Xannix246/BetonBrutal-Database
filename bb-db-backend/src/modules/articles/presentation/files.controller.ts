import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';
import { type Response } from 'express';
import { AuthGuard, Roles } from 'src/modules/auth/guards/role.guard';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { GridFSService } from 'src/modules/uploads/services/gridfs.service';

@Controller('files')
export class FileController {
  constructor(
    private readonly gridFs: GridFSService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('upload')
  @Roles('admin', 'moderator', 'writer')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: ArticleFile) {
    const id = await this.gridFs.upload(file.originalname, file.buffer);

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
