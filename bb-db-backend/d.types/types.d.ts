/* eslint-disable prettier/prettier */
declare type SortBy = 'mostPopular' | 'newest' | 'oldest' | 'mostPlayed';

declare type WorkshopItem = {
  id: string;
  title: string;
  description: string;
  steamId: string;
  creator: string;
  creatorId: string;
  ratingUp: number;
  ratingDown: number;
  createDate: Date;
  previewUrl: string;
  previews: string[];
}

declare type WorkshopItemHeader = {
  id: string;
  title: string;
  creator: string;
  previewUrl: string;
  createDate: Date;
  ratingUp: number;
  ratingDown: number;
  previews?: string[];
}

declare type Player = {
  id: string;
  username: string;
  items: string[];
  replays: string[];
}

declare type Replay = {
  id: string;
  creator: string;
  creatorId: string;
  mapId: string;
  score: number;
  date: Date | null;
}

declare type UserComment = {
  id: string;
  mapId: string;
  userId: string;
  username: string;
  data: string;
  createdAt: Date;
}
