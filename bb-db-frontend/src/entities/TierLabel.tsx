import clsx from "clsx";
import { useState } from "react";

type TierLabel = {
  icon: React.ReactNode;
  tooltip: string;
  bgColor?: "black" | "gray" | string;
}

const TierLabel = ({icon, tooltip, bgColor = "gray"}: TierLabel) => {
  const [visibleTip, setVisibleTip] = useState(false);

  return (
    <div className="w-fit h-full relative">
      <div
        onMouseEnter={() => setVisibleTip(true)}
        onMouseLeave={() => setVisibleTip(false)}
      >{icon}</div>
      {visibleTip && <div
        className={clsx(
          "absolute p-2 mt-2 ml-2 z-10 text-2xl text-gray-300 max-w-100 w-max whitespace-normal break-words",
          bgColor === "gray" && "bg-[#202020]/90",
          bgColor === "black" && "bg-black/80",
          !["gray", "black"].includes(bgColor) && bgColor,
        )}
      >{tooltip}</div>}
    </div>
  );
}

export default TierLabel;