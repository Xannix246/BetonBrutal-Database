import { api } from "@features";

export const getEvent = async (): Promise<EventData> => {
  return (await api.get(`/workshop/event`)).data; 
}

export const setVote = async (mapId: string): Promise<EventData> => {
  return (await api.post(`/workshop/event/vote`, {
    mapId,
  })).data; 
}