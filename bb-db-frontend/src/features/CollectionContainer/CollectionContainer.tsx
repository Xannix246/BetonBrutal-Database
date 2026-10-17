import { useEffect, useState } from "react";
import clsx from "clsx";
import { MapCard, MapTile } from "@entities";
import { isClassic } from "@utils";
import { getMaps } from "./requests";

const CollectionContainer = ({ collection }: { collection: Collection }) => {
  const [maps, setMaps] = useState<WorkshopItemHeader[]>([]);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(window.innerWidth);

    (async () => {
      setMaps(await getMaps(collection.mapsId));
    })();
  }, []);

  const getColorClassName = () => {
    switch (collection.descColor) {
      case "white":
        return "text-black bg-white/70";
      case "red":
        return "text-white bg-red/70";
      case "blue":
        return "text-white bg-blue/70";
      case "green":
        return "text-white bg-green/70";
      case "yellow":
        return "text-black bg-yellow/70";
      case "black":
      default:
        return "text-white bg-black/70";
    }
  }

  return (
    <div className="flex flex-col w-full px-4 place-items-center gap-4">
      <div
        className={clsx(
          isClassic()
            ? "w-full p-6 text-classic-blue-500"
            : "p-4 bg-black/70 w-fit",
        )}>
        <h1
          className={clsx(
            isClassic()
              ? "text-2xl font-bold"
              : "text-center text-7xl text-[#ffd884] tracking-wider text-shadow-md",
          )}>
          {collection.title}
        </h1>
        {isClassic() && <h2 className="text-black p-2 border-b-1 border-classic-blue-500">
          {collection.description}
        </h2>}
      </div>
      {collection.description && !isClassic() && <div className={clsx("p-4 w-full", getColorClassName())}>
        <h2 className="text-center text-5xl tracking-wider text-shadow-md">
          {collection.description.toUpperCase()}
        </h2>
      </div>}
      <div className={clsx(
        isClassic() && "!gap-4 !flex !flex-col",
        "justify-center gap-8 w-full",
        maps.length <= 3 && "flex flex-col lg:flex-row h-156 lg:h-196 overflow-clip",
        maps.length > 3 && maps.length <= 6 && "flex flex-wrap justify-center max-w-[1400px] mx-auto",
        maps.length > 6 && "flex flex-col sm:grid sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] auto-rows-[200px] lg:auto-rows-[300px]"
      )}>
        {maps.map((map) => (
          maps.length <= 6 ?
            <MapCard
              id={map.id}
              title={map.title}
              preview={map.previewUrl}
              previews={map.previews}
              key={map.id}
            />
            :
            <MapTile key={map.id} item={map} disableSizeClass={width < 640} />
        ))}
      </div>
    </div>
  );
}

export default CollectionContainer;