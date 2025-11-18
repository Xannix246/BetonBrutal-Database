import { config } from "../../../config/config";
import { api } from "../../features/Auth";

export const getMaps = async (
  sortBy: SortBy = "newest",
  quantity: number = 50,
  page: number,
): Promise<WorkshopItem[]>  => {
  return (await api.get(`${config.serverUri}/workshop/get-list?sortBy=${sortBy}&quantity=${quantity}&page=${page}`)).data;
}

export const getRandomMap = async (): Promise<string> => {
  return (await api.get(`${config.serverUri}/workshop/get-random-item`)).data;
}
