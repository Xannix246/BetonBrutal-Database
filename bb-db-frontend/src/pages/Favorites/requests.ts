import { config } from "../../../config/config";
import { api } from "../../features/Auth";

export const getUser = async (id: string): Promise<User> => {
  return (await api.get(`${config.serverUri}/user/${id}`)).data;
};

export const getUserFavorites = async (id: string): Promise<WorkshopItem[]> => {
  return (await api.get(`${config.serverUri}/user/${id}/favorites`)).data;
};
