import { useEffect, useState } from "react";
import clsx from "clsx";
import { isClassic } from "@utils";
import Search from "./Search";

const TitleMain = () => {
  const [isSearchVisible, setIsSearchVisible] = useState(true);

  useEffect(() => {
      const handleScroll = () => {
        const scrollY = window.scrollY;
        setIsSearchVisible(!(scrollY > 256));
      };
  
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);

  return (
    <div className={clsx(isClassic() ? "classic fixed z-50 w-full" : "default absolute w-full top-0 z-10 flex flex-col uppercase")}>
      <div
        className={clsx(
          isClassic()
            ? "gradient-lb-b-ltr p-2.5 flex"
            : "bg-black/80 w-full h-64 flex flex-col place-items-center px-4 py-8 md:p-8 gap-8",
        )}
      >
        <div className="relative flex place-items-center gap-2">
          {isClassic() && <img
            className="aspect-square w-12"
            src="/assets/icons/anniv-icons/IndexingService.png"
          />}
          <a className={
            isClassic()
            ? "text-[#ffffff] text-2xl font-[530]"
            : "text-[#ffd884] uppercase text-6xl tracking-wider text-shadow-lg/30 text-center"
          } href="/">
            Beton Brutal Database
          </a>
        </div>

        <div className={clsx("flex w-full drop-shadow-md",
          isClassic()
            ? "justify-end"
            : "justify-center !text-4xl !uppercase"
        )}>
          {/* <Input
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
          </Button> */}
          {(isSearchVisible || isClassic()) && <Search hide={false} isTitle={true}/>}
        </div>
      </div>
    </div>
  );
};

export default TitleMain;
function setIsSticky(arg0: boolean) {
  throw new Error("Function not implemented.");
}

