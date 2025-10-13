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

declare type Player = {
  id: string;
  username: string;
  items: string[];
  replays: string[];
}
