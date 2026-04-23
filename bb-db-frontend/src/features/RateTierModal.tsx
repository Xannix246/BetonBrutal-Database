import clsx from "clsx";
import Modal from "../shared/Modal/Modal";
import { useState } from "react";
import TierLabel from "../entities/TierLabel";
import { getColor } from "./GetColor";

const RateTierModal = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (val: boolean) => void;
}) => {
  const [selected, setSelected] = useState<number | null>(null);

  const max = 10;

  const handleChoise = (value: number) => {
    setSelected(value);
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      className="w-3xl"
    >
      <div className="bg-white/10 p-5 md:p-10 w-full h-full flex flex-col gap-6">
        <h1 className="text-2xl md:text-4xl uppercase text-center">Rate map</h1>

        <div className="flex gap-3 justify-items-center">
          {Array.from({ length: max }, (_, i) => {
            const value = i + 1;
            const color = getColor(value, max);

            return (
              <TierLabel
                icon={
                  <div
                    key={value}
                    onClick={() => handleChoise(value)}
                    className={clsx(
                      "aspect-square w-14 flex items-center justify-center text-xl cursor-pointer",
                      `bg-[hsl(var(--h)_80_40)] hover:bg-[hsl(var(--h)_50_30)] transition duration-150`,
                    )}
                    style={
                      {
                        "--h": color[0],
                        boxShadow:
                          selected === value ? `0 0 12px ${color[1]}` : "none",
                      } as React.CSSProperties
                    }
                  >
                    {value}
                  </div>
                }
                tooltip="This tooltip will contain some information about tier"
                bgColor="black"
              />
            );
          })}
        </div>

        {selected && (
          <div className="text-center text-gray-300 text-2xl">
            Selected rating: <span className="text-2xl">{selected}</span>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default RateTierModal;
