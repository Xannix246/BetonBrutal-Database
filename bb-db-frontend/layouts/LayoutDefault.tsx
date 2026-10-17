import "./tailwind.css";
import "./descStyles.css";
import { createContext, useContext, useEffect } from "react";
import { usePageContext } from "vike-react/usePageContext";
// import Snowfall from "react-snowfall";
import { getFavorites, authClient, api } from "@features";
import { Footer, Header, TitleMain, Toasts } from "@widgets";
import { getCurrentTheme, setCurrentTheme, setStats, setUser } from "@store";
import { config } from "@config";
import i18n from "@locales/config";
import { isClassic } from "@utils";
import clsx from "clsx";

export const LayoutDefault = ({ children }: { children: React.ReactNode }) => {
  const pageContext = usePageContext();
  const localeParam = pageContext.urlParsed.search["lang"];
  const locale = localeParam;
  const ThemeContext = createContext<string | null>(null);
  const theme = getCurrentTheme();

  useEffect(() => {
    (async () => {
      const user = (await authClient.getSession()).data?.user;
      setUser(user || undefined);
      console.log(user?.id);
      await getFavorites();

      const data = (await api.get('workshop/summary-data')).data as SummaryData; 
      setStats(data);
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

    setCurrentTheme(localStorage.getItem("theme") as "classic" | "default" ?? "classic");
    if(window.innerWidth < 1115) {
      setCurrentTheme("default");
      localStorage.setItem("theme", "default");
    }

    console.log(i18n.language);
  }, [locale]);

  return (
    <ThemeContext value={theme}>
      <div className={clsx("w-full min-h-screen", isClassic() ? "font-tahoma" : "font-bn-pro")}>
        <Toasts />
        {isClassic() && <div className="pointer-events-none fixed inset-0 z-[9999] bg-[repeating-linear-gradient(to_bottom,transparent_0px,transparent_2px,rgb(0_0_0_/_18%)_3px,transparent_4px)]" />}
        {/* <Snowfall
          style={{
            zIndex: 100,
            position: "fixed",
          }}
          snowflakeCount={200}
        /> */}
        {isClassic() && <TitleMain />}
        {isClassic() && <div className="fixed pt-21 h-full">
          <Header/>  
        </div>}
        <div className={isClassic() ? "pt-16 pl-64 flex justify-center" : ""}>
          <div className={isClassic() ? "max-w-5xl w-full" : ""}>
            {children}
          </div>
        </div>
        {isClassic() && <div className="pl-64">
          <Footer/>
        </div>}
      </div>
    </ThemeContext>
  );
};
