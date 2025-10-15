import { $favorites } from "../store/store";
import { api, authClient } from "./Auth";
import { config } from "../../config/config";

export const getFavorites = async () => {
  const result: string[] = (
    await api.get(
      `${config.serverUri}/user/${
        (
          await authClient.getSession()
        ).data?.user.id
      }/favorites`
    )
  ).data;
  $favorites.set(result);
};

export const addFavorites = async (id: string) => {
  const result: string[] = (
    await api.get(`${config.serverUri}/user/favorites/add?id=${id}`)
  ).data;
  $favorites.set(result);

  console.log($favorites.get());
};

export const removeFavorites = async (id: string) => {
  const result: string[] = (
    await api.delete(`${config.serverUri}/user/favorites/delete?id=${id}`)
  ).data;
  $favorites.set(result);

  console.log($favorites.get());
};
