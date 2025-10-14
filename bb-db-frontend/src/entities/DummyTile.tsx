import clsx from "clsx";
import { useEffect, useState } from "react";

const getTileSize = () => {
  const score = Math.floor(Math.random() * 10);
  if (score >= 7) return "tile-large";
  if (score > 4) return "tile-wide";
  return "tile-normal";
};

const getColor = (sizeClass: string) => {
  const score = Math.floor(Math.random() * 8);

  if (sizeClass === "tile-large") {
    if (score >= 5) return "bg-yellow/30";
    return "bg-[#5a5a5a]";
  }

  switch (score) {
    case 0:
      return "bg-[#222222]"
    case 1:
      return "bg-[#2c2c2c]"
    case 2:
      return "bg-[#3a3a3a]"
    case 3:
      return "bg-[#444444]"
    case 4:
      return "bg-[#4d4d4d]"
    case 5:
      return "bg-[#5a5a5a]"
    case 6:
      return "bg-[#696969]"
    case 7:
      return "bg-yellow/30"
  }

  return "bg-[#222222]"
}

const DummyTile = () => {
  const [sizeClass, setSizeClass] = useState("");
  const [colorClass, setColorClass] = useState("");

  useEffect(() => {
    setSizeClass(getTileSize());
    setColorClass(getColor(sizeClass));
  }, []);

  return (
    <div
      className={clsx(
        "relative shadow-md group cursor-pointer",
        sizeClass,
        colorClass
      )}
    >
    </div>
  );
};

export default DummyTile;