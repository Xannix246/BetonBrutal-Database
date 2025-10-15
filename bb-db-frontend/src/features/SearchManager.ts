import { $searchData } from "../store/store";
import { navigate } from "vike/client/router";
import { api } from "./Auth";
import { config } from "../../config/config";

export const handleSearch = async (searchQuery: string) => {
  const result: WorkshopItem[] = (
    await api.get(
      `${config.serverUri}/workshop/search?q=${encodeURIComponent(
        searchQuery
      )}`
    )
  ).data;
  $searchData.set(result);

  if (result.length === 1) {
    navigate(`/workshop/${result[0].steamId}`);
  } else {
    navigate(`/search`);
  }
};

export const handleEnterSearch = (searchQuery: string, event: { key: string }) => {
  if (event.key === "Enter") {
    handleSearch(searchQuery);
  }
};
