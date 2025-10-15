import { config } from "../../../config/config";
import { api } from "../../features/Auth";

export const getMap = async (
  id: string
): Promise<WorkshopItem>  => {
  return (await api.get(`${config.serverUri}/workshop/${id}`)).data;
}

export const getReplays = async (
  id: string
): Promise<Replay[]>  => {
  return (await api.get(`${config.serverUri}/workshop/${id}/replays`)).data;
}

export const getComments = async (mapId: string): Promise<UserComment[]> => {
  return (await api.get(`${config.serverUri}/comments?id=${mapId}`)).data;
}

export const postComment = async (
  mapId: string, 
  message: string
): Promise<UserComment> => {
  return (await api.post(`${config.serverUri}/comments/post`, {
    message,
    mapId
  })).data;
}
