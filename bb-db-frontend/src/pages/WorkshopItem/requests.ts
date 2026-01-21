import { config } from "../../../config/config";
import { api } from "../../features/Auth";

export const getMap = async (id: string): Promise<WorkshopItem | null> => {
  return (await api.get(`${config.serverUri}/workshop/${id}`)).data;
};

export const getReplays = async (id: string): Promise<Replay[]> => {
  return (await api.get(`${config.serverUri}/workshop/${id}/replays`)).data;
};

export const getComments = async (mapId: string): Promise<UserComment[]> => {
  return (await api.get(`${config.serverUri}/comments?id=${mapId}`)).data;
};

export const postComment = async (
  mapId: string,
  message: string,
): Promise<UserComment> => {
  return (
    await api.post(`${config.serverUri}/comments/post`, {
      message,
      mapId,
    })
  ).data;
};

export const uploadMap = async (mapId: string, file: Blob) => {
  const formData = new FormData();
  formData.append("file", file);

  return (await api.post(`db/upload?id=${mapId}`, formData)).data;
};
