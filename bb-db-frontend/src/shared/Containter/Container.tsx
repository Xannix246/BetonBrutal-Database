import clsx from "clsx";
import { MouseEventHandler } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onContextMenu?: (event: never) => void;
};

const Container = ({ children, className, onClick, onContextMenu }: Props) => {
  return (
    <div
      className={clsx("p-3 bg-black/70", className)}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      {children}
    </div>
  );
};

export default Container;
