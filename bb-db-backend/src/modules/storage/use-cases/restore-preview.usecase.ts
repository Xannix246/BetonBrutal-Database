import { PrismaService } from 'src/modules/prisma/prisma.service';
import { MulterInternalService } from '../services/internal-multer.service';
import { GridFSService } from '../services/gridfs.service';
import { Injectable } from '@nestjs/common';
import path from 'path';
import { readFile } from 'fs/promises';
import { env } from 'node:process';

@Injectable()
export class RestorePreviewUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly multer: MulterInternalService,
    private readonly gridfs: GridFSService,
  ) {}

  async execute(steamId: string): Promise<void> {
    const map = await this.prisma.workshopItem.findUnique({
      where: { steamId },
    });

    if (
      !map ||
      map.previewUrl === '' ||
      !new URL(map.previewUrl).hostname.includes('steam')
    ) {
      return;
    }

    const extract = await this.multer.getFileLocalTemp(steamId);
    let preview: Buffer | null = null;

    if (!extract) {
      this.multer.clearTemp(steamId);
      return;
    }

    try {
      preview = await readFile(path.join('./temp', steamId, 'Thumbnail.png'));
    } catch {
      this.multer.clearTemp(steamId);
      return;
    }

    const previewUrl = preview
      ? `${env.BETTER_AUTH_URL}/api/files/${(await this.gridfs.upload('Thumbnail.png', preview)).toString()}`
      : '';

    await this.prisma.workshopItem.update({
      where: { steamId },
      data: {
        previewUrl,
      },
    });

    this.multer.clearTemp(steamId);
  }
}
