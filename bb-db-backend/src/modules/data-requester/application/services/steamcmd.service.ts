import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import archiver from 'archiver';
import { existsSync } from 'fs';
import { createWriteStream, rmSync } from 'node:fs';
import Path from 'node:path';
import { env } from 'node:process';
import { multerConfig } from 'src/modules/uploads/config/multer.config';
import os from 'node:os';
import * as pty from 'node-pty';

@Injectable()
export class SteamCmdService implements OnModuleInit {
  private readonly logger = new Logger(SteamCmdService.name);
  private readonly path = env.STEAMCMD_ROOT_PATH;
  private readonly login = env.STEAM_LOGIN;
  private readonly password = env.STEAM_PASSWORD;
  private readonly appId = 2330500;

  private ptyProcess!: pty.IPty;

  private queue: {
    id: string;
    resolve: () => void;
    reject: (e: Error) => void;
  }[] = [];

  private current: {
    id: string;
    resolve: () => void;
    reject: (e: Error) => void;
  } | null = null;

  onModuleInit() {
    this.startSteamCmd();
  }

  private startSteamCmd() {
    if (!this.login || !this.password || !this.path) {
      throw new Error(`Login, password or directory not provided`);
    }

    const shell = os.platform() === 'win32' ? 'steamcmd.exe' : 'steamcmd.sh';

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
    ];

    this.ptyProcess = pty.spawn(Path.join(this.path, shell), args, {
      name: 'xterm-color',
      cwd: this.path,
      env: process.env as Record<string, string>,
    });

    this.ptyProcess.onData((data) => this.handleOutput(data));
  }

  private handleOutput(data: string) {
    // this.logger.debug(data);

    if (!this.current) return;

    if (data.includes(`Success. Downloaded item ${this.current.id}`)) {
      this.logger.log(`Downloaded ${this.current.id}`);
      this.current.resolve();
      this.current = null;
      this.processNext();
    }

    if (data.includes(`ERROR! Download item ${this.current?.id} failed`)) {
      this.current?.reject(new Error(`Failed to download ${this.current?.id}`));
      this.current = null;
      this.processNext();
    }
  }

  private send(command: string) {
    // this.logger.log(`> ${command.trim()}`);
    this.ptyProcess.write(command.trim() + '\n');
  }

  enqueue(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.queue.push({ id, resolve, reject });
      this.processNext();
    });
  }

  private processNext() {
    if (this.current) return;
    if (this.queue.length === 0) return;

    this.current = this.queue.shift()!;
    this.send(`workshop_download_item ${this.appId} ${this.current.id}`);
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
