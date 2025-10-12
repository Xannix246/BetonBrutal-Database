import axios from "axios";

export const getMaps = async (
  sortBy: SortBy = "newest",
  quantity: number = 50,
  page: number,
): Promise<WorkshopItem[]>  => {
  return (await axios.get(`http://26.220.176.177:3000/workshop/get-list?sortBy=${sortBy}&quantity=${quantity}&page=${page}`)).data;
}