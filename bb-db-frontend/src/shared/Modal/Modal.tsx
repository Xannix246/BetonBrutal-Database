import { Dialog, DialogPanel } from "@headlessui/react";
import clsx from "clsx";
import { motion } from "motion/react";
import { isClassic } from "@utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
  open: boolean;
};

const Modal = ({ children, className, open, onClose }: Props) => {
  const classic = isClassic();

  return (
    <Dialog open={open} onClose={() => onClose?.()} className="relative z-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={clsx(
          "fixed inset-0",
          classic ? "bg-black/20 backdrop-grayscale" : "backdrop-blur-[2px]",
        )}
        aria-hidden="true"
      />

      <motion.div
        className="fixed inset-0 flex w-screen items-center justify-center overflow-y-auto p-4"
        initial={{ opacity: 0, scale: classic ? 1 : 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: classic ? 1 : 0.98 }}
        transition={{ ease: "backInOut", duration: 0.2 }}
      >
        <DialogPanel
          className={clsx(
            "m-4 max-w-full",
            classic
              ? [
                  "relative border-2 border-classic-blue-400",
                  "bg-[#f0f0f0] text-[#111111]",
                  "drop-shadow-[3px_3px_1px_rgba(0,0,0,0.25)]",
                  "rounded-lg",
                ]
              : "bg-black/70 text-white",
            className,
          )}
        >
          {classic && (
            <div className="flex min-h-8 items-center gap-2 border-b border-[#1746a2] bg-gradient-to-t from-[#245edb] via-[#3977e8] to-[#6b9af0] px-2 py-1 text-white rounded-t-[5px]">
              <span className="min-w-0 flex-1 truncate text-sm font-bold drop-shadow-sm">
                Beton Brutal Database
              </span>
              <img
                src="/assets/icons/anniv-icons/exit.png"
                onClick={() => onClose?.()}
                className="size-6 shadow-[inset_-1px_-1px_0_#777] hover:brightness-90 cursor-pointer"
              />
            </div>
          )}

          <div className={clsx(classic && "p-4")}>{children}</div>
        </DialogPanel>
      </motion.div>
    </Dialog>
  );
};

export default Modal;
