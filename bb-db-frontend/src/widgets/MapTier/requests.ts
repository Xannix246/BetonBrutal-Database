import { v4 } from "uuid";
import { api } from "@features";
import { addToast } from "@store";

export const submitTierVote = async (mapId: string, tier: number) => {
  const response = (await api.post(`/workshop/${mapId}/tier`, {
    tier,
  }).then((data) => {
    addToast({
      id: v4(),
      time: 5000,
      type: "info",
      title: "Vote sent",
      description: "Your vote has been sent and will be reviewed by mods"
    });
    return data;
  })).data;

  return response;
}

export const updateTierVote = async (mapId: string, tier: number) => {
  const response = (await api.put(`/workshop/${mapId}/tier`, {
    tier,
  }).then((data) => {
    addToast({
      id: v4(),
      time: 5000,
      type: "info",
      title: "Vote updated",
      description: "Your vote has been updated. Please note that it will require manual review again"
    });
    return data;
  })).data;

  return response;
}
