import axios from "axios";
import { $searchData } from "../store/store";
import { navigate } from "vike/client/router";

export const handleSearch = async (searchQuery: string) => {
  const result: WorkshopItem[] = (
    await axios.get(
      `http://26.220.176.177:3000/workshop/search?q=${encodeURIComponent(
        searchQuery
      )}`
    )
  ).data;
  $searchData.set(result);

  console.log(result);


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
