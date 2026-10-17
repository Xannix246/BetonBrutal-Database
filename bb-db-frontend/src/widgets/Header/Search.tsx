import { useEffect, useState } from "react";
import { navigate } from "vike/client/router";
import clsx from "clsx";
import { t } from "i18next";
import { Button, Input, List } from "@shared";
import { handleEnterSearch, handleSearch } from "@features";
import { Keys } from "@locales/keys";
import { isClassic } from "@utils";
import { m } from "motion/react";

const key = Keys.header;

const Search = ({ hide = false, isTitle }: { hide: boolean, isTitle?: boolean }) => {
  const [search, setSearch] = useState("");
  const [foundMaps, setFoundMaps] = useState<WorkshopItemHeader[]>([]);

  useEffect(() => {
    setFoundMaps([]);

    const timer = setTimeout(async () => {
      if (!search.trim()) {
        return;
      }

      const data = await handleSearch(search, true);
      if (data) setFoundMaps(data);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const onItemClick = async (item: WorkshopItemHeader) => {
    setSearch("");
    setFoundMaps([]);
    navigate(`/workshop/${item.id}`);
  };

  return (
    <div
      className={clsx(
        "relative flex items-center w-full",
        hide
          ? "opacity-0 translate-y-[-10px] max-w-0"
          : "opacity-100 translate-y-0 max-w-[1000px]",
        !hide && !isClassic() && "w-full",
        isClassic() ? "justify-end max-w-fit" : "md:mx-16 drop-shadow-md transition-all duration-500 ease-in-out",
      )}
    >
      <div className={isClassic() ? "flex gap-2 w-fit" : "flex w-full h-full"}>
        <Input
          className={clsx(
            isClassic()
              ? "w-110"
              : "w-full bg-white/10",
              !isClassic() && isTitle && "py-2",
          )}
          placeholder={t(key.placeholder)}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => handleEnterSearch(search, e)}
        />
        <Button
          className={clsx(
            isClassic()
              ? "text-black w-fit h-fit"
              : "bg-white/10 uppercase place-items-center",
            !isClassic() && isTitle && "text-4xl"
          )}
          onClick={() => handleSearch(search)}
        >
          {t(key.search)}
        </Button>
      </div>
      {foundMaps.length > 0 && (
        <div className={clsx("absolute w-full h-full",
          !isClassic() && isTitle && "mt-36",
          isClassic()
            ? "mt-22 pr-15.75"
            : "z-200 mt-24",
        )}>
          <List
            data={foundMaps}
            displayData={(map) => map.title}
            onItemClick={onItemClick}
          />
        </div>
      )}
    </div>
  );
};

export default Search;
