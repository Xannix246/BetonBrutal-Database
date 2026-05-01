import { v4 } from "uuid";
import { config } from "../../../config/config";
import { api } from "../../features/Auth";
import { addToast } from "../../store/toast-manager";
import { Labels } from "../../widgets/MapTier/labels";

export const getMaps = async (
  searchQuery: string,
): Promise<WorkshopItemHeader[]> => {
  return (
    await api.get(
      `/workshop/search?q=${encodeURIComponent(
        searchQuery,
      )}`,
    )
  ).data;
};

export const getMap = async (id: string): Promise<WorkshopItem | null> => {
  return (await api.get(`/workshop/${id}`)).data;
};

export const getReplays = async (id: string): Promise<Replay[]> => {
  return (await api.get(`/workshop/${id}/replays?hideBanned=false`)).data;
};

export const getReplayById = async (id: string): Promise<Replay> => {
  return (await api.post(`/workshop/get-query-replays`, {
    ids: [id],
    hideBanned: false,
  })).data[0];
}

export const uploadImage = async (image: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", image);

  const { data } = await api.post(
    `/files/upload`,
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
  const response = await api.put(`/manage/workshop/${id}/upsert`, {
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
  const response = await api.put(`/manage/workshop/${data.steamId}/upsert`, {
    type: "WorkshopItemCreate",
    data,
  });

  return response.data;
};

export const getComments = async (mapId: string): Promise<UserComment[]> => {
  return (await api.get(`/comments?id=${mapId}`)).data;
};

export const deleteComment = async (id: string): Promise<void> => {
  await api.delete(`/comments?id=${id}`);
};

export const getTierData = async (mapId: string): Promise<TierData | null> => {
  return (await api.get(`/workshop/${mapId}/tier`)).data;
}

export const setMapTierData = async (
  mapId: string,
  tier: number,
  labels?: Labels[],
): Promise<TierData | null> => {
  const response = await api.post(`/manage/workshop/${mapId}/tier`, {
    tier,
    labels,
  }).then((data) => {
    addToast({
      id: v4(),
      time: 5000,
      type: "success",
      title: "Tier was edited",
      description: `Tier was edited to ${tier}`,
    });
    return data;
  });

  return response.data;
}

export const getTierVoteRequests = async (mapId?: string): Promise<TierEntry[]> => {
  return (await api.get(`/workshop/get-tier-entries?type=pending${mapId ? `&mapId=${mapId}` : ""}`)).data;
}

export const updateTierEntry = async (
  entry: TierEntry,
  type: "accepted" | "denied",
): Promise<TierEntry> => {
  return (await api.put(`/manage/tier/entries/${entry.id}`, {
    tier: entry.tier,
    type,
  })).data;
}

export const getItems = async (ids: string[]): Promise<WorkshopItemHeader[]> => {
  return (await api.post(`/workshop/get-query-list`, { ids })).data;
};
