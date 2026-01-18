import { env } from 'node:process';
import { safeGet } from 'src/shared/axiosRequests';

export class SteamApiService {
  async getUsername(steamId: string) {
    const user = await safeGet<AxiosUsernameType>(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${env.STEAM_WEB_API_KEY}&steamids=${steamId}`,
      5000,
    );

    return user?.response.players[0]?.personaname ?? 'Unknown user';
  }

  async getItem(steamId: string) {
    const data = (
      await safeGet<SteamApiResponse>(
        `https://api.steampowered.com/IPublishedFileService/GetDetails/v1/?key=${env.STEAM_WEB_API_KEY}&publishedfileids%5B0%5D=${steamId}&includeadditionalpreviews=true&includekvtags=true&includevotes=true&includemetadata=true&appid=2330500`,
        5000,
      )
    )?.response;

    if (!data || !data.publishedfiledetails[0].vote_data) return null;

    const user = await this.getUsername(data.publishedfiledetails[0].creator);

    return {
      steamId,
      title: data.publishedfiledetails[0].title,
      description: data.publishedfiledetails[0].file_description,
      creatorId: data.publishedfiledetails[0].creator,
      creatorName: user,
      votesUp: data.publishedfiledetails[0].vote_data.votes_up,
      votesDown: data.publishedfiledetails[0].vote_data.votes_down,
      createDate: new Date(data.publishedfiledetails[0].time_created * 1000),
      previewUrl: data.publishedfiledetails[0].preview_url,
      previews:
        data.publishedfiledetails[0].previews
          ?.filter((preview) => preview?.url)
          .map((preview) => preview.url) || [],
    };
  }

  async getTotal(): Promise<number> {
    const response = await safeGet<SteamApiResponse>(
      `https://api.steampowered.com/IPublishedFileService/QueryFiles/v1/?key=${env.STEAM_WEB_API_KEY}&query_type=0&creator_appid=2330500&appid=2330500&requiredtags=CustomMaps&filetype=0&totalonly=true`,
      5000,
    );

    return response?.response.total ?? 0;
  }

  async getQueryItems(ids: string[]): Promise<WorkshopItem[]> {
    if (ids.length === 0) return [];

    const params = new URLSearchParams();
    ids.forEach((id, index) => params.append(`publishedfileids[${index}]`, id));

    const response = (
      await safeGet<SteamApiResponse>(
        `https://api.steampowered.com/IPublishedFileService/GetDetails/v1/?key=${process.env.STEAM_WEB_API_KEY}&creator_appid=2330500&appid=2330500&requiredtags=CustomMaps&filetype=0&return_vote_data=true&return_tags=true&return_kv_tags=true&return_previews=true&return_metadata=true&return_details=true&${params.toString()}`,
        8000,
      )
    )?.response;

    if (!response) return [];

    const returnedItems: WorkshopItem[] = [];

    for (const map of response.publishedfiledetails) {
      returnedItems.push({
        id: map.publishedfileid,
        steamId: map.publishedfileid,
        title: map.title,
        description: map.file_description || '',
        creator: 'unknown',
        createDate: new Date(map.time_created * 1000),
        creatorId: map.creator,
        ratingUp: map.vote_data?.votes_up || 0,
        ratingDown: map.vote_data?.votes_down || 0,
        previewUrl: map.preview_url || '',
        previews:
          map.previews
            ?.filter((preview) => preview?.url)
            .map((preview) => preview.url) || [],
        filename: null,
      });
    }

    return returnedItems;
  }

  async getItems(
    page: number,
    itemsPerPage: number = 50,
  ): Promise<WorkshopItem[]> {
    const response = (
      await safeGet<SteamApiResponse>(
        `https://api.steampowered.com/IPublishedFileService/QueryFiles/v1/?key=${env.STEAM_WEB_API_KEY}&query_type=1&page=${page}&numperpage=${itemsPerPage}&creator_appid=2330500&appid=2330500&requiredtags=CustomMaps&filetype=0&return_vote_data=true&return_tags=true&return_kv_tags=true&return_previews=true&return_metadata=true&return_details=true`,
        8000,
      )
    )?.response;

    if (!response) return [];

    const returnedItems: WorkshopItem[] = [];

    for (const map of response.publishedfiledetails) {
      returnedItems.push({
        id: map.publishedfileid,
        steamId: map.publishedfileid,
        title: map.title,
        description: map.file_description,
        creator: 'unknown',
        createDate: new Date(map.time_created * 1000),
        creatorId: map.creator,
        ratingUp: map.vote_data?.votes_up ?? 0,
        ratingDown: map.vote_data?.votes_down ?? 0,
        previewUrl: map.preview_url,
        previews:
          map.previews
            ?.filter((preview) => preview?.url)
            .map((preview) => preview.url) || [],
        filename: null,
      });
    }
    return returnedItems;
  }
}
