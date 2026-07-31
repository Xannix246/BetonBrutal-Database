import { navigate } from "vike/client/router";
import { $searchData } from "@store";
import { config } from "@config";
import { api } from "./Auth";

export const handleSearch = async (searchQuery: string, returnOnlyData?: boolean) => {
  const result: WorkshopItemHeader[] = (
    await api.get(
      `${config.serverUri}/workshop/search?q=${encodeURIComponent(
        searchQuery
      )}`
    )
  ).data;
  console.log(result);
  $searchData.set(result);

  if (returnOnlyData) {
    return $searchData.get();
  }

  if (result.length === 1) {
    window.location.replace(`/workshop/${result[0].id}`);
  } else {
    navigate(`/search`);
  }
};

export const handleEnterSearch = (searchQuery: string, event: { key: string }) => {
  if (event.key === "Enter") {
    handleSearch(searchQuery);
  }
};
