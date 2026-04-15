import { Injectable } from '@nestjs/common';
import path from 'path';
import { multerConfig } from '../config/multer.config';
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
} from 'fs';
import { mkdir } from 'fs/promises';
import { Entry, open } from 'yauzl';

@Injectable()
export class MulterInternalService {
  async getFileLocalTemp(id: string): Promise<boolean> {
    if (!id) return false;

    if (!existsSync('./temp')) {
      await mkdir('./temp');
    }

    const files = readdirSync(multerConfig.dest);
    const file = files.find((file) => file.startsWith(id));

    if (!file) return false;

    open(
      path.join(multerConfig.dest, file),
      { lazyEntries: true },
      (_err, zip) => {
        zip.readEntry();
        zip.on('entry', (entry: Entry) => {
          const filePath = path.join('./temp', id, entry.fileName);

          if (/\/$/.test(entry.fileName)) {
            mkdirSync(filePath, { recursive: true });
            zip.readEntry();
            return;
          }

          mkdirSync(path.dirname(filePath), { recursive: true });

          zip.openReadStream(entry, (_err, readStream) => {
            const writeStream = createWriteStream(filePath);

            readStream.pipe(writeStream);

            writeStream.on('finish', () => {
              zip.readEntry();
            });
          });
        });
      },
    );

    return true;
  }

  clearTemp(id?: string): void {
    const base = './temp';

    if (id) {
      const dir = path.join(base, id);
      if (existsSync(dir)) {
        rmSync(dir, { recursive: true, force: true });
      }
      return;
    }

    if (existsSync(base)) {
      rmSync(base, { recursive: true, force: true });
    }
  }
}
