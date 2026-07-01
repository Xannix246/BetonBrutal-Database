import { Injectable } from '@nestjs/common';
import { MultiplayerService } from '../../services/multiplayer.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProtobufManager } from '../../services/protobuf-manager.service';
import { Events, PacketType } from 'src/generated/protos/multiplayer';

@Injectable()
export class CheckPingScheduler {
  constructor(
    private readonly multiplayer: MultiplayerService,
    private readonly packetManager: ProtobufManager,
  ) {}

  @Cron(CronExpression.EVERY_SECOND)
  handleCron() {
    for (const player of this.multiplayer.players.values()) {
      player.ping.lastSync = new Date();
      player.socket.send(
        this.packetManager.serialize({
          packet: PacketType.EventPacket,
          payload: { type: Events.Ping },
        }),
      );
      this.multiplayer.players.set(player.id, player);
    }

    this.multiplayer.broadcastPacket({
      packet: PacketType.PlayersPingPacket,
      payload: {
        players: [...this.multiplayer.players.values()].map((player) => ({
          id: player.id,
          ping: player.ping.latencyMs,
        })),
      },
    });
  }
}
