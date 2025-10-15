import { atom } from "nanostores";
import { useStore } from "@nanostores/react";

export const $searchData = atom<WorkshopItem[]>([]);
export const setSearchData = (items: WorkshopItem[] | []) => $searchData.set(items);
export const getSearchData = () => useStore($searchData);

export const $prevLink = atom<"mapCreator" | "run">("run");
export const setPrevLink = (link: "mapCreator" | "run") => $prevLink.set(link);
export const getPrevLink = () => useStore($prevLink);
