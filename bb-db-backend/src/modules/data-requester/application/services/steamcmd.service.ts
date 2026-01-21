import { Injectable, Logger } from '@nestjs/common';
import archiver from 'archiver';
import { existsSync } from 'fs';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createWriteStream, rmSync } from 'node:fs';
import Path from 'node:path';
import { env } from 'node:process';
import { multerConfig } from 'src/modules/uploads/config/multer.config';

@Injectable()
export class SteamCmdService {
  private readonly logger = new Logger(SteamCmdService.name);
  private readonly path = env.STEAMCMD_ROOT_PATH;
  private readonly login = env.STEAM_LOGIN;
  private readonly password = env.STEAM_PASSWORD;
  private readonly appId = 2330500;

  async downloadWorkshopItem(id: string): Promise<void> {
    if (!this.login || !this.password || !this.path) {
      return this.logger.error(`Login, password or directory not provided`);
    }

    const args = [
      '+@ShutdownOnFailedCommand',
      '1',
      '+@NoPromptForPassword',
      '1',
      '+force_install_dir',
      Path.join(this.path, 'maps'),
      '+login',
      this.login,
      this.password,
      '+workshop_download_item',
      String(this.appId),
      id,
      '+quit',
    ];

    const steamCMD = spawn('steamcmd', args);

    steamCMD.stderr.on('data', (data) => {
      this.logger.error(`stderr: ${data}`);
    });

    const code = await once(steamCMD, 'close');
    this.logger.log(`child process exited with code ${code[0]}`);
  }

  async copyFileToStorage(id: string): Promise<string | void> {
    if (!this.path) {
      return this.logger.error(`Path not provided`);
    }

    const mapPath = Path.join(
      this.path,
      'maps/steamapps/workshop/content',
      this.appId.toString(),
      id,
    );

    if (!existsSync(mapPath)) {
      return this.logger.error(`Path not found`);
    }

    const output = createWriteStream(multerConfig.dest + `/${id}.zip`);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      this.logger.log(`${archive.pointer()} total bytes`);
      this.logger.log(
        'Archiver has been finalized and the output file descriptor has closed. Clearing downloaded data...',
      );

      rmSync(mapPath, { recursive: true });
      this.logger.log('Deleted downloaded data');
    });

    archive.on('error', (error) => {
      return this.logger.error(error);
    });

    archive.pipe(output);
    archive.directory(mapPath, false);
    await archive.finalize();

    return `${id}.zip`;
  }
}
