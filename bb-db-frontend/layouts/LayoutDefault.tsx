import "./tailwind.css";
import "./descStyles.css";
import { useEffect } from "react";
import { getFavorites } from "../src/features/FavoriteManager";
import { setUser } from "../src/store/store";
import { authClient } from "../src/features/Auth";

export const LayoutDefault = ({ children }: { children: React.ReactNode }) => {

  useEffect(() => {
    (async () => {
      setUser((await authClient.getSession()).data?.user || undefined);
      await getFavorites();
    })();
  }, []);

  return (
    <div className={"w-full h-full "}>
      {children}
    </div>
  );
}