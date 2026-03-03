import { config } from "../../../config/config";
import { api } from "../../features/Auth";

export const getMaps = async (
  searchQuery: string,
): Promise<WorkshopItem[]> => {
  return (
    await api.get(
      `${config.serverUri}/workshop/search?q=${encodeURIComponent(
        searchQuery,
      )}`,
    )
  ).data;
};

export const getReplays = async (id: string): Promise<Replay[]> => {
  return (await api.get(`${config.serverUri}/workshop/${id}/replays?hideBanned=false`)).data;
};

export const getReplayById = async (id: string): Promise<Replay> => {
  return (await api.post(`${config.serverUri}/workshop/get-query-replays`, {
    ids: [id],
    hideBanned: false,
  })).data[0];
}

export const uploadImage = async (image: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", image);

  const { data } = await api.post(
    `${config.serverUri}/files/upload`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return `${config.baseAuthUrl}${data.url}`;
};

export const updateMap = async (id: string, data: {
  title?: string;
  previewUrl?: string;
  creator?: string;
  description?: string;
  previews?: string[];
}): Promise<WorkshopItem> => {
  const response = await api.put(`${config.serverUri}/manage/workshop/${id}/upsert`, {
    type: "WorkshopItemUpdate",
    data,
  });

  return response.data;
};

export const createMap = async (data: {
  title: string;
  steamId: string;
  previewUrl: string;
  creator: string;
  creatorId?: string;
  description?: string;
  previews?: string[];
  createDate?: Date;
}): Promise<WorkshopItem> => {
  const response = await api.put(`${config.serverUri}/manage/workshop/${data.steamId}/upsert`, {
    type: "WorkshopItemCreate",
    data,
  });

  return response.data;
};

export const getComments = async (mapId: string): Promise<UserComment[]> => {
  return (await api.get(`${config.serverUri}/comments?id=${mapId}`)).data;
};

export const deleteComment = async (id: string): Promise<void> => {
  await api.delete(`${config.serverUri}/comments?id=${id}`);
};
