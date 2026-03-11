import { api } from "../../features/Auth";

export const getUser = async (id: string): Promise<User> => {
  return (await api.get(`/user/s-id/${id}`)).data;
};

export const getUserFavorites = async (id: string): Promise<WorkshopItem[]> => {
  return (await api.get(`/user/${id}/favorites`)).data;
};

export const getPlayer = async (id: string): Promise<Player> => {
  return (await api.get(`/workshop/player/${id}`)).data;
};

export const getPlayerMaps = async (ids: string[]): Promise<WorkshopItem[]> => {
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
