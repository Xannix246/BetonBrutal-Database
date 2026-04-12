import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Res,
  UseGuards,
  Session,
  Query,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OptionalAuth, type UserSession } from '@thallesp/nestjs-better-auth';
import { type Response } from 'express';
import { env } from 'node:process';
import { AuthGuard, Roles } from 'src/modules/auth/guards/role.guard';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ImageFilePipe } from 'src/modules/uploads/pipes/filetype.pipe';
import { GridFSService } from 'src/modules/uploads/services/gridfs.service';
import { UserService } from 'src/modules/users/application/users.service';

@Controller('files')
export class FileController {
  constructor(
    private readonly gridFs: GridFSService,
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  @Post('upload')
  @Roles('admin', 'moderator', 'writer')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile(ImageFilePipe) file: Express.Multer.File) {
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

  @Post('upload-user-images')
  @UseInterceptors(FileInterceptor('file'))
  async uploadUserFile(
    @UploadedFile(
      new ImageFilePipe(),
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
    @Session() session: UserSession,
    @Query('type') type: 'pfp' | 'bg',
  ) {
    const id = await this.gridFs.uploadUserFile(
      session.user.id,
      file.buffer,
      type,
    );
    const url = `${env.BETTER_AUTH_URL}/api/files/${id.toString()}`;

    const publicData = await this.userService.setPublicData(
      {
        id: '',
        userId: session.user.id,
        ...(type === 'pfp' && { profilePicUrl: url }),
        ...(type === 'bg' && { backgroundUrl: url }),
      },
      session,
    );

    return type === 'pfp' ? publicData.profilePicUrl : publicData.backgroundUrl;
  }

  @Get(':id')
  @OptionalAuth()
  getFile(@Param('id') id: string, @Res() res: Response) {
    const stream = this.gridFs.getFileStream(id);
    stream.on('error', () => res.status(404).send('File not found'));
    stream.pipe(res);
  }
}
