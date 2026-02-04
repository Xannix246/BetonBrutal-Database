/* eslint-disable @typescript-eslint/no-misused-promises */
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as wsMessagesDto from './../dto/ws-messages.dto';
import { WebsocketService } from '../services/websocket.service';
import { LeaderboardGuard } from '../guards/leaderboard.guard';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly service: WebsocketService) {}

  private readonly logger = new Logger(WebsocketGateway.name);
  private readonly clients: Socket[] = [];
  private saveStatus = new Map<string, Promise<void>>();

  private async enqueueSave(mapId: string, task: () => Promise<void>) {
    const prev = this.saveStatus.get(mapId) ?? Promise.resolve();
    const next = prev.finally(task);
    this.saveStatus.set(mapId, next);
    await next;
    this.saveStatus.delete(mapId);
  }

  afterInit() {
    this.logger.log('WebSocket gateway initialized.');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    this.clients.push(client);

    client.emit('server_message', { type: 'welcome', text: 'Connected!' });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  sendRequest(request: wsMessagesDto.SendRequest) {
    for (const client of this.clients) {
      if (request.type === 'fetch_by_id') {
        client.emit(request.type, request.mapId);
      }
    }
  }

  @SubscribeMessage('leaderboard_update')
  @UseGuards(LeaderboardGuard)
  async getReplays(@MessageBody() data: wsMessagesDto.RecieveReplay) {
    // console.log('got replays for: ' + data.mapId);
    // console.log(data.entries);
    await this.enqueueSave(data.mapId, async () => {
      await this.service.saveReplays(data);
      console.log('data saved');
    });
  }

  @SubscribeMessage('request_leaderboard')
  async sendReplaysToClient(
    @MessageBody() body: string,
    @ConnectedSocket() client: Socket,
  ) {
    // console.log('got request for replays: ' + body);

    const existingPromise = this.saveStatus.get(body);
    if (existingPromise) {
      // console.log('waiting for save data');
      await existingPromise;
    }

    // console.log('sending replays');
    setTimeout(async () => await this.service.sendReplays(body, client), 5000);
    // console.log('done');
  }
}
