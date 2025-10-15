import { useState, useMemo, useEffect } from "react";
import LeaderboardEntry from "../../entities/LeaderboardEntry";
import Container from "../../shared/Containter/Container";
import clsx from "clsx";

type Props = {
  replays: Replay[];
};

type SortKey = "score" | "creator" | "date";

const LeaderboardTable = ({ replays }: Props) => {
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [useMap, setUseMap] = useState(false);

  useEffect(() => {
    if (window.location.pathname.includes("player")) setUseMap(true);
  }, []);

  const sortedReplays = useMemo(() => {
    const sorted = [...replays].sort((a, b) => {
      switch (sortKey) {
        case "creator":
          return a.creator.localeCompare(b.creator);
        case "date":
          return new Date(a.date ?? 0).getTime() - new Date(b.date ?? 0).getTime();
        case "score":
        default:
          return a.score - b.score;
      }
    });
    return sortOrder === "asc" ? sorted : sorted.reverse();
  }, [replays, sortKey, sortOrder]);

  const ranks = useMemo(() => {
    const sortedByScore = [...replays].sort((a, b) => a.score - b.score);
    return new Map(sortedByScore.map((r, i) => [r.id, i + 1]));
  }, [replays]);

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

      <Container className="mx-2 px-6 text-white font-semibold">
        <div className="flex items-center justify-between text-lg gap-4">
          <span
            className={clsx("w-[120px] transition duration-300 cursor-pointer", sortKey === "score" && "text-green")}
            onClick={() => handleSort("score")}
          >#</span>
          <span
            className={clsx("w-full transition duration-300 cursor-pointer", sortKey === "creator" && "text-green")}
            onClick={() => handleSort("creator")}
          >{useMap ? "Map" : "Player"}</span>
          <span
            className={clsx("w-[150px] transition duration-300 cursor-pointer", sortKey === "score" && "text-green")}
            onClick={() => handleSort("score")}
          >Time</span>
          <span
            className={clsx("w-[150px] transition duration-300 cursor-pointer", sortKey === "date" && "text-green")}
            onClick={() => handleSort("date")}
          >Date</span>
        </div>
      </Container>

      {sortedReplays.map((replay) => (
        <LeaderboardEntry
          key={replay.id}
          place={ranks.get(replay.id) ?? 0}
          replay={replay}
        />
      ))}
    </div>
  );
};

export default LeaderboardTable;
