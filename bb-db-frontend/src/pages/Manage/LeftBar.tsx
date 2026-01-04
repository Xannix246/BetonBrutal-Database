import { Button } from "@headlessui/react";
import { navigate } from "vike/client/router";

const LeftBar = () => {
  return (
    <div className="w-[320px]">
      <div className="fixed h-screen w-[320px] bg-black/80 flex flex-col">
        <h1
          className="text-[#ffd884] text-4xl tracking-wider text-shadow-lg/30 text-center p-4 justify-between cursor-pointer"
          onClick={() => navigate("/")}
        >
          BETON BRUTAL DATABASE PANEL
        </h1>

        <div className="flex flex-col gap-4 text-4xl h-full justify-center">
          <Button className="uppercase">Maps</Button>
          <Button className="uppercase">Replays</Button>
          <Button className="uppercase">Comments</Button>
          <Button className="uppercase">Articles</Button>
        </div>
      </div>
    </div>
  );
};

export default LeftBar;
