import { useEffect, useState } from "react";
import Footer from "../../widgets/Footer/Footer";
import Header from "../../widgets/Header/Header";
import Background from "../../widgets/Background/Background";
import TierCard from "../../entities/TierCard";
import { getItems, getTierVoteRequests } from "./requests";
import { getUser } from "../../store/store";
import { navigate } from "vike/client/router";
import { Keys } from "../../../i18n/keys";
import { t } from "i18next";

const key = Keys.mapTiers;

const VotesPage = ({ id }: { id: string }) => {
  const [hydrated, setHydrated] = useState(false);
  const [entries, setEntries] = useState<TierEntry[]>([]);
  const [items, setItems] = useState<Record<string, string>[]>([]);
  const user = getUser();

  useEffect(() => {
    if (user?.id !== id) navigate("/");
    setHydrated(window && true);

    (async () => {
      const entries = await getTierVoteRequests(id);
      const items = await getItems(entries.map((entry) => entry.mapId));
      setEntries(entries);
      setItems(items.map((item) => ({ id: item.id, title: item.title })));
    })();
  }, []);

  if (!hydrated) return;

  return (
    <div className="w-full min-h-screen h-full">
      <Background />
      <div className="fixed left-0 w-full z-50">
        <Header isAbsolute={true} />
      </div>

      <div className="flex flex-col min-h-screen justify-between place-items-center ">
        <div className="flex flex-col gap-16 w-5xl pt-32">
          <h1 className="tracking-wider text-6xl text-white uppercase w-full text-center">
            {t(key.votes)}
          </h1>

          <div className="flex flex-col gap-2 w-full">
            {entries.map((entry, i) => (
              <div className="flex w-full" key={entry.id} >
                <TierCard 
                  entry={entry}
                  mapName={items.find((item) => item.id === entry.mapId)?.title || "Unknown"}
                />
              </div>
            ))}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default VotesPage;
