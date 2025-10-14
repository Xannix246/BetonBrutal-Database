import DummyTile from "../../entities/DummyTile";

const bg = () => {
  const tiles = [];

  for (let i = 0; i < 30; i++) {
    tiles.push(i);
  }

  return tiles;
};


const Background = () => {
  return (
    <div className="fixed -z-10 w-screen h-screen bg-[#222]">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] auto-rows-[200px] w-full">
        {bg().map((i) => (
          <DummyTile key={i} />
        ))}
      </div>
    </div>
  );
}

export default Background;
