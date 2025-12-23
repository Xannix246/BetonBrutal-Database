import { useEffect, useState } from "react";
import { getMaps } from "./requests";
import MapCard from "../../entities/MapCard";
import clsx from "clsx";
import MapTile from "../../entities/MapTile";

const CollectionContainer = ({ collection }: { collection: Collection }) => {
  const [maps, setMaps] = useState<WorkshopItem[]>([]);

  useEffect(() => {
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
      <div className="p-4 bg-black/70 w-fit">
        <h1 className="text-center text-7xl text-[#ffd884] tracking-wider text-shadow-md">
          {collection.title.toUpperCase()}
        </h1>
      </div>
      {collection.description && <div className={clsx("p-4 w-full", getColorClassName())}>
        <h1 className="text-center text-5xl tracking-wider text-shadow-md">
          {collection.description.toUpperCase()}
        </h1>
      </div>}
      <div className={clsx(
        "justify-center gap-8 w-full overflow-clip",
        maps.length <= 3 && "flex flex-col lg:flex-row h-156 lg:h-196",
        maps.length > 3 && maps.length <= 6 && "flex flex-wrap justify-center max-w-[1400px] mx-auto h-306",
        maps.length > 6 && "grid sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] auto-rows-[200px] lg:auto-rows-[300px]"
      )}>
        {maps.map((map) => (
          maps.length < 6 ?
            <MapCard
              id={map.id}
              title={map.title}
              preview={map.previewUrl}
              previews={map.previews}
              key={map.id}
            />
            :
            <MapTile key={map.id} {...map} />
        ))}
      </div>
    </div>
  );
}

export default CollectionContainer;