import { config } from "../../../config/config";
import { api } from "../../features/Auth";

export const getPlayer = async (id: string): Promise<Player> => {
  return (await api.get(`${config.serverUri}/workshop/player/${id}`))
    .data;
};

export const getPlayerMaps = async (
  ids: string[]
): Promise<WorkshopItem[]> => {
  return (
    await api.post(`${config.serverUri}/workshop/get-query-list`, {
      ids: ids
    })
  ).data;
};
