import { api } from "../Auth"

export const getMaps = async (ids: string[]): Promise<WorkshopItemHeader[]> => {
  return (await api.post(`/workshop/get-query-list?sendPreviews=true`, { ids })).data; 
}