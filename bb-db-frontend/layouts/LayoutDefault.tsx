import "./tailwind.css";
import "./descStyles.css";
import { useEffect } from "react";
import { getFavorites } from "../src/features/FavoriteManager";
import { setUser } from "../src/store/store";
import { authClient } from "../src/features/Auth";
// import Snowfall from "react-snowfall";

export const LayoutDefault = ({ children }: { children: React.ReactNode }) => {

  useEffect(() => {
    (async () => {
      const user = (await authClient.getSession()).data?.user;
      setUser(user || undefined);
      console.log(user?.id);
      await getFavorites();
    })();
  }, []);

  return (
    <div className={"w-full h-full"}>
      {/* <Snowfall
        style={{
          zIndex: 100,
          position: "fixed",
        }}
        snowflakeCount={200}
      /> */}
      {children}
    </div>
  );
}