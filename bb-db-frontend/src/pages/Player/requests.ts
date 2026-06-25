import { v4 } from "uuid";
import { api } from "@features";
import { setUser, addToast } from "@store";

export const getUser = async (id: string): Promise<User> => {
  return (await api.get(`/user/s-id/${id}`)).data;
};

export const getUserFavorites = async (id: string): Promise<WorkshopItemHeader[]> => {
  return (await api.get(`/user/${id}/favorites`)).data;
};

export const getPlayer = async (id: string): Promise<Player> => {
  return (await api.get(`/workshop/player/${id}`)).data;
};

export const getPlayerMaps = async (ids: string[]): Promise<WorkshopItemHeader[]> => {
  return (
    await api.post(`/workshop/get-query-list`, {
      ids: ids,
    })
  ).data;
};

export const getPlayerReplays = async (ids: string[]): Promise<Replay[]> => {
  return (
    await api.post(`/workshop/get-query-replays`, {
      ids: ids,
      requestMapNames: true,
    })
  ).data;
};

export const getUserPublicData = async (id: string): Promise<PublicData> => {
  return (await api.get(`/user/public-data/${id}`)).data;
};

export const uploadImage = async (image: File, type: "bg" | "pfp"): Promise<string> => {
  const formData = new FormData();
  formData.append("file", image);

  return (await api.post(
    `/files/upload-user-images?type=${type}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  )).data;
};

export const setUserPublicData = async (
  data: PublicData,
): Promise<PublicData> => {
  return (await api.put(`/user/public-data`, {
    ...data
  })).data;
};

export const getTierVoteRequests = async (id: string): Promise<TierEntry[]> => {
  return (await api.get(`/workshop/get-tier-entries?userId=${id}`)).data;
}

export const getItems = async (ids: string[]): Promise<WorkshopItemHeader[]> => {
  return (await api.post(`/workshop/get-query-list`, { ids })).data;
};

export const syncDiscordData = async (): Promise<void> => {
  const data = (await api.get("/user/me/update")).data;
  console.log(data);
  if(data) {
    setUser(data);
    addToast({
      id: v4(),
      title: "Data was updated successfully",
      time: 5000,
      type: "success",
    });
  } else {
    addToast({
      id: v4(),
      title: "Sync cooldown",
      description: "Seems like you already synced data recently. Please try again a bit later",
      time: 5000,
      type: "info",
    });
  }
};
