import { $searchData } from "../store/store";
import { navigate } from "vike/client/router";
import { api } from "./Auth";
import { config } from "../../config/config";

export const handleSearch = async (searchQuery: string, returnOnlyData?: boolean) => {
  const result: WorkshopItem[] = (
    await api.get(
      `${config.serverUri}/workshop/search?q=${encodeURIComponent(
        searchQuery
      )}`
    )
  ).data;
  $searchData.set(result);

  if (returnOnlyData) {
    return $searchData.get();
  }

  if (result.length === 1) {
    window.location.replace(`/workshop/${result[0].steamId}`);
  } else {
    navigate(`/search`);
  }
};

export const handleEnterSearch = (searchQuery: string, event: { key: string }) => {
  if (event.key === "Enter") {
    handleSearch(searchQuery);
  }
};
