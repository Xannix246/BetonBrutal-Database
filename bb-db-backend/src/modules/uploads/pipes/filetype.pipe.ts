import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';

@Injectable()
export class ImageFilePipe implements PipeTransform {
  async transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const type = await fileTypeFromBuffer(file.buffer);

    if (!type) {
      throw new BadRequestException('Cannot determine file type');
    }

    const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedMime.includes(type.mime)) {
      throw new BadRequestException('Invalid file type');
    }

    const compressedBuffer = await sharp(file.buffer)
      .jpeg({ quality: 80 })
      .toBuffer();

    file.buffer = compressedBuffer;
    file.mimetype = 'image/jpeg';
    file.size = file.buffer.toString().length;

    return file;
  }
}
