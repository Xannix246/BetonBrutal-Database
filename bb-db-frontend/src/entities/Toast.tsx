import { useEffect, useRef, useState } from "react";
import { motion, PanInfo, useMotionValue, useTransform } from "motion/react";
import Container from "../shared/Containter/Container";
import { Toast as ToastType, removeToast } from "../store/toast-manager";
import clsx from "clsx";

  const getColor = (type: string) => {
    switch(type) {
      case "error":
        return "red";
      case "warn":
        return "yellow";
      case "success":
        return "green";
      case "info":
      default:
        return "blue";
    }
  }


const Toast = ({ toast }: { toast: ToastType }) => {
  const [isPaused, setIsPaused] = useState(false);
  const startTime = useRef(Date.now());
  const remaining = useRef(toast.time);
  const progress = useMotionValue(100);
  const width = useTransform(progress, (v) => `${v}%`);
  const x = useMotionValue(0);
  const [color, setColor] = useState<"red" | "yellow" | "green" | "blue">("blue");

  useEffect(() => {
    if (!toast.time) return;

    setColor(getColor(toast.type));
    let frame: number;

    const tick = () => {
      if (!isPaused) {
        const elapsed = Date.now() - startTime.current;
        const percent = Math.max(0, 100 - (elapsed / toast.time) * 100);

        progress.set(percent);

        if (percent <= 0) {
          return removeToast(toast.id);
        }
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [isPaused, toast.id, toast.time]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    remaining.current = toast.time - (Date.now() - startTime.current);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    startTime.current = Date.now() - (toast.time - remaining.current);
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
    >
      <Container className="bg-black/90 relative cursor-grabbing text-white w-full md:w-100">
        <motion.div
          style={{ width }}
          className={clsx(
            "absolute top-0 left-0 h-1",
            `bg-${color}`,
          )}
        />

        <div className="p-3">
          <div className={clsx("uppercase text-2xl", `text-${color}`)}>{toast.title}</div>
          {toast.description && (
            <div className="text-lg text-gray-300">{toast.description}</div>
          )}
        </div>
      </Container>
    </motion.div>
  );
};

export default Toast;
