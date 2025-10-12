import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import clsx from "clsx";
import { JSX, useEffect, useState } from "react";

type item = {
  icon?: JSX.Element;
  name: string;
  onClick?: () => void;
}

interface Props {
  button: JSX.Element;
  className: string;
  menu: item[];
}

const Dropdown = ({ button, className, menu }: Props) => {
  const [hasIcon, setHasIcon] = useState(false);

  useEffect(() => {
    if(menu.some(item => item.icon)) setHasIcon(true);
  }, []);

  return (
    <Menu>
      <MenuButton>{button}</MenuButton>
      <MenuItems anchor="bottom" className={clsx(className, "")}>
        {menu.map((item, i) => (
          <MenuItem key={i}>
            <button 
              className=""
              onClick={item.onClick}
            >
              {hasIcon && <div className="w-4 h-4">
                {item.icon}
              </div>}
              {item.name}
            </button>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}

export default Dropdown;
