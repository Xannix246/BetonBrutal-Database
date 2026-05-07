import { Injectable, Logger } from '@nestjs/common';
import { UserService } from 'src/modules/users/application/users.service';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class DiscordSyncListener {
  private readonly logger = new Logger(DiscordSyncListener.name);

  constructor(private readonly userService: UserService) {}

  @OnEvent('discord.sync')
  async handleSync(payload: { userId: string; accountId: string }) {
    try {
      await this.userService.syncUserData(payload.userId);
    } catch (e) {
      this.logger.warn('Discord sync failed', e);
    }
  }
}
