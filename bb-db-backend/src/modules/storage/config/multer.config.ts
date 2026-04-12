import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';

export const multerConfig = {
  dest: './maps',
  filesize: 20000000,
};

export const multerOptions: MulterOptions = {
  limits: {
    fileSize: multerConfig.filesize,
  },

  fileFilter: (_req, file, callback) => {
    if (file.originalname.match(/\.(zip)$/i)) {
      callback(null, true);
    } else {
      callback(new BadRequestException('Unsupported file type'), false);
    }
  },

  storage: diskStorage({
    destination(_req, _file, callback) {
      const uploadPath = multerConfig.dest;

      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath);
      }

      callback(null, uploadPath);
    },

    filename(_req, file, callback) {
      callback(null, `${Date.now()}-${file.originalname}`);
    },
  }),
};
