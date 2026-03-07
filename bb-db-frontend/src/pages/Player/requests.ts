import { config } from "../../../config/config";
import { api } from "../../features/Auth";

export const getUser = async (id: string): Promise<User> => {
  return (await api.get(`${config.serverUri}/user/s-id/${id}`)).data;
};

export const getUserFavorites = async (id: string): Promise<WorkshopItem[]> => {
  return (await api.get(`${config.serverUri}/user/${id}/favorites`)).data;
};

export const getPlayer = async (id: string): Promise<Player> => {
  return (await api.get(`${config.serverUri}/workshop/player/${id}`)).data;
};

export const getPlayerMaps = async (ids: string[]): Promise<WorkshopItem[]> => {
  return (
    await api.post(`${config.serverUri}/workshop/get-query-list`, {
      ids: ids,
    })
  ).data;
};

export const getPlayerReplays = async (ids: string[]): Promise<Replay[]> => {
  return (
    await api.post(`${config.serverUri}/workshop/get-query-replays`, {
      ids: ids,
      requestMapNames: true
    })
  ).data;
};
