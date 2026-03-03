import { useEffect, useState } from "react";
import { getActiveMap } from "../../../store/store";
import { getReplayById, getReplays } from "../requests";
import LeaderboardEntry from "../../../entities/LeaderboardEntry";
import Button from "../../../shared/Button/Button";
import clsx from "clsx";
import { banReplay, unbanReplay } from "../../../features/DataManager";

const ReplaysContainer = () => {
  const activeMap = getActiveMap();
  const [replays, setReplays] = useState<Replay[]>([]);

  useEffect(() => {
    if (activeMap) {
      (async () => {
        setReplays(
          (await getReplays(activeMap.steamId)).sort(
            (a, b) => a.score - b.score,
          ),
        );
      })();
    }
  }, [activeMap]);

  const handleBanButton = async (replay: Replay) => {
    console.log(replay.id);
    if (!replay.banned) {
      await banReplay(replay.id);
    } else {
      await unbanReplay(replay.id);
    }

    const updatedReplay: Replay = await getReplayById(replay.id);

    console.log(updatedReplay);

    setReplays(
      [updatedReplay, ...replays.filter((r) => r.id !== replay.id)].sort(
        (a, b) => a.score - b.score,
      ),
    );
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <h2 className="tracking-wider text-4xl text-white uppercase mb-4" id="replays">
        Replays:
      </h2>
      {replays.map((replay, i) => (
        <div key={i} className="flex w-full">
          <div className="flex-1">
            <LeaderboardEntry replay={replay} />
          </div>
          <Button
            className={clsx(
              "uppercase py-0 place-items-center duration-300 hover:text-white",
              replay.banned ? "hover:bg-green/50" : "hover:bg-red/50",
            )}
            onClick={async () => await handleBanButton(replay)}
          >
            {replay.banned ? "unban" : "ban"}
          </Button>
        </div>
      ))}
    </div>
  );
};

export default ReplaysContainer;
