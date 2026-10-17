import { useEffect, useRef, useState } from "react";
import { motion, PanInfo, useMotionValue, useTransform } from "motion/react";
import clsx from "clsx";
import { Container } from "@shared";
import { Toast as ToastType, removeToast } from "@store";
import { isClassic } from "@utils";

const colors = {
  error: {
    bg: "bg-red",
    text: "text-red",
  },
  warn: {
    bg: "bg-yellow",
    text: "text-yellow",
  },
  success: {
    bg: "bg-green",
    text: "text-green",
  },
  info: {
    bg: "bg-blue",
    text: "text-blue",
  },
};

const Toast = ({ toast }: { toast: ToastType }) => {
  const [isPaused, setIsPaused] = useState(false);
  const startTime = useRef(Date.now());
  const remaining = useRef(toast.time);
  const progress = useMotionValue(100);
  const width = useTransform(progress, (v) => `${v}%`);
  const x = useMotionValue(0);
  const currentColor = colors[toast.type];
  const classic = isClassic();

  useEffect(() => {
    if (!toast.time) return;

    let frame: number;

    const tick = () => {
      if (!isPaused) {
        const elapsed = Date.now() - startTime.current;
        const percent = Math.max(0, 100 - (elapsed / toast.time) * 100);

        progress.set(percent);

        if (percent <= 0) {
          removeToast(toast.id);
          return;
        }
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [isPaused, toast.id, toast.time, progress]);

  const handleMouseEnter = () => {
    setIsPaused(true);

    if (toast.time) {
      remaining.current = Math.max(
        0,
        toast.time - (Date.now() - startTime.current),
      );
    }
  };

  const handleMouseLeave = () => {
    if (toast.time) {
      startTime.current = Date.now() - (toast.time - remaining.current);
    }

    setIsPaused(false);
  };

  const handleDragEnd = (_: PointerEvent, info: PanInfo) => {
    if (info.offset.x > 10) {
      removeToast(toast.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.2 }}
      drag="x"
      dragConstraints={{ left: 0, right: 100 }}
      style={{ x }}
      onDragEnd={handleDragEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={clsx("relative", classic && "pb-2")}
    >
      <Container
        className={clsx(
          classic
            ? [
                "relative w-full min-w-64",
                "rounded-lg",
                "border",
                "[box-shadow:2px_2px_0_#b8b8b8,0_3px_10px_#0003]",
                "!bg-[#fffbe6]",
              ]
            : "relative w-full cursor-grabbing bg-black/90 text-white md:w-100",
        )}>
        {classic && (
          <>
            <div
              className={clsx(
                "flex min-h-8 items-center gap-2 border-b px-2 py-1 rounded-t-lg",
                "border-[#d3c99d] bg-gradient-to-r from-[#fff8d6] to-[#f5e7ad]",
              )}>
              <span
                className={clsx(
                  "min-w-0 flex-1 truncate text-sm font-bold text-[#333333]",
                  colors[toast.type].text,
                )}>
                {toast.title}
              </span>
            </div>
          </>
        )}

        <motion.div
          style={{ width }}
          className={clsx(
            "absolute left-0 top-0 h-1",
            currentColor.bg,
            classic && "hidden",
          )}/>

        <div className={clsx(classic ? "px-3 py-2" : "p-3")}>
          {!classic && (
            <div className={clsx("text-2xl uppercase", currentColor.text)}>
              {toast.title}
            </div>
          )}
          {toast.description && (
            <div
              className={clsx(
                classic
                  ? "text-sm leading-snug text-[#333333]"
                  : "text-lg text-gray-300",
              )}>
              {toast.description}
            </div>
          )}
        </div>

        {classic && (
          <>
            <div
              className={clsx(
                "absolute -bottom-[7px] right-2 size-3",
                "rotate-45 border-b border-r",
                "bg-[#fffbe6]",
              )}/>
            {!isClassic() && (
              <motion.div
                style={{ width }}
                className="absolute bottom-0 left-0 h-[3px]"
              />
            )}
          </>
        )}
      </Container>
    </motion.div>
  );
};

export default Toast;
