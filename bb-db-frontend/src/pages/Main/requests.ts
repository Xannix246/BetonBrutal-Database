import axios from "axios";

export const getFollowedMaps = async (
  sortBy: SortBy = "newest", 
  quantity: number = 3, 
  sendPreviews: boolean = false,
  timeRange?: 'day' | 'week' | 'month' | 'year'
): Promise<WorkshopItem[]>  => {
  return (await axios.get(`http://26.220.176.177:3000/workshop/get-list?sortBy=${sortBy}&quantity=${quantity}&sendPreviews=${sendPreviews}${timeRange && "&timeRange=" + timeRange}`)).data;
}