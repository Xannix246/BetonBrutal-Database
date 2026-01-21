import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { extname, join } from 'path';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { multerConfig } from '../config/multer.config';
import { existsSync, readdirSync, renameSync, unlinkSync } from 'fs';
import { Response } from 'express';

@Injectable()
export class MulterService {
  constructor(private readonly prisma: PrismaService) {}

  async saveFile(file: Express.Multer.File, id: string) {
    if (!id) {
      unlinkSync(join(file.path));
      throw new BadRequestException('ID is required');
    }

    const map = await this.prisma.workshopItem.findUnique({
      where: { steamId: id },
    });

    if (!map) {
      unlinkSync(join(file.path));
      throw new NotFoundException('Map not found');
    }

    const ext = extname(file.originalname);
    const targetPath = join(multerConfig.dest, `${id}${ext}`);

    if (existsSync(targetPath)) {
      unlinkSync(targetPath);
    }

    renameSync(file.path, targetPath);

    await this.prisma.workshopItem.update({
      where: { steamId: id },
      data: {
        filename: `${id}${ext}`,
      },
    });

    return {
      ok: true,
      filename: `${id}${ext}`,
    };
  }

  async getFile(id: string, res: Response) {
    if (!id) {
      throw new BadRequestException('ID is required');
    }

    const map = await this.prisma.workshopItem.findUnique({
      where: { steamId: id },
    });

    if (!map) {
      throw new NotFoundException('Map not found');
    }

    const files = readdirSync(multerConfig.dest);
    const file = files.find((file) => file.startsWith(id + '.'));

    if (!file) {
      throw new NotFoundException('File not found');
    }

    const ext = extname(file);
    const downloadName = `${map.title}${ext}`;
    const fullPath = join(multerConfig.dest, file);

    res.download(fullPath, downloadName);
  }

  async deleteFile(id: string) {
    const files = readdirSync(multerConfig.dest);
    const file = files.find((file) => file.startsWith(id + '.'));

    if (!file) {
      throw new NotFoundException('Archive not found');
    }

    unlinkSync(join(multerConfig.dest, file));

    await this.prisma.workshopItem.update({
      where: { steamId: id },
      data: {
        filename: null,
      },
    });

    return { ok: true };
  }
}
