import {
  PacketType,
  Event,
  GameMode,
  Vector3,
  Color,
  MapSetting,
} from './multiplayer';

export type VersionPacket = {
  packet: PacketType.Version;
  version: number;
};

export type EventPacket = {
  packet: PacketType.Event;
  signal: Event;
};

export type PlayerJoinPacket = {
  packet: PacketType.Join;
  id: string;
  name: string;
  map: string;
};

export type GetPlayersPacket = {
  packet: PacketType.GetPlayers;
  players: {
    id: string;
    nick: string;
    map: string;
  }[];
};

export type DisconnectPacket = {
  packet: PacketType.Disconnect;
  id: string;
};

export type NicknamePacket = {
  packet: PacketType.Nickname;
  id: string;
  nick: string;
};

export type BodyColorPacket = {
  packet: PacketType.BodyColor;
  id: string;
  color: number;
  customColor?: Color;
};

export type MovePacket = {
  packet: PacketType.Move;
  id?: string;
  mode: GameMode;
  position: Vector3;
  rotation: Vector3;
};

export type GameModePacket = {
  packet: PacketType.GameMode;
  id: string;
  mode: GameMode;
};

export type MapPacket = {
  packet: PacketType.Map;
  id?: string;
  map: string;
};

export type MessagePacket = {
  packet: PacketType.Message;
  id?: string;
  message: string;
};

export type CommandPacket = {
  packet: PacketType.Command;
  command?: string;
  message?: string;
};

export type PlayerPingPacket = {
  packet: PacketType.PlayersPing;
  players: {
    id: string;
    ping: number;
  }[];
};

export type LoadMapPacket = {
  packet: PacketType.LoadMap;
  map: string;
};

export type PlaceBlocksPacket = {
  packet: PacketType.PlaceBlocks;
  blocks: {
    instanceID: string;
    blockID: number;
    position: Vector3;
    rotation: Vector3;
    scale: number;
    color: number;
    customColor: Color;
  }[];
};

export type DeleteBlocksPacket = {
  packet: PacketType.DeleteBlocks;
  instanceIDs: string[];
};

export type PaintBlocksPacket = {
  packet: PacketType.PaintBlocks;
  blocks: {
    instanceID: string;
    color: number;
    customColor: Color;
  }[];
};

export type MoveBlocksPacket = {
  packet: PacketType.MoveBlocks;
  blocks: {
    instanceID: string;
    position: Vector3;
    rotation: Vector3;
    scale: number;
  }[];
};

export type MapSettingsPacket = {
  packet: PacketType.MapSettings;
  settings: MapSetting;
  state: boolean;
};

export type MapColorPacket = {
  packet: PacketType.MapColor;
  settings: MapSetting;
  color: Color;
};

export type PacketData =
  | VersionPacket
  | EventPacket
  | PlayerJoinPacket
  | GetPlayersPacket
  | DisconnectPacket
  | NicknamePacket
  | BodyColorPacket
  | MovePacket
  | GameModePacket
  | MapPacket
  | MessagePacket
  | CommandPacket
  | PlayerPingPacket
  | LoadMapPacket
  | PlaceBlocksPacket
  | DeleteBlocksPacket
  | PaintBlocksPacket
  | MoveBlocksPacket
  | MapSettingsPacket
  | MapColorPacket;

export type PacketSerializerPayload = PacketData;
export type PacketDeserializerResult = PacketData;
