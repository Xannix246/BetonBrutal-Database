import { Module } from '@nestjs/common';
import { WebsocketGateway } from './presentation/websocket.gateway';
import { WebsocketService } from './services/websocket.service';
import { SteamApiService } from '../data-requester/application/adapters/http-steam-api';

@Module({
  imports: [],
  providers: [WebsocketGateway, WebsocketService, SteamApiService],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}
