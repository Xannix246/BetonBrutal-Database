import axios from "axios";
import { config } from "../../../config/config";

export const getMaps = async (
  sortBy: SortBy = "newest",
  quantity: number = 50,
  page: number,
): Promise<WorkshopItem[]>  => {
  return (await axios.get(`${config.serverUri}/workshop/get-list?sortBy=${sortBy}&quantity=${quantity}&page=${page}`)).data;
}