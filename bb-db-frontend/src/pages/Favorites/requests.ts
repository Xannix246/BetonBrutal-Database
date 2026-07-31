import { api } from "@features";
import { config } from "@config";

export const getUser = async (id: string): Promise<User> => {
  return (await api.get(`${config.serverUri}/user/${id}`)).data;
};

export const getUserFavorites = async (id: string): Promise<WorkshopItemHeader[]> => {
  return (await api.get(`${config.serverUri}/user/${id}/favorites`)).data;
};

export const getUserBySteamId = async (id: string): Promise<User> => {
  return (await api.get(`${config.serverUri}/user/s-id/${id}`)).data;
};
