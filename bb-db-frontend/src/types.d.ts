declare type SortBy = "mostPopular" | "newest" | "oldest" | "mostPlayed";

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

declare type Player = {
  id: string;
  username: string;
  items: string[];
  replays: string[];
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
}
