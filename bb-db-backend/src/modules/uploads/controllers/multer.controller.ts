import {
  UseInterceptors,
  UploadedFile,
  Controller,
  Post,
  Get,
  Query,
  Delete,
  UseGuards,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../config/multer.config';
import { MulterService } from '../services/multer.service';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';
import { AuthGuard, Roles } from 'src/modules/auth/guards/role.guard';
import { type Response } from 'express';

@Controller('db')
export class MapSaveController {
  constructor(private readonly multerService: MulterService) {}

  @Post('upload')
  @Roles('admin', 'moderator')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadMapFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('id') id: string,
  ) {
    return this.multerService.saveFile(file, id);
  }

  @Get('download')
  @OptionalAuth()
  async downloadMapFile(@Query('id') id: string, @Res() res: Response) {
    return this.multerService.getFile(id, res);
  }

  @Delete('delete')
  @Roles('admin', 'moderator')
  @UseGuards(AuthGuard)
  async deleteMapFile(@Query('id') id: string) {
    await this.multerService.deleteFile(id);
  }
}
