import { safeGet } from 'src/shared/axiosRequests';

export class BBLBApiService {
  private convertSteamDate = (steamDate: string): Date => {
    const EPOCH_DIFF = 116444736000000000n;
    const dateNs = BigInt(steamDate);
    const unixMs = Number((dateNs - EPOCH_DIFF) / 10000n);
    return new Date(unixMs);
  };

  private convertTimeToScore = (timeStr: string): number => {
    const parts = timeStr.split(':').map(parseFloat);
    if (parts.length !== 3) return 0;
    const [h, m, s] = parts;
    const totalSeconds = h * 3600 + m * 60 + s;
    return Math.round(totalSeconds * 100);
  };

  private parseLeaderboardData = (rawData: RawLeaderboardResponse) => {
    const maps: ParsedWorkshopItem[] = [];
    const entries: ParsedLeaderboardEntry[] = [];

    for (const [mapId, mapData] of Object.entries(rawData)) {
      const workshopItem: ParsedWorkshopItem = {
        steamId: mapId,
        title: mapData.title,
        creator: mapData.owner,
        creatorId: mapData.owner,
        createDate: this.convertSteamDate(mapData.date),
        ratingUp: parseInt(mapData.votes?.up, 10) || 0,
        ratingDown: parseInt(mapData.votes?.down, 10) || 0,
        previewUrl: mapData.img,
      };

      maps.push(workshopItem);

      for (const lb of mapData.lb) {
        const entry: ParsedLeaderboardEntry = {
          place: lb.place,
          mapId,
          steamId: lb.id,
          username: lb.name,
          score: this.convertTimeToScore(lb.score),
          date: this.convertSteamDate(lb.date),
        };

        entries.push(entry);
      }
    }

    return { maps, entries };
  };

  async getRawData(): Promise<{
    maps: ParsedWorkshopItem[];
    entries: ParsedLeaderboardEntry[];
  } | null> {
    const data = await safeGet<string>(
      'https://josiahshields.com/beton/data.json',
      5000,
      {
        responseType: 'arraybuffer',
        // proxy: {
        //   host: '127.0.0.1',
        //   port: 8000,
        // },
      },
    );

    if (!data) return null;

    const text = Buffer.from(data).toString('utf8');
    const json = JSON.parse(text) as RawLeaderboardResponse;

    return this.parseLeaderboardData(json);
  }
}
