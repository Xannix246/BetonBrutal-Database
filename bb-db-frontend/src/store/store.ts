import { atom } from "nanostores";
import { useStore } from "@nanostores/react";

export const $searchData = atom<WorkshopItem[]>([]);
export const setSearchData = (items: WorkshopItem[] | []) => $searchData.set(items);
export const getSearchData = () => useStore($searchData);

export const $prevLink = atom<"mapCreator" | "run" | "favorites">("run");
export const setPrevLink = (link: "mapCreator" | "run" | "favorites") => $prevLink.set(link);
export const getPrevLink = () => useStore($prevLink);

export const $favorites = atom<string[]>([]);
export const setFavorites = (list: string[]) => $favorites.set(list);
export const getFavorites = () => useStore($favorites);

export const $user = atom<User | undefined>(undefined);
export const setUser = (user: User | undefined) => $user.set(user);
export const getUser = () => useStore($user);

export const $files = atom<File[]>([]);
export const setFiles = (files: File[]) => $files.set(files);
export const getFiles = () => useStore($files);

export const $doc = atom<string>("# Type *here* something");
export const setDoc = (doc: string) => $doc.set(doc);
export const getDoc = () => useStore($doc);

export const $targetData = atom<{id: string, name: string} | null>(null);
export const setTargetData = (map: {id: string, name: string} | null) => $targetData.set(map);
export const getTargetData = () => useStore($targetData);

export const $activeMap = atom<WorkshopItem | null>(null);
export const setActiveMap = (map: WorkshopItem | null) => $activeMap.set(map);
export const getActiveMap = () => useStore($activeMap);
