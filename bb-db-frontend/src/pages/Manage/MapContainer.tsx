import { useEffect, useState } from "react";
import { handleSearch } from "../../features/SearchManager";
import { getMaps } from "./requests";

const MapTile = (map: WorkshopItem) => {
  return (
    <div className="relative col-span-1 row-span-1 bg-black/80 p-2">
      <img 
        src={map.previewUrl} 
        alt={map.title} 
        className="absolute inset-0 h-full w-full object-cover"
      />
      <h4>{map.title}</h4>
    </div>
  );
}

const MapContainer = () => {
  const [maps, setMaps] = useState<WorkshopItem[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      setMaps(await getMaps("newest", 50, 1));
    })();
  }, []);

  const onSearch = async () => {
    const data = await handleSearch(search, true);
    if (data) setMaps(data);
  }

  return (
    <div>

    </div>
  );
};

export default MapContainer;
