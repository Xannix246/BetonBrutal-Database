import "./tailwind.css";
import "./descStyles.css";
import { useEffect } from "react";
import { usePageContext } from "vike-react/usePageContext";
// import Snowfall from "react-snowfall";
import { getFavorites, authClient } from "@features";
import { Toasts } from "@widgets";
import { setUser } from "@store";
import { config } from "@config";
import i18n from "@locales/config";

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
    <div className={"w-full min-h-screen"}>
      <Toasts />
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
