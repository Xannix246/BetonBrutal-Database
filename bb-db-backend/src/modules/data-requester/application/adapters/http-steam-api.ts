/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import axios from 'axios';
import { env } from 'node:process';

export class SteamApiService {
  async getUsername(steamId: string) {
    const user = (
      await axios.get(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${env.STEAM_WEB_API_KEY}&steamids=${steamId}`,
      )
    ).data.response.players[0].personaname as string;

    return user;
  }

  async getItem(steamId: string) {
    try {
      const response = await axios.get(
        `https://api.steampowered.com/IPublishedFileService/GetDetails/v1/?key=${env.STEAM_WEB_API_KEY}&publishedfileids%5B0%5D=${steamId}&includeadditionalpreviews=true&includekvtags=true&includevotes=true&includemetadata=true&appid=2330500`,
      );
      const data: SteamApiResponse = await response.data;
      const user = await this.getUsername(
        data.response.publishedfiledetails[0].creator,
      );

      return {
        steamId,
        title: data.response.publishedfiledetails[0].title,
        description: data.response.publishedfiledetails[0].file_description,
        creatorId: data.response.publishedfiledetails[0].creator,
        creatorName: user,
        votesUp: data.response.publishedfiledetails[0].vote_data.votes_up,
        votesDown: data.response.publishedfiledetails[0].vote_data.votes_down,
        createDate: new Date(
          data.response.publishedfiledetails[0].time_created * 1000,
        ),
        previewUrl: data.response.publishedfiledetails[0].preview_url,
        previews:
          data.response.publishedfiledetails[0].previews
            ?.filter((preview) => preview?.url)
            .map((preview) => preview.url) || [],
      };
    } catch {
      return null;
    }
  }

  async getTotal(): Promise<number> {
    const response = await axios.get(
      `https://api.steampowered.com/IPublishedFileService/QueryFiles/v1/?key=${env.STEAM_WEB_API_KEY}&query_type=0&creator_appid=2330500&appid=2330500&requiredtags=CustomMaps&filetype=0&totalonly=true`,
    );

    return response.data.response.total;
  }

  async getItems(
    page: number,
    itemsPerPage: number = 50,
  ): Promise<WorkshopItem[]> {
    const response = await axios.get(
      `https://api.steampowered.com/IPublishedFileService/QueryFiles/v1/?key=${env.STEAM_WEB_API_KEY}&query_type=1&page=${page}&numperpage=${itemsPerPage}&creator_appid=2330500&appid=2330500&requiredtags=CustomMaps&filetype=0&return_vote_data=true&return_tags=true&return_kv_tags=true&return_previews=true&return_metadata=true&return_details=true`,
    );
    const data = await response.data;

    const returnedItems: WorkshopItem[] = [];

    for (const map of data.response
      .publishedfiledetails as SteamPublishedFile[]) {
      returnedItems.push({
        id: map.publishedfileid,
        steamId: map.publishedfileid,
        title: map.title,
        description: map.file_description,
        creator: 'unknown',
        createDate: new Date(map.time_created * 1000),
        creatorId: map.creator,
        ratingUp: map.vote_data.votes_up,
        ratingDown: map.vote_data.votes_down,
        previewUrl: map.preview_url,
        previews:
          map.previews
            ?.filter((preview) => preview?.url)
            .map((preview) => preview.url) || [],
      });
    }
    return returnedItems;
  }
}
