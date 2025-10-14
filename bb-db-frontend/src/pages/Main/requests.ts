import axios from "axios";
import { config } from "../../../config/config";

export const getFollowedMaps = async (
  sortBy: SortBy = "newest", 
  quantity: number = 3, 
  sendPreviews: boolean = false,
  timeRange?: 'day' | 'week' | 'month' | 'year'
): Promise<WorkshopItem[]>  => {
  return (await axios.get(`${config.serverUri}/workshop/get-list?sortBy=${sortBy}&quantity=${quantity}&sendPreviews=${sendPreviews}${timeRange && "&timeRange=" + timeRange}`)).data;
}