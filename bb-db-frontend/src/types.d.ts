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