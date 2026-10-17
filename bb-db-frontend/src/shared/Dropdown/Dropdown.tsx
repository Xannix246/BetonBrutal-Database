import { JSX, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { isClassic } from "@utils";

type item = {
  name: string;
  icon?: JSX.Element;
  className?: string;
  onClick?: () => void;
};

interface Props {
  button: JSX.Element;
  className?: string;
  menu: item[];
}

const Dropdown = ({ button, className, menu }: Props) => {
  const [open, setOpen] = useState(false);
  const [hasIcon, setHasIcon] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = (e: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target as Node)
    ) {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (menu.some((item) => item.icon)) setHasIcon(true);
  }, [menu]);

  useEffect(() => {
    if (open) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={clsx(isClassic() ? "text-black" : "m-0 p-0")}
      >
        {button}
      </button>

      {open && (
        <div
          className={clsx(
            className,
            "absolute right-0 z-30 min-w-52 w-fit",
            isClassic()
              ? "justify-center border-1 border-l-4 !mt-0 bg-white border-classic-blue-300 overflow-hidden drop-shadow-[3px_3px_1px_rgba(0,0,0,0.25)]"
              : "mt-3 bg-black/70 text-white text-xl shadow-lg",
          )}
        >
          {menu.map((item, i) => (
            <button
              key={i}
              className={clsx(
                item.className,
                "flex justify-start items-center w-full whitespace-nowrap",
                isClassic()
                  ? "gap-2 text-black hover:bg-classic-blue-400 hover:text-white p-1 hover:underline cursor-pointer duration-0"
                  : "gap-4 px-3 py-1.5 hover:bg-white/10 uppercase",
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

export default Dropdown;
