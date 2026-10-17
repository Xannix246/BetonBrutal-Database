import { useEffect, useState } from "react";
import { navigate } from "vike/client/router";
import { t } from "i18next";
import clsx from "clsx";
import { Button, Checkbox } from "@shared";
import { MapCard, MapTile } from "@entities";
import { Header, Footer, Background, TitleMain, PoolContainer } from "@widgets";
import { CollectionContainer } from "@features";
import { Keys } from "@locales/keys";
import { getCollections, getFollowedMaps } from "./requests";
import { isClassic } from "@utils";
import { getCurrentTheme, setCurrentTheme } from "@/store";
import { config } from "@config";

const key = Keys.main;

const Main = () => {
  const [followedMaps, setFollowedMaps] = useState<WorkshopItemHeader[]>([]);
  const [lastestMaps, setLastestMaps] = useState<WorkshopItemHeader[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isSticky, setIsSticky] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isClassicThemeEnabled, setIsClassicThemeEnabled] = useState(isClassic());
  const theme = getCurrentTheme();

  useEffect(() => {
    setLoaded(window ? true : false);

    (async () => {
      setCollections(await getCollections());

      const folMaps = await getFollowedMaps("mostPopular", 3, true, "year");
      setFollowedMaps(folMaps);

      const lastMaps = await getFollowedMaps("mostPopular", 20, true, "month");
      setLastestMaps(
        lastMaps.toSorted(
          (a, b) =>
            new Date(b.createDate).valueOf() - new Date(a.createDate).valueOf(),
        ),
      );
    })();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsSticky(scrollY > 256);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!loaded) return null;

  return (
    <div className="w-full h-full">
      <Background />
      <div className={isClassic() ? "mb-0" : "mb-32 mt-68"}>
        {!isClassic() && <TitleMain />}
        {!isClassic() && (
          <div
            className={clsx(
              isSticky
                ? "fixed top-0 left-0 w-full z-50"
                : "absolute top-64 left-0 w-full",
            )}>
            <Header isAbsolute={isSticky} />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-32 justify-center">
        <div className="flex flex-col gap-4 place-items-center w-full mt-16">
          <div className={clsx(
            isClassic()
              ? "bg-class text-black w-full px-8"
              : "bg-black/70 p-4 text-4xl text-white mt-32"
          )}>
            <div className={clsx("flex flex-col",
              isClassic()
                ? "border-l-4 px-4 py-1 flex gap-2 container-blue"
                : "flex place-items-center gap-4"
            )}>
              <span className={clsx(isClassic() ? "font-bold" : "uppercase text-6xl text-yellow")}>Welcome to Beton Brutal Database!</span>
              <span>Just in case if you want to change theme back:</span>
              <div
                className="flex gap-2 place-items-center"
                onClick={() => {
                  localStorage.setItem("theme", theme === "default" ? "classic" : "default");
                  setCurrentTheme(theme === "default" ? "classic" : "default");
                  config.theme = theme === "default" ? "classic" : "default";
                  console.log("changed theme");
                }}
              >
                <Checkbox enabled={isClassicThemeEnabled} setEnabled={setIsClassicThemeEnabled}/>
                <span>Classic theme</span>
              </div>
            </div>
          </div>
          {isClassic() && <div className="bg-class text-black w-full px-8">
            <div className="border-l-4 px-4 py-1 flex gap-2 container-green">
              <span className="font-bold">Pro tip:</span>
              <span>Press SPACE to jump</span>  
            </div>
          </div>}
          <PoolContainer />
          {collections.length > 0 && (
            <div className="grid gap-16 w-full mb-32">
              {collections.map((collection, i) => (
                <CollectionContainer collection={collection} key={i} />
              ))}
            </div>
          )}
          <div
            className={clsx(
              isClassic()
                ? "w-full p-6 text-classic-blue-500"
                : "p-4 bg-black/70 uppercase",
            )}>
            <h1
              className={clsx(
                isClassic()
                  ? "text-2xl font-bold border-b-1 border-classic-blue-500"
                  : "w-fit text-center text-7xl text-[#ffd884] tracking-wider text-shadow-md",
              )}>
              {t(key.yearMaps)}
            </h1>
          </div>
          <div className={clsx(
            isClassic()
              ? "flex flex-col gap-4 w-full px-16"
              : "flex flex-col lg:flex-row justify-center gap-8 w-full h-500 lg:h-232 overflow-clip"
          )}>
            {followedMaps.map((map) => (
              <MapCard
                id={map.id}
                title={map.title}
                preview={map.previewUrl}
                previews={map.previews}
                key={map.id}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 place-items-center w-full mt-16">
          <div
            className={clsx(
              isClassic()
                ? "w-full p-6 text-classic-blue-500"
                : "p-4 bg-black/70 uppercase",
            )}>
            <h1
              className={clsx(
                isClassic()
                  ? "text-2xl font-bold border-b-1 border-classic-blue-500"
                  : "w-fit text-center text-7xl text-[#ffd884] tracking-wider text-shadow-md",
              )}>
              {t(key.newMaps)}
            </h1>
          </div>
          <div className="flex justify-center w-full">
            <div className={clsx("gap-6 p-6 w-full",
              isClassic()
                ? "flex flex-col !gap-4"
                : "grid sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] auto-rows-[200px] lg:auto-rows-[300px]"
            )}>
              {lastestMaps.map((m) => (
                <MapTile key={m.id} item={m} />
              ))}
            </div>
          </div>
          <Button onClick={() => navigate("/workshop")} className={clsx(!isClassic() && "uppercase")}>
            {t(key.discoverBtn)}
          </Button>
        </div>

         {!isClassic() && <Footer/>}
      </div>
    </div>
  );
};

export default Main;
