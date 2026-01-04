import { JSX, useEffect, useRef, useState } from "react";
import clsx from "clsx";

type item = {
  name: string;
  icon?: JSX.Element;
  className?: string;
  onClick?: () => void;
};

interface Props {
  menu: item[];
  open: boolean;
  setOpen: (value: boolean) => void;
  onClose?: () => void;
}

const ContextMenu = ({ menu, open, setOpen, onClose }: Props) => {
  const [hasIcon, setHasIcon] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [cords, setCords] = useState({
    x: 0,
    y: 0,
  });

  const handleClickOutside = (e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      onClose?.();
      setOpen(false);
    }
  };

  const handleClick = (e: MouseEvent) => {
    setCords({
      x: e.pageX,
      y: e.pageY,
    });
  };

  useEffect(() => {
    if (menu.some((item) => item.icon)) setHasIcon(true);
  }, [menu]);

  useEffect(() => {
    window.addEventListener("auxclick", handleClick);

    if (open) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => {
      window.removeEventListener("auxclick", handleClick);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [open]);

  return (
    <div
      className="absolute w-72 z-50 mt-3"
      ref={menuRef}
      style={{
        left: cords.x,
        top: cords.y
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {open && (
        <div className="absolute w-fit bg-black/80 text-white text-xl shadow-lg z-50">
          {menu.map((item, i) => (
            <button
              key={i}
              className={clsx(
                item.className,
                "flex w-full justify-start items-center gap-4 px-3 py-1.5 hover:bg-white/10"
              )}
              onClick={() => {
                item.onClick?.();
                setOpen(false);
              }}
            >
              {hasIcon && <div className="w-6 h-6">{item.icon}</div>}
              {item.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContextMenu;
