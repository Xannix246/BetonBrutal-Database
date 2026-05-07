import Container from "../../shared/Containter/Container";
import { PiArrowsCounterClockwise } from "react-icons/pi";
import TierLabel from "../../entities/TierLabel";
import RateTierModal from "../../features/RateTierModal";
import { useState } from "react";
import { getColor } from "../../features/GetColor";
import clsx from "clsx";
import { submitTierVote, updateTierVote } from "./requests";
import { getUser } from "../../store/store";
import { tiersLabels, tiersTooltips } from "./data";
import { Keys } from "../../../i18n/keys";
import { t } from "i18next";

const key = Keys.mapTiers;

const MapTier = ({ tierData, userVote }: { tierData: TierData, userVote?: TierEntry }) => {
  const user = getUser();
  const [open, setOpen] = useState(false);
  const color = getColor(tierData.avgTier, 13);

  const handleSubmit = (tier: number) => {
    if (userVote) {
      updateTierVote(tierData.mapId, tier)
    } else {
      submitTierVote(tierData.mapId, tier);
    }
  }

  return (
    <Container className="w-full md:min-w-18 md:w-18 text-white flex flex-wrap md:flex-nowrap md:flex-col gap-2 place-items-center justify-center md:justify-start h-fit md:h-fit md:min-h-146">
      <TierLabel
        icon={
          <div
            className={clsx(
              "aspect-square w-14 h-auto flex justify-center place-items-center text-4xl",
              tierData.modTier === -1 ? "bg-black" : "bg-[hsl(var(--h)_80_40)]/90 ",
              user && "cursor-pointer",
            )}
            style={{
                "--h": color[0],
              } as React.CSSProperties}
            onClick={() => setOpen(true)}
          >
            {tierData.modTier === -1 ? "P/I" : tierData.avgTier.toFixed(0)}
          </div>
        }
        tooltip={t(key.tierTooltip, {
          avgTier: tierData.avgTier.toFixed(1),
          modTier: tierData.modTier,
          tooltip: tiersTooltips[`tier${tierData.avgTier.toFixed(0)}`],
        })}
      />
      {tierData.labels.map((label) => (
        <div className={tiersLabels[label].color}>
          <TierLabel
            icon={tiersLabels[label].icon}
            tooltip={tiersLabels[label].tooltip}
          />
        </div>
      ))}
      {user && <RateTierModal open={open} setOpen={setOpen} handleSubmit={handleSubmit} currentTier={userVote?.tier}/>}
    </Container>
  );
};

export default MapTier;
