import { useEffect, useState } from "react";
import { navigate } from "vike/client/router";
import { t } from "i18next";
import clsx from "clsx";
import { Button } from "@shared";
import { MapCard, MapTile } from "@entities";
import { Header, Footer, Background, TitleMain, PoolContainer } from "@widgets";
import { CollectionContainer } from "@features";
import { Keys } from "@locales/keys";
import { getCollections, getFollowedMaps } from "./requests";

const key = Keys.main;

const Main = () => {
  const [followedMaps, setFollowedMaps] = useState<WorkshopItemHeader[]>([]);
  const [lastestMaps, setLastestMaps] = useState<WorkshopItemHeader[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isSticky, setIsSticky] = useState(false);
  const [loaded, setLoaded] = useState(false);

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
      <div className="mb-32">
        <TitleMain />
        <div
          className={clsx(
            isSticky
              ? "fixed top-0 left-0 w-full z-50"
              : "absolute top-64 left-0 w-full z-50",
          )}
        >
          <Header isAbsolute={isSticky} />
        </div>
      </div>
      <div className="flex flex-col gap-32 justify-center">
        <div className="flex flex-col gap-4 place-items-center w-full mt-16">
          <PoolContainer/>
          {collections.length > 0 && (
            <div className="grid gap-16 w-full mb-32">
              {collections.map((collection, i) => (
                <CollectionContainer collection={collection} key={i} />
              ))}
            </div>
          )}
          <div className="p-4 bg-black/70 uppercase">
            <h1 className="w-fit text-center text-7xl text-[#ffd884] tracking-wider text-shadow-md">
              {t(key.yearMaps)}
            </h1>
          </div>
          <div className="flex flex-col lg:flex-row justify-center gap-8 w-full h-500 lg:h-232 overflow-clip">
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
          <div className="p-4 bg-black/70">
            <h1 className="w-fit text-center lg:text-left text-4xl text-[#ffd884] tracking-wider text-shadow-md">
              {t(key.newMaps)}
            </h1>
          </div>
          <div className="flex justify-center w-full">
            <div className="grid sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] auto-rows-[200px] lg:auto-rows-[300px] gap-6 p-6 w-full">
              {lastestMaps.map((m) => (
                <MapTile key={m.id} item={m} />
              ))}
            </div>
          </div>
          <Button onClick={() => navigate("/workshop")} className="uppercase">
            {t(key.discoverBtn)}
          </Button>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Main;
