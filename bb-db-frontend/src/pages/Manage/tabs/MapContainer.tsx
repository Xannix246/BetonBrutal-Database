import { useEffect, useState } from "react";
import { handleSearch } from "../../../features/SearchManager";
import Input from "../../../shared/Input/Input";
import List from "../../../shared/List/List";
import { setActiveMap } from "../../../store/store";

const MapContainer = () => {
  const [maps, setMaps] = useState<WorkshopItem[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMaps([]);

    const timer = setTimeout(async () => {
      if (!search.trim()) {
        return;
      }

      const data = await handleSearch(search, true);
      if (data) setMaps(data);
    }, 1000);

    return () => clearTimeout(timer);
  }, [search]);

  const onItemClick = (item: WorkshopItem) => {
    setActiveMap(item);
    setSearch("");
    setMaps([]);
  };

  return (
    <div>
      <h1 className="tracking-wider text-6xl text-white uppercase" id="maps">
        Select a map you want to manage
      </h1>
      <div>
        <Input
          className="text-2xl w-full bg-black/80"
          placeholder="Search by name, author, id or url"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {maps.length > 0 && (
          <List
            data={maps}
            displayData={(map) => map.title}
            onItemClick={onItemClick}
          />
        )}
      </div>
    </div>
  );
};

export default MapContainer;
