import { Injectable, Logger } from '@nestjs/common';
import archiver from 'archiver';
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { createWriteStream } from 'node:fs';
import Path from 'node:path';
import { multerConfig } from 'src/modules/uploads/config/multer.config';

@Injectable()
export class SteamCmdService {
  private readonly logger = new Logger(SteamCmdService.name);
  private readonly path = process.env.STEAMCMD_ROOT_PATH;
  private readonly login = process.env.STEAM_LOGIN;
  private readonly password = process.env.STEAM_PASSWORD;
  private readonly appId = 2330500;

  async downloadWorkshopItem(id: string): Promise<void> {
    if (!this.login || !this.password) {
      return Logger.error(`Login or password not provided`);
    }

    return new Promise((resolve, reject) => {
      const args = [
        '+force_install_dir ./maps',
        `+login ${this.login} ${this.password}`,
        `+workshop_download_item ${this.appId} ${id} validate`,
        `+quit`,
      ];

      const cmdProcess = spawn('steamcmd', args);

      cmdProcess.stdout.on('data', (data: unknown) => {
        this.logger.log(data?.toString());
      });

      cmdProcess.stderr.on('data', (data: unknown) => {
        this.logger.error(data?.toString());
      });

      cmdProcess.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`SteamCMD exited with ${code}`));
      });
    });
  }

  async copyFileToStorage(id: string): Promise<void> {
    if (!this.path) {
      return Logger.error(`Path not provided`);
    }

    const mapPath = Path.join(
      this.path,
      'maps/steamapps/workshop/content',
      this.appId.toString(),
      id,
    );

    if (!existsSync(mapPath)) {
      return Logger.error(`Path not found`);
    }

    const output = createWriteStream(multerConfig.dest + `/${id}.zip`);
    const archive = archiver('zip', { zlib: { level: 9 } });

    const cloned = new Promise((resolve, reject) => {
      output.on('close', () => resolve(true));
      archive.on('error', reject);

      archive.pipe(output);
      archive.directory(mapPath, false);
    });

    return await cloned.then(async () => await archive.finalize());
  }
}
