import { useEffect, useState } from "react";
import { getActiveMap } from "../../../store/store";
import Button from "../../../shared/Button/Button";
import { getItems, getTierVoteRequests, updateTierEntry } from "../requests";
import TierCard from "../../../entities/TierCard";

const TiersContainer = ({ mapId }: { mapId?: string }) => {
  const [entries, setEntries] = useState<TierEntry[]>([]);
  const [items, setItems] = useState<Record<string, string>[]>([]);

  useEffect(() => {
    console.log(mapId);
    (async () => {
      const entries = await getTierVoteRequests(mapId);
      console.log(entries)
      const items = await getItems(entries.map((entry) => entry.mapId));
      setEntries(entries);
      setItems(items.map((item) => ({ id: item.id, title: item.title })));
    })();
  }, [mapId]);

  const handleApprove = async (entry: TierEntry, type: "accepted" | "denied") => {
    const moderatedEntry = await updateTierEntry(entry, type);

    setEntries(entries.filter((entry) => entry.id !== moderatedEntry.id));
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <h2 className="tracking-wider text-4xl text-white uppercase mb-4" id="tier">
        Tier vote requests:
      </h2>
      {entries.map((entry, i) => (
        <div className="flex w-full" key={i}>
          <TierCard 
            entry={entry}
            mapName={items.find((item) => item.id === entry.mapId)?.title || "Unknown"}
          />
          <Button
            className="uppercase p-2 place-items-center duration-150 text-white hover:bg-green/50 w-25"
            onClick={() => handleApprove(entry, "accepted")}
          >
            Accept
          </Button>
          <Button
            className="uppercase p-2 place-items-center duration-150 text-white hover:bg-red/50 w-25"
            onClick={() => handleApprove(entry, "denied")}
          >
            Deny
          </Button>
        </div>
      ))}
    </div>
  );
};

export default TiersContainer;
