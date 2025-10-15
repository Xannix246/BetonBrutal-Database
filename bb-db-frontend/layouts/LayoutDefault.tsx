import "./tailwind.css";
import "./descStyles.css";
import { useEffect } from "react";
import { getFavorites } from "../src/features/FavoriteManager";

export const LayoutDefault = ({ children }: { children: React.ReactNode }) => {

  useEffect(() => {
    (async () => {
      await getFavorites();
    })();
  }, []);

  return (
    <div className={"w-full h-full "}>
      {children}
    </div>
  );
}