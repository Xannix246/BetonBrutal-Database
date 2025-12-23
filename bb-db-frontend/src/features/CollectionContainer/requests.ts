import { api } from "../Auth"

export const getMaps = async (ids: string[]): Promise<WorkshopItem[]> => {
  return (await api.post(`/workshop/get-query-list?sendPreviews=true`, { ids })).data; 
}