import * as Proto from 'src/generated/protos/multiplayer';

type Version = {
  packet: Proto.PacketType.VersionPacket;
  payload: Proto.Version;
};

type Event = {
  packet: Proto.PacketType.EventPacket;
  payload: Proto.Event;
};

type Join = {
  packet: Proto.PacketType.JoinPacket;
  payload: Proto.Join;
};

type PlayerList = {
  packet: Proto.PacketType.GetPlayersPacket;
  payload: Proto.PlayerList;
};

type Disconnect = {
  packet: Proto.PacketType.DisconnectPacket;
  payload: Proto.Disconnect;
};

type Nickname = {
  packet: Proto.PacketType.NicknamePacket;
  payload: Proto.Nickname;
};

type BodyColor = {
  packet: Proto.PacketType.BodyColorPacket;
  payload: Proto.BodyColor;
};

type Move = {
  packet: Proto.PacketType.MovePacket;
  payload: Proto.Move;
};

type GameMode = {
  packet: Proto.PacketType.GameModePacket;
  payload: Proto.ChangeGameMode;
};

type Map = {
  packet: Proto.PacketType.MapPacket;
  payload: Proto.Map;
};

type Message = {
  packet: Proto.PacketType.MessagePacket;
  payload: Proto.Message;
};

type Command = {
  packet: Proto.PacketType.CommandPacket;
  payload: Proto.Command;
};

type PlayersPing = {
  packet: Proto.PacketType.PlayersPingPacket;
  payload: Proto.PlayersPing;
};

type LoadMap = {
  packet: Proto.PacketType.LoadMapPacket;
  payload: Proto.LoadMap;
};

type PlaceBlocks = {
  packet: Proto.PacketType.PlaceBlocksPacket;
  payload: Proto.PlaceBlocks;
};

type PlaceBlock = {
  packet: Proto.PacketType.PlaceBlockPacket;
  payload: Proto.PlaceBlock;
};

type DeleteBlock = {
  packet: Proto.PacketType.DeleteBlockPacket;
  payload: Proto.DeleteBlock;
};

type ChangeBlock = {
  packet: Proto.PacketType.ChangeBlockPacket;
  payload: Proto.ChangeBlock;
};

type MapSettings = {
  packet: Proto.PacketType.MapSettingsPacket;
  payload: Proto.MapSettings;
};

type MapColor = {
  packet: Proto.PacketType.MapColorPacket;
  payload: Proto.MapColor;
};

type CreateGroup = {
  packet: Proto.PacketType.CreateGroupPacket;
  payload: Proto.CreateGroup;
};

type ChangeGroup = {
  packet: Proto.PacketType.ChangeGroupPacket;
  payload: Proto.ChangeGroup;
};

type DeleteGroup = {
  packet: Proto.PacketType.DeleteGroupPacket;
  payload: Proto.DeleteGroup;
};

type AddBlockToGroup = {
  packet: Proto.PacketType.AddBlockToGroupPacket;
  payload: Proto.AddBlockToGroup;
};

type RemoveBlockFromGroup = {
  packet: Proto.PacketType.RemoveBlockFromGroupPacket;
  payload: Proto.RemoveBlockFromGroup;
};

type CreateTrigger = {
  packet: Proto.PacketType.CreateTriggerPacket;
  payload: Proto.CreateTrigger;
};

type ChangeTrigger = {
  packet: Proto.PacketType.ChangeTriggerPacket;
  payload: Proto.ChangeTrigger;
};

type DeleteTrigger = {
  packet: Proto.PacketType.DeleteTriggerPacket;
  payload: Proto.DeleteTrigger;
};

type AddOperation = {
  packet: Proto.PacketType.AddOperationPacket;
  payload: Proto.AddOperation;
};

type EditOperation = {
  packet: Proto.PacketType.EditOperationPacket;
  payload: Proto.EditOperation;
};

type ReorderOperation = {
  packet: Proto.PacketType.MoveOperationOrderPacket;
  payload: Proto.ReorderOperation;
};

type RemoveOperation = {
  packet: Proto.PacketType.RemoveOperationPacket;
  payload: Proto.RemoveOperation;
};

type PlayerData = {
  packet: Proto.PacketType.PlayerDataPacket;
  payload: Proto.PlayerData;
};

type ActivateTrigger = {
  packet: Proto.PacketType.ActivateTriggerPacket;
  payload: Proto.ActivateTrigger;
};

type AckPacket = {
  packet: Proto.PacketType.AckResPacket;
  payload: Proto.AckPacket;
};

type UnknownPacket = {
  packet: Proto.PacketType.UnknownPacket;
  payload: unknown;
};

export type ProtoPacket =
  | Version
  | Event
  | Join
  | PlayerList
  | Disconnect
  | Nickname
  | BodyColor
  | Move
  | GameMode
  | Map
  | Message
  | Command
  | PlayersPing
  | LoadMap
  | PlaceBlocks
  | PlaceBlock
  | DeleteBlock
  | ChangeBlock
  | MapSettings
  | MapColor
  | CreateGroup
  | ChangeGroup
  | DeleteGroup
  | AddBlockToGroup
  | RemoveBlockFromGroup
  | CreateTrigger
  | ChangeTrigger
  | DeleteTrigger
  | AddOperation
  | EditOperation
  | ReorderOperation
  | RemoveOperation
  | PlayerData
  | ActivateTrigger
  | AckPacket
  | UnknownPacket;

export enum ProtoType {
  Version = 'version',
  Event = 'event',
  Join = 'join',
  PlayerList = 'playerList',
  Disconnect = 'disconnect',
  Nickname = 'nickname',
  BodyColor = 'bodyColor',
  Move = 'move',
  GameMode = 'gameMode',
  Map = 'map',
  Message = 'message',
  Command = 'command',
  PlayersPing = 'playersPing',
  LoadMap = 'loadMap',
  PlaceBlocks = 'placeBlocks',
  PlaceBlock = 'placeBlock',
  DeleteBlock = 'deleteBlock',
  ChangeBlock = 'changeBlock',
  MapSettings = 'mapSettings',
  MapColor = 'mapColor',
  CreateGroup = 'createGroup',
  ChangeGroup = 'changeGroup',
  DeleteGroup = 'deleteGroup',
  AddBlockToGroup = 'addBlockToGroup',
  RemoveBlockFromGroup = 'removeBlockFromGroup',
  CreateTrigger = 'createTrigger',
  ChangeTrigger = 'changeTrigger',
  DeleteTrigger = 'deleteTrigger',
  AddOperation = 'addOperation',
  EditOperation = 'editOperation',
  ReorderOperation = 'reorderOperation',
  RemoveOperation = 'removeOperation',
  PlayerData = 'playerData',
  ActivateTrigger = 'activateTrigger',
  AckPacket = 'ackPacket',
}
