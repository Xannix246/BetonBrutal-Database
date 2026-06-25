import { api } from "@features";
import { config } from "@config";

export const getFollowedMaps = async (
  sortBy: SortBy = "newest", 
  quantity: number = 3, 
  sendPreviews: boolean = false,
  timeRange?: 'day' | 'week' | 'month' | 'year'
): Promise<WorkshopItemHeader[]>  => {
  const data = (await api.get(`${config.serverUri}/workshop/get-list?sortBy=${sortBy}&quantity=${quantity}&sendPreviews=${sendPreviews}${timeRange && "&timeRange=" + timeRange}`)).data;
  return data;
}

export const getCollections = async (): Promise<Collection[]> => {
  return (await api.get(`/collections/get?forMain=true`)).data; 
}
