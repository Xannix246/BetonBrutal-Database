import clsx from "clsx";
import Modal from "../shared/Modal/Modal";
import TierLabel from "../entities/TierLabel";
import { getColor } from "./GetColor";

const RateTierModal = ({
  open,
  setOpen,
  currentTier,
  handleSubmit,
  bg,
}: {
  open: boolean;
  setOpen: (val: boolean) => void;
  currentTier?: number;
  handleSubmit: (tier: number, labels?: Labels[]) => void;
  bg?: "black" | "gray";
}) => {
  const max = 12;

  const handleChoise = (value: number) => {
    handleSubmit(value);
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      className={clsx("backdrop-blur-xs")}
    >
      <div className={clsx(
          "p-5 md:p-10 w-full h-full flex flex-col gap-6",
          bg !== "black" && "bg-white/10"
        )}>
        <h1 className="text-2xl md:text-4xl uppercase text-center">Rate map</h1>

        <div className="flex gap-3 justify-items-center">
          {Array.from({ length: max }, (_, i) => {
            const value = i + -1;
            const color = getColor(value, max);

            return (
              <TierLabel
                icon={
                  <div
                    key={value}
                    onClick={() => handleChoise(value)}
                    className={clsx(
                      "aspect-square w-14 flex items-center justify-center text-xl cursor-pointer transition duration-150",
                      value !== -1
                        ? "bg-[hsl(var(--h)_80_40)] hover:bg-[hsl(var(--h)_50_30)]"
                        : "bg-black hover:bg-gray-900"
                    )}
                    style={
                      {
                        "--h": color[0],
                        boxShadow:
                          currentTier === value ? `0 0 12px ${value !== -1 ? color[1] : "#fff"}` : "none",
                      } as React.CSSProperties
                    }
                  >
                    {value !== -1 ? value : "P/I"}
                  </div>
                }
                tooltip="This tooltip will contain some information about tier"
                bgColor="black"
              />
            );
          })}
        </div>

        {currentTier && (
          <div className="text-center text-gray-300 text-2xl">
            Selected rating: <span className="text-2xl">{currentTier}</span>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default RateTierModal;
