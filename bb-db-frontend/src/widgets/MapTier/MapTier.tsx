import Container from "../../shared/Containter/Container";
import { PiArrowsCounterClockwise } from "react-icons/pi";
import TierLabel from "../../entities/TierLabel";
import RateTierModal from "../../features/RateTierModal";
import { useState } from "react";
import { getColor } from "../../features/GetColor";
import clsx from "clsx";
import { submitTierVote, updateTierVote } from "./requests";

const MapTier = ({ tierData, userVote }: { tierData: TierData, userVote?: TierEntry }) => {
  const [open, setOpen] = useState(false);
  const color = getColor(tierData.avgTier, 10);

  const handleSubmit = (tier: number) => {
    if (userVote) {
      updateTierVote(tierData.mapId, tier)
    } else {
      submitTierVote(tierData.mapId, tier);
    }
  }

  return (
    <Container className="w-full md:min-w-18 md:w-18 text-white flex md:flex-col gap-4 place-items-center justify-center md:justify-start h-fit md:h-fit md:min-h-146">
      <TierLabel
        icon={
          <div
            className={clsx(
              "aspect-square w-12 h-auto flex justify-center place-items-center text-4xl cursor-pointer",
              tierData.modTier === -1 ? "bg-black" : "bg-[hsl(var(--h)_80_40)]/90 "
            )}
            style={{
                "--h": color[0],
              } as React.CSSProperties}
            onClick={() => setOpen(true)}
          >
            {tierData.modTier === -1 ? "P/I" : tierData.avgTier.toFixed(0)}
          </div>
        }
        tooltip={`Average score: ${tierData.avgTier} \n Default score: ${tierData.modTier}`}
      />
      {tierData.labels.map((label) => (
        <TierLabel
          icon={<PiArrowsCounterClockwise className="w-12 h-auto bg-green/40"/>}
          tooltip={`Requires pixel perfect jumps knowledge | ${label}`}
        />
        // will be edited, just as template for now
      ))}
      <RateTierModal open={open} setOpen={setOpen} handleSubmit={handleSubmit} currentTier={userVote?.tier}/>
    </Container>
  );
};

export default MapTier;
