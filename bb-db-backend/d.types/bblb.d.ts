/* eslint-disable prettier/prettier */
// for compability with Beton Brutal Leaderboards

declare type RawLeaderboardEntry = {
  place: number;
  id: string;
  name: string;
  score: string;
  date: string;
}

declare type RawVotes = {
  up: string;
  down: string;
}

declare type RawWorkshopItem = {
  title: string;
  owner: string;
  date: string;
  desc: string;
  img: string;
  votes: RawVotes;
  lb: RawLeaderboardEntry[];
  time: number;
}

declare type RawLeaderboardResponse = Record<string, RawWorkshopItem>;

declare type ParsedWorkshopItem = {
  steamId: string;
  title: string;
  creator: string;
  creatorId: string;
  createDate: Date;
  ratingUp: number;
  ratingDown: number;
  previewUrl: string;
}

declare type ParsedLeaderboardEntry = {
  place: number;
  mapId: string;
  steamId: string;
  username: string;
  score: number;
  date: Date;
}
