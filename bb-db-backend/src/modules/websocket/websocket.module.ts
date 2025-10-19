import { Module } from '@nestjs/common';
import { WebsocketGateway } from './presentation/websocket.gateway';
import { WebsocketService } from './services/websocket.service';

@Module({
  imports: [],
  providers: [WebsocketGateway, WebsocketService],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}
