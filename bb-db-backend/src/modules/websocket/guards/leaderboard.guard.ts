import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { RecieveReplay } from '../dto/ws-messages.dto';
import { env } from 'process';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class LeaderboardGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const data: RecieveReplay = context.switchToWs().getData();

    if (data.secret !== env.FORCE_UPDATE_SECRET) {
      client.emit('error', {
        message: 'Invalid secret',
      });

      client.disconnect(true);

      throw new WsException('Unauthorized');
    }

    return true;
  }
}
