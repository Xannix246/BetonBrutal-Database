import "./tailwind.css";
import "./descStyles.css";
import { useEffect } from "react";
import { getFavorites } from "../src/features/FavoriteManager";
import { setUser } from "../src/store/store";
import { authClient } from "../src/features/Auth";
import { usePageContext } from "vike-react/usePageContext";
import i18n from "../i18n/config";
import { config } from "../config/config";
// import Snowfall from "react-snowfall";

export const LayoutDefault = ({ children }: { children: React.ReactNode }) => {
  const pageContext = usePageContext();
  const localeParam = pageContext.urlParsed.search["lang"];
  const locale = localeParam;

  useEffect(() => {
    (async () => {
      const user = (await authClient.getSession()).data?.user;
      setUser(user || undefined);
      console.log(user?.id);
      await getFavorites();
    })();
  }, []);

  useEffect(() => {
    if (locale) {
      if (locale === "ru-RU") {
        fetch(config.ruMirrorUrl, { mode: "no-cors" })
          .then(() => window.location.replace(config.ruMirrorUrl))
          .catch((res) => console.log(res, "Bad response"));
      }

      localStorage.setItem("language", locale);
      i18n.changeLanguage(locale);
    }

    console.log(i18n.language);
  }, [locale]);

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
};
