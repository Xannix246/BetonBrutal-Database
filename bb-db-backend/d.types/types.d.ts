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
};

declare type WorkshopItemHeader = {
  id: string;
  title: string;
  creator: string;
  previewUrl: string;
  createDate: Date;
  ratingUp: number;
  ratingDown: number;
  previews?: string[];
};

declare type Player = {
  id: string;
  username: string;
  items: string[];
  replays: string[];
};

declare type Leaderboard = {
  id: string;
  mapId: string;
  enteries: string[];
};

declare type Replay = {
  id: string;
  place: number;
  creator: string;
  creatorId: string;
  mapId: string;
  map?: string;
  replayId?: string;
  score: number;
  date: Date | null;
};

declare type User = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name: string;
  role?: string;
  image?: string | null | undefined;
};

declare type UserComment = {
  id: string;
  mapId: string;
  userId: string;
  username: string;
  data: string;
  createdAt: Date;
};

declare type Attachment = {
  name: string;
  url: string;
};

declare type Article = {
  id: string;
  title: string;
  description?: string;
  content: string;
  date: Date;
  tags: string[];
  previewUrl?: string;
  attachments: Attachment[];
  authorId: string;
  author: string;
};

declare type ArticleHeader = {
  id: string;
  title: string;
  description?: string;
  date: Date;
  tags: string[];
  author: string;
  previewUrl?: string;
};

type ArticleFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
};

declare type Collection = {
  id: string;
  title: string;
  description: string | null;
  mapsId: string[];
  showOnMain: boolean;
  descColor: $Enums.Color;
}
