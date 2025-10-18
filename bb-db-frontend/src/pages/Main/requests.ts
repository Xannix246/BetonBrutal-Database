import { config } from "../../../config/config";
import { api } from "../../features/Auth";

export const getFollowedMaps = async (
  sortBy: SortBy = "newest", 
  quantity: number = 3, 
  sendPreviews: boolean = false,
  timeRange?: 'day' | 'week' | 'month' | 'year'
): Promise<WorkshopItem[]>  => {
  const data = (await api.get(`${config.serverUri}/workshop/get-list?sortBy=${sortBy}&quantity=${quantity}&sendPreviews=${sendPreviews}${timeRange && "&timeRange=" + timeRange}`)).data;
  console.log(data);
  return data;
}