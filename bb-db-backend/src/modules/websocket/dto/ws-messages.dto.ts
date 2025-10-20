export type SendRequest =
  | { type: 'ping' }
  | { type: 'fetch_by_id'; mapId: string }
  | { type: string; [k: string]: any };

export type RecieveReplay = {
  mapId: string;
  entries: {
    userName: string;
    place: number;
    userId: string;
    mapId: string;
    score: number;
    replayId?: string;
    date: Date;
  }[];
};
