import { $favorites, $user } from "@store";
import { config } from "@config";
import { api } from "./Auth";

export const getFavorites = async () => {
  const result = ((
    await api.get(
      `${config.serverUri}/user/${
        $user.get()?.id
      }/favorites`
    )
  ).data as WorkshopItem[]).map((favorite) => favorite.id);
  $favorites.set(result);
};

export const addFavorites = async (id: string) => {
  const result: string[] = (
    await api.get(`${config.serverUri}/user/favorites/add?id=${id}`)
  ).data;
  $favorites.set(result);
};

export const removeFavorites = async (id: string) => {
  const result: string[] = (
    await api.delete(`${config.serverUri}/user/favorites/delete?id=${id}`)
  ).data;
  $favorites.set(result);
};
