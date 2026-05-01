import { useEffect, useState } from "react";
import { getActiveMap } from "../../../store/store";
import Button from "../../../shared/Button/Button";
import { getItems, getTierVoteRequests, updateTierEntry } from "../requests";
import TierCard from "../../../entities/TierCard";
import { AnimatePresence, motion } from "motion/react";

const TiersContainer = ({ mapId }: { mapId?: string }) => {
  const [entries, setEntries] = useState<TierEntry[]>([]);
  const [items, setItems] = useState<Record<string, string>[]>([]);

  useEffect(() => {
    (async () => {
      const entries = await getTierVoteRequests(mapId);
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
    <div className="flex flex-col gap-2 w-full mb-32">
      <h2 className="tracking-wider text-4xl text-white uppercase mb-4" id="tier">
        Tier vote requests:
      </h2>
      <AnimatePresence mode="popLayout">
        {entries.map((entry, i) => (
          <motion.div
            layout
            className="flex w-full"
            key={entry.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
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
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default TiersContainer;
