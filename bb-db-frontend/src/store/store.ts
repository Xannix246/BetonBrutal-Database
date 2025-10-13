import { atom } from "nanostores";
import { useStore } from "@nanostores/react";

export const $searchData = atom<WorkshopItem[]>([]);
export const setSearchData = (items: WorkshopItem[] | []) => $searchData.set(items);
export const getSearchData = () => useStore($searchData);
