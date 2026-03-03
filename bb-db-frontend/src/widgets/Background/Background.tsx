import clsx from "clsx";
import DummyTile from "../../entities/DummyTile";

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
