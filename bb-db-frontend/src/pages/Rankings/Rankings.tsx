import Header from "../../widgets/Header/Header";
import Container from "../../shared/Containter/Container";
import Background from "../../widgets/Background/Background";
import { useEffect, useState } from "react";
import clsx from "clsx";
import Footer from "../../widgets/Footer/Footer";
import { getBathReplays, getBdayReplays, getBrutalReplays } from "./requests";
import LeaderboardTable from "../../widgets/LeaderboardTable/LeaderboardTable";
import FuzzySearch from "fuzzy-search";
import Input from "../../shared/Input/Input";
import { getTargetData, getUser, setTargetData } from "../../store/store";
import { banReplay, deleteReplay } from "../../features/DataManager";
import ContextMenu from "../../shared/ContextMenu/ContextMenu";
import { t } from "i18next";
import { Keys } from "../../../i18n/keys";

const key = Keys.rankings;

const Rankings = () => {
  const [page, setPage] = useState<"TimeMS" | "TimeDLC1" | "TimeBirthday">(
    "TimeMS"
  );
  const [loaded, setLoaded] = useState(false);
  const [brutalReplays, setBrutalReplays] = useState<Replay[]>([]);
  const [bathReplays, setBathReplays] = useState<Replay[]>([]);
  const [bdayReplays, setBdayReplays] = useState<Replay[]>([]);
  const [searchText, setSearchText] = useState("");
  const [openCMenu, setOpenCMenu] = useState(false);
  const targetData = getTargetData();
  const user = getUser();

  const removeReplay = () => {
    if (!targetData) return;
    let items: Replay[] = [];

    switch (page) {
      case "TimeMS":
        items = [...brutalReplays.filter((item) => item.id !== targetData.id)];
        setBrutalReplays(items);
        break;
      case "TimeDLC1":
        items = [...bathReplays.filter((item) => item.id !== targetData.id)];
        setBathReplays(items);
        break;
      case "TimeBirthday":
        items = [...bdayReplays.filter((item) => item.id !== targetData.id)];
        setBdayReplays(items);
        break;
    }
  };

  const menuItems = [
    {
      name: t(key.delReplay, { player: targetData?.name }),
      onClick: () => {
        if (!targetData) return;

        removeReplay();
        deleteReplay(targetData.id);
      },
    },
    {
      name: t(key.banReplay, { player: targetData?.name }),
      onClick: () => {
        if (!targetData) return;

        removeReplay();
        banReplay(targetData.id);
      },
    },
  ];

  useEffect(() => {
    if (targetData) {
      setOpenCMenu(true);
    }
  }, [targetData]);

  const searcher = new FuzzySearch(
    (page === "TimeMS" && brutalReplays) ||
      (page === "TimeDLC1" && bathReplays) ||
      bdayReplays,
    ["place", "creator"],
    {}
  );

  const result = searcher.search(searchText);

  useEffect(() => {
    setLoaded(window && true);
    (async () => {
      setBrutalReplays(
        (await getBrutalReplays()).sort((a, b) => a.score - b.score)
      );
    })();
  }, []);

  if (!loaded) return;

  return (
    <div className="w-full min-h-screen h-full">
      <Background />
      {["moderator", "admin"].includes(user?.role as string) && (
        <ContextMenu
          menu={menuItems}
          open={openCMenu}
          setOpen={setOpenCMenu}
          onClose={() => setTargetData(null)}
        />
      )}
      <div className="fixed left-0 w-full z-50">
        <Header isAbsolute={true} />
      </div>

      <div className="flex flex-col h-full justify-between min-h-screen">
        <div className="flex gap-2 pt-32 w-full">
          <div className="w-full text-white text-center">
            <Container className="flex justify-center gap-10 text-4xl tracking-wide place-items-center">
              <div className="flex gap-10">
                <span
                  className={clsx(
                    "transition duration-300 cursor-pointer hover:text-pink",
                    page === "TimeMS" && "text-green"
                  )}
                  onClick={async () => {
                    setSearchText("");
                    if (brutalReplays.length === 0)
                      setBrutalReplays(
                        (await getBrutalReplays()).sort(
                          (a, b) => a.score - b.score
                        )
                      );
                    setPage("TimeMS");
                  }}
                >
                  BETON BRUTAL
                </span>
                <span
                  className={clsx(
                    "transition duration-300 cursor-pointer hover:text-pink",
                    page === "TimeDLC1" && "text-green"
                  )}
                  onClick={async () => {
                    setSearchText("");
                    if (bathReplays.length === 0)
                      setBathReplays(
                        (await getBathReplays()).sort(
                          (a, b) => a.score - b.score
                        )
                      );
                    setPage("TimeDLC1");
                  }}
                >
                  BETON BATH
                </span>
                <span
                  className={clsx(
                    "transition duration-300 cursor-pointer hover:text-pink",
                    page === "TimeBirthday" && "text-green"
                  )}
                  onClick={async () => {
                    setSearchText("");
                    if (bdayReplays.length === 0)
                      setBdayReplays(
                        (await getBdayReplays()).sort(
                          (a, b) => a.score - b.score
                        )
                      );
                    setPage("TimeBirthday");
                  }}
                >
                  BETON B-DAY
                </span>
              </div>
            </Container>
            <Container className="my-16 text-5xl md:text-8xl uppercase">
              {(page === "TimeMS" && t(key.bBrutal)) ||
                (page === "TimeDLC1" && t(key.bBath)) ||
                t(key.bBday)}
            </Container>
          </div>
        </div>
        <div className="px-4">
          <div className="flex flex-col w-full place-items-center">
            <Input
              placeholder={t(key.placeholder)}
              className="bg-white/10 text-xl w-full md:w-5xl mb-5"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <div className="w-full md:w-5xl mb-64">
              <LeaderboardTable replays={result} comment={t(key.lbComment).toUpperCase()} />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Rankings;
