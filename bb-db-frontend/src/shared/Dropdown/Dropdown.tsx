import { JSX, useEffect, useRef, useState } from "react";
import clsx from "clsx";

type item = {
  icon?: JSX.Element;
  name: string;
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
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
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
      <button onClick={() => setOpen((v) => !v)} className="m-0 p-0">
        {button}
      </button>

      {open && (
        <div
          className={clsx(
            className,
            "absolute right-0 mt-3 w-52 bg-black/70 text-white text-xl shadow-lg z-50"
          )}
        >
          {menu.map((item, i) => (
            <button
              key={i}
              className="flex w-full justify-start items-center gap-4 px-3 py-1.5 hover:bg-white/10"
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
