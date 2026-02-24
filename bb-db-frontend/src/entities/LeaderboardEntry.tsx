import formatTime from "../features/FormatTime";
import Container from "../shared/Containter/Container";
import { $prevLink, getUser, setTargetData } from "../store/store";
import { useEffect, useState } from "react";

type Props = {
  replay: Replay;
};

const LeaderboardEntry = ({ replay }: Props) => {
  const [useMap, setUseMap] = useState(false);
  const user = getUser();

  const isOfficialMap = () => {
    switch (replay.mapId) {
      case "TimeMS":
        return "BETON BRUTAL";
      case "TimeDLC1":
        return "BETON BATH";
      case "TimeBirthday":
        return "BETON B-DAY";
      default:
        return "";
    }
  };

  useEffect(() => {
    if (window.location.pathname.includes("player")) setUseMap(true);
    // setPosition(place);
  }, []);

  return (
    <Container
      className="sm:mx-2 tracking-wider hover:bg-[#1f1f1f] transition"
      onContextMenu={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        if (["moderator", "admin"].includes(user?.role as string)) {
          e.preventDefault();
          setTargetData({ id: replay.id as string, name: replay.creator });
        }
      }}
    >
      <div className="flex items-center justify-between text-[#f1e4c7] gap-4">
        <h3 className="text-sm md:text-xl text-center md:w-[40px] shrink-0">
          {replay.place}
        </h3>
        <a
          className="flex-grow w-full text-sm md:text-xl truncate text-ellipsis whitespace-nowrap font-semibold max-w-[50%] hover:underline cursor-pointer hover:text-white transition duration-300"
          onClick={() => $prevLink.set("run")}
          onPointerDown={() => $prevLink.set("run")}
          href={
            useMap
              ? `/workshop/${replay.mapId}`
              : `/workshop/player/${replay.creatorId}`
          }
          style={{
            fontSize: "clamp(0.75rem, 1.5vw, 1.25rem)",
          }}
        >
          {(useMap
            ? isOfficialMap().length > 0
              ? isOfficialMap()
              : replay.map || "unknown map"
            : replay.creator
          ).toUpperCase()}
        </a>
        <h3 className="text-sm md:text-xl text-right md:w-[100px] shrink-0">
          {formatTime(replay.score)}
        </h3>
        {replay.date && new Date(replay.date).getFullYear() >= 2023 ? (
          <h3 className="text-gray-400 text-sm w-[110px] shrink-0 text-right">
            {new Date(replay.date).toLocaleDateString()}{" "}
            {new Date(replay.date).toLocaleTimeString()}
          </h3>
        ) : (
          <h3 className="text-gray-400 text-sm text-right w-[110px] shrink-0">
            N/A
          </h3>
        )}
      </div>
    </Container>
  );
};

export default LeaderboardEntry;
