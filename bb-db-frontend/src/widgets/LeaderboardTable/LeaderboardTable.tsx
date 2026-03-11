import { useState, useMemo, useEffect } from "react";
import LeaderboardEntry from "../../entities/LeaderboardEntry";
import Container from "../../shared/Containter/Container";
// import { List, RowComponentProps } from "react-window";
import clsx from "clsx";
import { t } from "i18next";
import { Keys } from "../../../i18n/keys";

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
    <div className="flex flex-col gap-2 w-full uppercase">
      <Container className="flex justify-between items-center">
        <h2 className="text-white tracking-wider text-xl">{t("leaderboard.title")}</h2>
      </Container>

      <Container className="sm:mx-2 px-6 text-white font-semibold">
        <div className="flex items-center justify-between text-xl gap-4">
          <span
            className={clsx(
              "w-[120px] transition duration-300 cursor-pointer",
              sortKey === "place" && "text-green",
            )}
            onClick={() => handleSort("place")}
          >
            #
          </span>
          <span
            className={clsx(
              "w-full transition duration-300 cursor-pointer",
              sortKey === "creator" && "text-green",
            )}
            onClick={() => handleSort("creator")}
          >
            {useMap ? t(key.map) : t(key.player)}
          </span>
          <span
            className={clsx(
              "w-[150px] transition duration-300 cursor-pointer",
              sortKey === "score" && "text-green",
            )}
            onClick={() => handleSort("score")}
          >
            {t(key.time)}
          </span>
          <span
            className={clsx(
              "w-[150px] transition duration-300 cursor-pointer",
              sortKey === "date" && "text-green",
            )}
            onClick={() => handleSort("date")}
          >
            {t(key.date)}
          </span>
        </div>
      </Container>

      {/* <List
        rowComponent={Row}
        rowCount={sortedReplays.length}
        rowHeight={68}
        rowProps={{
          replays: sortedReplays,
        }}
      /> */}

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

// const Row = ({
//   index,
//   replays,
//   style,
// }: RowComponentProps<{
//   replays: Replay[];
// }>) => {
//   const replay = replays[index];

//   return (
//     <div style={style}>
//       <LeaderboardEntry replay={replay} />
//     </div>
//   );
// };

export default LeaderboardTable;
