import { useEffect, useState } from "react";
import Button from "../../shared/Button/Button";
import Input from "../../shared/Input/Input";
import Header from "../../widgets/Header/Header";
import { getCollections, getFollowedMaps } from "./requests";
import MapCard from "../../entities/MapCard";
import Footer from "../../widgets/Footer/Footer";
import clsx from "clsx";
import MapTile from "../../entities/MapTile";
import { navigate } from "vike/client/router";
import { handleEnterSearch, handleSearch } from "../../features/SearchManager";
import Background from "../../widgets/Background/Background";
import CollectionContainer from "../../features/CollectionContainer/CollectionContainer";
// import { CircleStackIcon } from "@heroicons/react/24/outline";

const Main = () => {
  const [followedMaps, setFollowedMaps] = useState<WorkshopItem[]>([]);
  const [lastestMaps, setLastestMaps] = useState<WorkshopItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isSticky, setIsSticky] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      setCollections(await getCollections());

      const folMaps = await getFollowedMaps("mostPopular", 3, true, "year");
      setFollowedMaps(folMaps);

      const lastMaps = await getFollowedMaps("mostPopular", 20, true, "month");
      setLastestMaps(lastMaps.toSorted((a, b) => new Date(b.createDate).valueOf() - new Date(a.createDate).valueOf()));
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


  return (
    <div className="w-full h-full">
      <Background />
      <div
        className={clsx(
          isSticky ?
            "fixed top-0 left-0 w-full z-50"
            : "absolute top-64 left-0 w-full z-50"
        )}
      >
        <Header isAbsolute={isSticky} />
      </div>
      <div className="flex flex-col gap-32 justify-center">
        <div className="flex flex-col">
          <div className="bg-black/80 w-full h-64 flex flex-col place-items-center px-4 py-8 md:p-8 gap-8">
            <div className="relative">
              <h1 className="text-[#ffd884] text-6xl tracking-wider text-shadow-lg/30 text-center">
                BETON BRUTAL DATABASE
              </h1>
            </div>

            <div className="flex w-full drop-shadow-md justify-center">
              <Input
                className="text-2xl w-full sm:text-4xl md:w-2xl lg:w-4xl bg-white/10"
                placeholder="Search by name, author, id or url"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => handleEnterSearch(search, e)}
              />
              <Button
                className="text-3xl sm:text-4xl bg-white/10"
                onClick={() => handleSearch(search)}
              >SEARCH</Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 place-items-center w-full mt-16">
          <div className="w-full h-full mb-32">
            {collections.map((collection, i) => (
              <CollectionContainer collection={collection} key={i} />
            ))}
          </div>
          <div className="p-4 bg-black/70">
            <h1 className="w-fit text-center text-7xl text-[#ffd884] tracking-wider text-shadow-md">
              MAPS OF THE YEAR
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

        <div className="flex flex-col gap-4 place-items-center w-full mt-32">
          <div className="p-4 bg-black/70">
            <h1 className="w-fit text-center lg:text-left text-4xl text-[#ffd884] tracking-wider text-shadow-md">
              Want to see some other maps? Here are a couple of them
            </h1>
          </div>
          <div className="flex justify-center w-full">
            <div className="grid sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] auto-rows-[200px] lg:auto-rows-[300px] gap-6 p-6 w-full">
              {lastestMaps.map(m => (
                <MapTile key={m.id} {...m} />
              ))}
            </div>
          </div>
          <Button
            onClick={() => navigate("/workshop")}
          >DISCOVER ALL MAPS -&gt;</Button>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Main;