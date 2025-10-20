import { navigate } from "vike/client/router";
import Container from "../shared/Containter/Container";
import { $prevLink } from "../store/store";
import { useEffect, useState } from "react";

type Props = {
  replay: Replay;
};

function formatTime(score: number): string {
  const seconds = score / 100;
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes % 60).padStart(2, "0")}:${remainingSeconds
      .toFixed(2)
      .padStart(5, "0")}`;
  } else {
    return `${minutes}:${remainingSeconds.toFixed(2).padStart(5, "0")}`;
  }
}

const LeaderboardEntry = ({ replay }: Props) => {
  const [useMap, setUseMap] = useState(false);

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
  }

  useEffect(() => {
    if (window.location.pathname.includes("player")) setUseMap(true);
    // setPosition(place);
  }, []);
  
  return (
    <Container className="sm:mx-2 tracking-wider hover:bg-[#1f1f1f] transition">
      <div className="flex items-center justify-between text-[#f1e4c7] gap-4">
        <h3 className="text-sm md:text-xl text-center md:w-[40px] shrink-0">{replay.place}</h3>
        <h3
          className="flex-grow w-full text-sm md:text-xl truncate text-ellipsis whitespace-nowrap font-semibold max-w-[50%] hover:underline cursor-pointer hover:text-white transition duration-300"
          onClick={() => {
            $prevLink.set("run");
            if (useMap) {
              navigate(`/workshop/${replay.mapId}`)
            } else {
              navigate(`/workshop/player/${replay.creatorId}`)
            }
          }}
          style={{
            fontSize: "clamp(0.75rem, 1.5vw, 1.25rem)",
          }}
        >
          {(useMap ? (isOfficialMap().length > 0 ? isOfficialMap() : replay.map || "unknown map" ) : replay.creator).toUpperCase()}
        </h3>
        <h3 className="text-sm md:text-xl text-right md:w-[100px] shrink-0">
          {formatTime(replay.score)}
        </h3>
        {replay.date && new Date(replay.date).getFullYear() >= 2023 ? (
          <h3 className="text-gray-400 text-sm w-[110px] shrink-0 text-right">
            {new Date(replay.date).toLocaleDateString()}{" "}
            {new Date(replay.date).toLocaleTimeString()}
          </h3>
        ) : (
          <h3 className="text-gray-400 text-sm text-right w-[110px] shrink-0">N/A</h3>
        )}
      </div>
    </Container>

  );
};

export default LeaderboardEntry;
