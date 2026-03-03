const LeftBar = () => {
  return (
    <div className="w-[320px]">
      <div className="fixed h-screen w-[320px] bg-black/80 flex flex-col border-r border-amber-200">
        <a
          className="text-[#ffd884] text-4xl tracking-wider text-shadow-lg/30 text-center p-4 justify-between cursor-pointer"
          href="/"
        >
          BETON BRUTAL DATABASE PANEL
        </a>

        <div className="flex flex-col gap-4 text-4xl h-full justify-center text-white pl-8">
          <a
            className="uppercase hover:text-pink duration-150 cursor-pointer"
            href="#maps"
          >
            Maps
          </a>
          <a
            className="uppercase hover:text-pink duration-150 cursor-pointer"
            href="#replays"
          >
            Replays
          </a>
          <a
            className="uppercase hover:text-pink duration-150 cursor-pointer"
            href="#comments"
          >
            Comments
          </a>
          {/* <Button className="uppercase">Articles</Button> */}
        </div>
      </div>
    </div>
  );
};

export default LeftBar;
