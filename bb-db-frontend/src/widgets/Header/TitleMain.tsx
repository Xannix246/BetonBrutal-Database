import { useState } from "react";
import { t } from "i18next";
import { Button, Input } from "@shared";
import { handleEnterSearch, handleSearch } from "@features";
import { Keys } from "@locales/keys";

const TitleMain = () => {
  const [search, setSearch] = useState("");
  return (
    <div className="flex flex-col uppercase">
      <div className="bg-black/80 w-full h-64 flex flex-col place-items-center px-4 py-8 md:p-8 gap-8">
        <div className="relative">
          <h1 className="text-[#ffd884] text-6xl tracking-wider text-shadow-lg/30 text-center">
            BETON BRUTAL DATABASE
          </h1>
        </div>

        <div className="flex w-full drop-shadow-md justify-center">
          <Input
            className="text-2xl w-full sm:text-4xl md:w-2xl lg:w-4xl bg-white/10"
            placeholder={t(Keys.header.placeholder)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => handleEnterSearch(search, e)}
          />
          <Button
            className="text-3xl sm:text-4xl bg-white/10 uppercase"
            onClick={() => handleSearch(search)}
          >
            {t(Keys.header.search)}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TitleMain;
