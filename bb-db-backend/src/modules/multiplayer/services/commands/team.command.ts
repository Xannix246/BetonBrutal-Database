import { Injectable, OnModuleInit } from '@nestjs/common';
import { CommandsService } from '../commands.service';
import {
  C,
  CommandsContext,
  Ref,
  SessionPlayer,
  SessionTeam,
} from '../../types/multiplayer';
import { PacketType } from 'src/generated/protos/multiplayer';

@Injectable()
export class TeamCommand implements OnModuleInit {
  constructor(private readonly commandsService: CommandsService) {}

  onModuleInit() {
    this.commandsService.register({
      aliases: ['/team'],
      args: ['[create|join] (name)', '[leave|close]', '[synctriggers]'],
      description: 'create, join or manage team',
      execute: (...args) => this.teamCommand(...args),
    });
  }

  teamCommand(
    player: SessionPlayer,
    args: string[],
    context: CommandsContext,
  ): string {
    switch (args[0]) {
      case 'create':
        if (!args[1]) return `<color=${C.yellow}>Type name</color>`;
        return this.createTeam(player, context, args[1]);
      case 'join':
        if (!args[1]) return `<color=${C.yellow}>Type name</color>`;
        return this.joinTeam(player, context, args[1]);
      case 'leave':
        return this.leaveTeam(player, context);
      case 'close':
        return this.closeTeam(player, context);
      case 'synctriggers':
        return this.changeTriggersSyncState(player);
      default:
        return `<color=${C.yellow}>Unknown argument. Use create, join, leave, close, or synctriggers</color>`;
    }
  }

  private createTeam(
    player: SessionPlayer,
    context: CommandsContext,
    name: string,
  ) {
    const isNameReserved = context.teamSessions.get(name);

    if (player.team.value)
      return `<color=${C.red}>You're already in the team</color>`;

    if (isNameReserved)
      return `<color=${C.red}>A team with this name already exists</color>`;

    const team = new SessionTeam({
      id: name,
      owner: player,
      players: new Set([player]),
      activeTriggers: new Map(),
      map: new Ref(player.map.value!),
    });

    context.teamSessions.set(name, team);
    player.team.set(team);

    return `<color=${C.green}>Team has been created</color>`;
  }

  private joinTeam(
    player: SessionPlayer,
    context: CommandsContext,
    name: string,
  ) {
    const team = context.teamSessions.get(name);

    if (!team) return `<color=${C.red}>Team not found</color>`;

    team.players.add(player);

    this.commandsService.sendPacket(player, {
      packet: PacketType.LoadMapPacket,
      payload: {
        id: player.id,
        mapId: team.map.value.id,
      },
    });

    this.commandsService.broadcastMessage(
      `${player.nick.value} <color=${C.green}>joined</color> the team`,
      team.getIds(),
      [player.id],
    );

    return `You joined the team`;
  }

  private leaveTeam(player: SessionPlayer, context: CommandsContext) {
    if (!player.team.value)
      return `<color=${C.red}>You're not in the team</color>`;

    const team = player.team.value;

    if (team.owner.id === player.id) {
      return this.closeTeam(player, context);
    } else {
      team.players.delete(player);
      this.commandsService.broadcastMessage(
        `${player.nick.value} <color=${C.red}>left</color> the team`,
        team.getIds(),
        [player.id],
      );
    }

    return `You left the team`;
  }

  private closeTeam(player: SessionPlayer, context: CommandsContext) {
    if (!player.team.value)
      return `<color=${C.red}>You're not in the team</color>`;

    const team = player.team.value;

    if (team.owner.id !== player.id)
      return `<color=${C.red}>You're not the team owner</color>`;

    this.commandsService.broadcastMessage(
      `<color=${C.red}>The team has been closed`,
      team.getIds(),
      [player.id],
    );

    for (const player of team.players) {
      player.team.set(undefined);
    }

    context.teamSessions.delete(team.id);
    return `You closed the team`;
  }

  private changeTriggersSyncState(player: SessionPlayer) {
    if (!player.team.value)
      return `<color=${C.red}>You're not in the team</color>`;

    const team = player.team.value;

    if (team.owner.id !== player.id)
      return `<color=${C.red}>You're not the team owner</color>`;

    if (!team.triggersSyncEnabled.value) {
      team.triggersSyncEnabled.set(true);
      return `<color=${C.green}>Trigger sync was enabled</color>`;
    } else {
      team.triggersSyncEnabled.set(false);
      return `<color=${C.red}>Trigger sync was disabled</color>`;
    }
  }
}
