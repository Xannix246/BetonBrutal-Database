import { useEffect, useState } from "react";
import clsx from "clsx";
import { t } from "i18next";
import {Modal } from "@shared";
import { TierLabel } from "@entities";
import { getColor, tiersLabels, tiersTooltips, Labels } from "@utils";
import { Keys } from "@locales/keys";

const key = Keys.mapTiers;

const RateTierModal = ({
  open,
  setOpen,
  currentTier,
  currentLabels,
  handleSubmit,
  bg,
  showLabels,
  customTitle,
}: {
  open: boolean;
  setOpen: (val: boolean) => void;
  currentTier?: number;
  currentLabels?: Labels[];
  handleSubmit: (tier: number, labels?: Labels[]) => void;
  bg?: "black" | "gray";
  showLabels?: boolean;
  customTitle?: string;
}) => {
  const [selectedLabels, setSelectedLabels] = useState<Labels[]>([]);
  const labels: Labels[] = [
    Labels.grapples,
    Labels.wallruns,
    Labels.trampolines,
    Labels.ice,
    Labels.nerveControl,
    Labels.xxl,
    Labels.coyotes,
    Labels.pfp,
    Labels.gimicky,
    Labels.puzzle,
    Labels.moving,
    Labels.showcase,
    Labels.overall,
    Labels.nonLinear,
    Labels.chockepoints,
    Labels.shitpost,
    Labels.bath,
    Labels.random,
    Labels.precision,
  ];
  const max = 13;

  useEffect(() => {
    setSelectedLabels(currentLabels ?? []);
  }, [currentLabels]);

  const handleChoise = (value: number) => {
    handleSubmit(value, selectedLabels);
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      className={clsx("backdrop-blur-xs")}
    >
      <div
        className={clsx(
          "p-5 md:p-10 w-full h-full flex flex-col gap-6 place-items-center max-w-5xl",
          bg !== "black" && "bg-white/10",
        )}
      >
        <h1 className="text-2xl md:text-4xl uppercase">{customTitle ?? t(key.rateMap)}</h1>

        <div className="flex gap-3 justify-items-center">
          {Array.from({ length: max }, (_, i) => {
            const value = i + -1;
            const color = getColor(value, max);

            return (
              <TierLabel
                key={value}
                icon={
                  <div
                    onClick={() => handleChoise(value)}
                    className={clsx(
                      "aspect-square w-14 flex items-center justify-center text-xl cursor-pointer transition duration-150",
                      value !== -1
                        ? "bg-[hsl(var(--h)_80_40)] hover:bg-[hsl(var(--h)_50_30)]"
                        : "bg-black hover:bg-gray-900",
                    )}
                    style={{
                      "--h": color[0],
                      boxShadow:
                        currentTier === value
                          ? `0 0 12px ${value !== -1 ? color[1] : "#fff"}`
                          : "none",
                    } as React.CSSProperties}
                  >
                    {value !== -1 ? value : "P/I"}
                  </div>
                }
                tooltip={t(tiersTooltips[`tier${value.toFixed(0)}`])}
                bgColor="black"
              />
            );
          })}
        </div>

        {showLabels && <div className="flex gap-3 justify-items-center w-full flex-wrap justify-center">
          {labels.map((label) => (
            <TierLabel
              key={label}
              icon={
                <div
                  className={clsx(
                    "cursor-pointer transition duration-150",
                    selectedLabels.includes(label)
                      ? "bg-white/30"
                      : "bg-white/10 hover:bg-white/20",
                  )}
                  onClick={() =>
                    setSelectedLabels((prev) =>
                      prev.includes(label)
                        ? [...prev.filter((l) => l !== label)]
                        : [...prev, label],
                    )
                  }
                >
                  {tiersLabels[label].icon}
                </div>
              }
              tooltip={t(tiersLabels[label].tooltip)}
              bgColor="black"
            />
          ))}
        </div>}

        {currentTier !== undefined && (
          <div className="text-center text-gray-300 text-2xl">
            {t(key.selected)} <span className="text-2xl">{currentTier}</span>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default RateTierModal;
