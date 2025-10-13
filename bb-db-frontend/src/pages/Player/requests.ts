import axios from "axios";

export const getPlayer = async (id: string): Promise<Player> => {
  return (await axios.get(`http://26.220.176.177:3000/workshop/player/${id}`))
    .data;
};

export const getPlayerMaps = async (
  ids: string[]
): Promise<WorkshopItem[]> => {
  console.log(ids);
  return (
    await axios.post(`http://26.220.176.177:3000/workshop/get-query-list`, {
      ids: ids
    })
  ).data;
};
