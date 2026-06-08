import { config } from "../../../config/config";
import { api } from "../../features/Auth";

export const getMaps = async (
  sortBy: SortBy = "newest",
  quantity: number = 50,
  page: number,
  tags?: string[],
  tier?: number,
): Promise<WorkshopItemHeader[]> => {
  const searchParams = new URLSearchParams();

  searchParams.set("sortBy", sortBy);
  searchParams.append("quantity", quantity.toString());
  searchParams.append("page", page.toString());

  if (tags) searchParams.append("tags", tags.join(","));
  if (tier !== undefined) {
    searchParams.set("sortBy", "topTier");
    searchParams.append("tier", tier.toString());
  }

  return (
    await api.get(
      `${config.serverUri}/workshop/get-list?${searchParams.toString()}`,
    )
  ).data;
};

export const getRandomMap = async (): Promise<string> => {
  return (await api.get(`${config.serverUri}/workshop/get-random-item`)).data;
};
