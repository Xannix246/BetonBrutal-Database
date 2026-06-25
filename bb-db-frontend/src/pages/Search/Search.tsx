import { useEffect, useState } from "react";
import { t } from "i18next";
import { Container } from "@shared";
import { MapTile } from "@entities";
import { Footer, Header, Background } from "@widgets";
import { getSearchData } from "@store";
import { Keys } from "@locales/keys";

const key = Keys.search;

const Search = () => {
  const searchData = getSearchData();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(window && true);
  }, []);

  if (!hydrated) return;

  return (
    <div className="w-full min-h-screen h-full">
      <Background/>
      <div className="fixed left-0 w-full z-50">
        <Header isAbsolute={true} />
      </div>
      <div className="flex flex-col h-full justify-between">
        <div className="flex gap-2 pt-32 min-h-screen w-full">
          <div className="flex flex-col gap-2 w-full text-gray-300">
            <Container className="flex justify-center gap-10 text-4xl tracking-wide place-items-center">
              <div className="flex gap-3 uppercase">
                <span>{t(key.results)}</span>
              </div>
            </Container>
            <div className="px-4">
              {searchData.length > 0 ?
                <div className="grid sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] auto-rows-[200px] lg:auto-rows-[300px] gap-6 p-6 w-full">
                  {searchData.map(m => (
                    <MapTile key={m.id} item={m} />
                  ))}
                </div>
                :
                <div className="flex w-full">
                  <Container className="flex flex-col w-full justify-center gap-10 text-4xl tracking-wide place-items-center">
                    <span className="text-6xl text-red uppercase">{t(key.notFound)}</span>
                    <span className="text-gray-300 text-2xl">{t(key.tip)}</span>
                  </Container>
                </div>
              }
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default Search;
