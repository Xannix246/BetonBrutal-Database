import { WebSocket } from 'ws';
import {
  GameMode as ProtoGameMode,
  MapType as ProtoMapType,
  Block as ProtoBlock,
  MapSetting as ProtoMapSetting,
  // MapSettings as ProtoMapSettings,
} from 'src/generated/protos/multiplayer';

export enum PacketType {
  Version = 0,
  Event = 1,
  Join = 2,
  GetPlayers = 3,
  Disconnect = 4,
  Nickname = 5,
  BodyColor = 6,
  LightColor = 7,
  Move = 8,
  GameMode = 9,
  Map = 10,
  Message = 11,
  Command = 12,
  PlayersPing = 13,
  // PlayerJoin = 14,
  LoadMap = 15,
  // ToggleLight = 16,
  // LightColor = 17,
  PlaceBlocks = 18,
  DeleteBlocks = 19,
  PaintBlocks = 20,
  MoveBlocks = 21,
  MapSettings = 22,
  MapColor = 23,
}

export enum Event {
  Ping = 0,
  RunComplete = 1,
  RaceStart = 2,
  StartCollab = 3,
  JoinCollab = 4,
  CloseCollab = 5,
}

export enum GameMode {
  MENU = 'MENU',
  PLAY = 'PLAY',
  SCOUT = 'SCOUT',
  PRACTICE = 'PRACTICE',
  REPLAY = 'REPLAY',
  EDITOR = 'EDITOR',
  UNKNOWN = 'ERROR',
}

export enum MapType {
  MAIN = 'M',
  CUSTOM = 'C',
  EDITOR = 'E',
  HUB = 'H',
}

export enum MapSetting {
  LightScaling = 0,
  SuppressBackgroundMusic = 1,
  SuppressAmbience = 2,
  HideVoidPlatform = 3,
  DefaultBackgroundColor = 4,
  DefaultAmbientLight = 5,
}

export type Vector3 = { x: number; y: number; z: number };
export type Color = { r: number; g: number; b: number; a: number };

export type Block = {
  blockID: number;
  instanceID: string;
  color: number;
  position: Vector3;
  rotation: Vector3;
  scale: number;
  customColor: Color;
};

export type Group = {
  instanceID: string;
  name: string;
  blocks: string[];
  pivot?: ProtoBlock;
};

// blocks can be changed quickly, so maybe it's better to save in ram but idk
export type SessionCollab = {
  id: string;
  ownerId: string;
  players: string[];
  blocks: Map<string, ProtoBlock>;
  groups: Map<string, Group>;
  settings: Map<ProtoMapSetting, boolean>;
  color: Map<ProtoMapSetting, Color>;
};

// can be stored in prisma
export type SessionRace = {
  id: string;
  players: string[];
  time: Date;
  started: boolean;
  finished: boolean;
  results: {
    playerId: string;
    time: number;
  }[];
};

// can be stored in prisma
export type MapSession = {
  id: string;
  type: ProtoMapType;
  players: Set<string>; // SessionPlayer id's
  // blocks: Block[]; // instead of storing all map data with thousands of blocks we could just take map archive
  // in the ./maps folder, unpack it, decompile Map.bbmap and send blocks data from it
  settings: ProtoMapSetting[];
  // createdAt: Date; don't see the point in that
};

// can be stored in prisma
export type SessionPlayer = {
  id: string;
  name: string;
  nick: string;
  ping: {
    lastSync: Date;
    latencyMs: number;
  };
  socket: WebSocket;
  mapId?: string; // MapSession id
  raceId?: string; // SessionRace id
  collabId?: string; // SessionCollab id
  proxyMode?: boolean;
};

export type SessionPlayerData = {
  mode: ProtoGameMode;
  position: Vector3;
  rotation: Vector3;
  packetId?: string;
};

export type CommandsContext = {
  players: Map<string, SessionPlayer>;
  playerData: Map<string, SessionPlayerData>;
  mapSessions: Map<string, MapSession>;
  raceSessions: Map<string, SessionRace>;
  collabSessions: Map<string, SessionCollab>;
  mapRecords: Record<string, string>[];
};

export interface CommandDefinition {
  aliases: string[];
  args?: string[];
  description: string;
  execute?(
    player: SessionPlayer,
    args: string[],
    context: CommandsContext,
  ): string | Promise<string> | void;
}
