import { useEffect, useState, useRef } from "react";
import Footer from "../../widgets/Footer/Footer";
import Header from "../../widgets/Header/Header";
import Container from "../../shared/Containter/Container";
import { Button } from "@headlessui/react";
import clsx from "clsx";
import { getMaps } from "./requests";
import MapTile from "../../entities/MapTile";
import Background from "../../widgets/Background/Background";

const Workshop = () => {
  const [loaded, setLoaded] = useState(false);
  const [items, setItems] = useState<WorkshopItem[]>([]);
  const [activeSort, setActiveSort] = useState<SortBy>("newest");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const isLoadingMore = useRef(false);
  const pageRef = useRef(page);

  const loadMaps = async (sort: SortBy, pageNumber: number, append = false) => {
    if (isLoadingMore.current) return;
    isLoadingMore.current = true;

    const maps = await getMaps(sort, 50, pageNumber);
    if (maps.length < 50) setHasMore(false);

    setItems(prev => append ? [...prev, ...maps] : maps);
    setLoaded(true);
    isLoadingMore.current = false;
  };

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setItems([]);
    loadMaps(activeSort, 1, false);
  }, [activeSort]);

  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || isLoadingMore.current) return;

      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= docHeight - 300) {
        const nextPage = pageRef.current + 1;
        setPage(nextPage);
        loadMaps(activeSort, nextPage, true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeSort, hasMore]);

  return (
    <div className="w-full min-h-screen h-full bg-center bg-fixed bg-no-repeat bg-cover">
      <Background/>
      <div className="fixed left-0 w-full z-50">
        <Header isAbsolute={true} />
      </div>
      <div className="flex flex-col min-h-screen justify-between pt-32">
        <Container className="flex justify-center gap-10 text-4xl tracking-wide place-items-center">
          <h1 className="text-white">SORT BY:</h1>
          <div className="flex gap-5">
            {["newest", "oldest", "mostPopular"].map(sortOption => (
              <Button
                key={sortOption}
                className={clsx("bg-none", activeSort === sortOption && "text-green")}
                onClick={() => setActiveSort(sortOption as SortBy)}
              >
                {sortOption === "newest" && "NEWEST"}
                {sortOption === "oldest" && "OLDEST"}
                {sortOption === "mostPopular" && "MOST POPULAR"}
              </Button>
            ))}
          </div>
        </Container>

        {loaded ? (
          <div className="flex gap-2 w-full px-4">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] auto-rows-[300px] gap-6 p-6 w-full">
              {items.map(m => (
                <MapTile key={m.id} {...m} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex gap-2 w-full px-4">
            <div className="w-full text-white text-center">
              <Container className="text-6xl w-full">
                CHECKING WHAT&apos;S NEW...
              </Container>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
};

export default Workshop;
