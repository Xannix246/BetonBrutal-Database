import { atom } from "nanostores";
import { useStore } from "@nanostores/react";

export const $searchData = atom<WorkshopItem[]>([]);
export const setSearchData = (items: WorkshopItem[] | []) => $searchData.set(items);
export const getSearchData = () => useStore($searchData);

export const $prevLink = atom<"mapCreator" | "run">("run");
export const setPrevLink = (link: "mapCreator" | "run") => $prevLink.set(link);
export const getPrevLink = () => useStore($prevLink);

export const $favorites = atom<string[]>([]);
export const setFavorites = (list: string[]) => $favorites.set(list);
export const getFavorites = () => useStore($favorites);
