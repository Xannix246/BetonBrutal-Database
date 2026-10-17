import { useState, useMemo, useEffect } from "react";
import clsx from "clsx";
import { t } from "i18next";
import { Container } from "@shared";
import { LeaderboardEntry } from "@entities";
import { Keys } from "@locales/keys";
import { isClassic } from "@utils";

type Props = {
  replays: Replay[];
  comment?: string;
};

type SortKey = "score" | "creator" | "date" | "place";

const key = Keys.leaderboard;

const LeaderboardTable = ({
  replays,
  comment = t(key.defaultComment),
}: Props) => {
  const [sortKey, setSortKey] = useState<SortKey>("place");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [useMap, setUseMap] = useState(false);
  const [filtredReplays, setFiltredReplays] = useState<Replay[]>([]);

  useEffect(() => {
    if (window.location.pathname.includes("player")) {
      setUseMap(true);
      setFiltredReplays(replays);
    } else {
      const sorted = [...replays]
        .sort((a, b) => a.score - b.score)
        .map((replay, i) => ({
          ...replay,
          place: i + 1,
        }));

      setFiltredReplays(sorted);
    }
  }, [replays]);

  const sortedReplays = useMemo(() => {
    const sorted = [...filtredReplays].sort((a, b) => {
      switch (sortKey) {
        case "creator":
          return a.creator.localeCompare(b.creator);
        case "date":
          return (
            new Date(a.date ?? 0).getTime() - new Date(b.date ?? 0).getTime()
          );
        case "place":
          return a.place - b.place;
        case "score":
        default:
          return a.score - b.score;
      }
    });
    return sortOrder === "asc" ? sorted : sorted.reverse();
  }, [filtredReplays, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className={clsx("flex flex-col w-full",
      !isClassic() && "uppercase gap-2"
    )}>
      <Container className={clsx(
        isClassic()
          ? "p-2 !bg-transparent"
          : "flex justify-between items-center"
      )}>
        <h2 className={clsx(
          isClassic()
            ? "font-bold"
            : "text-white tracking-wider text-xl"
        )}>{t("leaderboard.title")}</h2>
      </Container>

      <Container className={clsx(
        isClassic()
          ? "!bg-transparent px-6 pt-2"
          : "sm:mx-2 px-6 text-white font-semibold"
      )}>
        <div className={clsx("flex items-center justify-between",
          isClassic()
            ? "gap-4"
            : "text-xl gap-4"
        )}>
          <span
            className={clsx("cursor-pointer",
              isClassic()
              ? "w-[140px]"
              : "w-[120px] transition duration-300",
              sortKey === "place" && "text-green",
            )}
            onClick={() => handleSort("place")}
          >
            #
          </span>
          <span
            className={clsx("w-full cursor-pointer",
              !isClassic() && "transition duration-300",
              sortKey === "creator" && "text-green",
            )}
            onClick={() => handleSort("creator")}
          >
            {useMap ? t(key.map) : t(key.player)}
          </span>
          <span
            className={clsx("w-[150px] cursor-pointer",
              isClassic()
                ? "w-[200px]"
                : "transition duration-300",
              sortKey === "score" && "text-green",
            )}
            onClick={() => handleSort("score")}
          >
            {t(key.time)}
          </span>
          <span
            className={clsx("cursor-pointer",
              isClassic()
                ? "w-[100px]"
                : "w-[150px] transition duration-300",
              sortKey === "date" && "text-green",
            )}
            onClick={() => handleSort("date")}
          >
            {t(key.date)}
          </span>
        </div>
      </Container>

      {sortedReplays.map((replay, i) => (
        <LeaderboardEntry replay={replay} key={i} />
      ))}

      {filtredReplays.length === 0 && (
        <Container className="sm:mx-2">
          <h2 className="text-[#f1e4c7] tracking-wider text-xl text-center uppercase">
            {comment}
          </h2>
        </Container>
      )}
    </div>
  );
};

export default LeaderboardTable;
