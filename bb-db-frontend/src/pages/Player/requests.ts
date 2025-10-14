import axios from "axios";
import { config } from "../../../config/config";

export const getPlayer = async (id: string): Promise<Player> => {
  return (await axios.get(`${config.serverUri}/workshop/player/${id}`))
    .data;
};

export const getPlayerMaps = async (
  ids: string[]
): Promise<WorkshopItem[]> => {
  console.log(ids);
  return (
    await axios.post(`${config.serverUri}/workshop/get-query-list`, {
      ids: ids
    })
  ).data;
};
