import { useState, useMemo, useEffect } from "react";
import LeaderboardEntry from "../../entities/LeaderboardEntry";
import Container from "../../shared/Containter/Container";
import clsx from "clsx";

type Props = {
  replays: Replay[];
  comment?: string;
};

type SortKey = "score" | "creator" | "date" | "place";

const LeaderboardTable = ({
  replays,
  comment = "NO ONE HAS COMPLETED THIS MAP YET...",
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
      setFiltredReplays(
        replays
          .sort((a, b) => a.score - b.score)
          .map((replay, i) => ((replay.place = i + 1), replay)),
      );
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
    <div className="flex flex-col gap-2 w-full">
      <Container className="flex justify-between items-center">
        <h2 className="text-white tracking-wider text-xl">LEADERBOARD</h2>
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
            {useMap ? "Map" : "Player"}
          </span>
          <span
            className={clsx(
              "w-[150px] transition duration-300 cursor-pointer",
              sortKey === "score" && "text-green",
            )}
            onClick={() => handleSort("score")}
          >
            Time
          </span>
          <span
            className={clsx(
              "w-[150px] transition duration-300 cursor-pointer",
              sortKey === "date" && "text-green",
            )}
            onClick={() => handleSort("date")}
          >
            Date
          </span>
        </div>
      </Container>

      {sortedReplays.map((replay) => (
        <LeaderboardEntry key={replay.id} replay={replay} />
      ))}

      {filtredReplays.length === 0 && (
        <Container className="sm:mx-2">
          <h2 className="text-[#f1e4c7] tracking-wider text-xl text-center">
            {comment}
          </h2>
        </Container>
      )}
    </div>
  );
};

export default LeaderboardTable;
