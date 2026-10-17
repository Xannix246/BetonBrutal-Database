import clsx from "clsx";
import { DummyTile } from "@entities";
import { isClassic } from "@utils";

const bg = (placeTiles = 30) => {
  const tiles = [];

  for (let i = 0; i < placeTiles; i++) {
    tiles.push(i);
  }

  return tiles;
};

type Props = {
  tiles?: number;
  fullWindowHeight?: boolean;
};

const Background = ({ tiles, fullWindowHeight }: Props) => {
  if (isClassic()) return <div className="inset-0 bg-white -z-10 fixed h-screen w-screen"/>;
  // if (isClassic()) return (
  //   <div className="inset-0 bg-white -z-10 fixed h-screen w-screen">
  //     <img
  //       src="/assets/img/bliss.webp"
  //       className="brightness-75"
  //     />
  //   </div>
  // );
  
  return (
    <div
      className={clsx(
        "-z-10 w-screen bg-[#222]",
        fullWindowHeight ? "absolute h-full" : "fixed h-screen",
      )}
    >
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] auto-rows-[200px] w-full">
        {bg(tiles).map((i) => (
          <DummyTile key={i} />
        ))}
      </div>
    </div>
  );
};

export default Background;
