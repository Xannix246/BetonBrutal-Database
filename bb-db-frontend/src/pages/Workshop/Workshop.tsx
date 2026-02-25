import { useEffect, useState, useRef } from "react";
import Footer from "../../widgets/Footer/Footer";
import Header from "../../widgets/Header/Header";
import Container from "../../shared/Containter/Container";
import { Button } from "@headlessui/react";
import clsx from "clsx";
import { getMaps, getRandomMap } from "./requests";
import MapTile from "../../entities/MapTile";
import Background from "../../widgets/Background/Background";
import { navigate } from "vike/client/router";
import ContextMenu from "../../shared/ContextMenu/ContextMenu";
import { getTargetData, getUser, setTargetData } from "../../store/store";
import { DeleteMap } from "../../features/DataManager";
import { v4 } from "uuid";

const Workshop = () => {
  const [loaded, setLoaded] = useState(false);
  const [items, setItems] = useState<WorkshopItem[]>([]);
  const [activeSort, setActiveSort] = useState<SortBy>("newest");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const isLoadingMore = useRef(false);
  const pageRef = useRef(page);
  const [openCMenu, setOpenCMenu] = useState(false);
  const targetData = getTargetData();
  const user = getUser();

  const menuItems = [
    {
      name: `Delete "${targetData?.name}"`,
      onClick: () => {
        if (!targetData) return;

        const updatedItems = [
          ...items.filter((item) => item.id !== targetData.id),
        ];
        setItems(updatedItems);
        DeleteMap(targetData.id);
      },
    },
  ];

  const loadMaps = async (sort: SortBy, pageNumber: number, append = false) => {
    if (isLoadingMore.current) return;
    isLoadingMore.current = true;

    const maps = await getMaps(sort, 50, pageNumber);
    if (maps.length < 50) setHasMore(false);

    setItems((prev) => (append ? [...prev, ...maps] : maps));
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

  useEffect(() => {
    if (targetData) {
      setOpenCMenu(true);
    }
  }, [targetData]);

  return (
    <div className="w-full min-h-screen h-full bg-center bg-fixed bg-no-repeat bg-cover">
      <Background />
      {["moderator", "admin"].includes(user?.role as string) && (
        <ContextMenu
          menu={menuItems}
          open={openCMenu}
          setOpen={setOpenCMenu}
          onClose={() => setTargetData(null)}
        />
      )}
      <div className="fixed left-0 w-full z-50">
        <Header isAbsolute={true} />
      </div>
      <div className="flex flex-col min-h-screen justify-between pt-32">
        <Container className="flex gap-10 text-2xl md:text-4xl tracking-wide md:justify-center place-items-center overflow-x-auto whitespace-nowrap">
          <h1 className="text-white">SORT BY:</h1>
          <div className="flex gap-5">
            {["newest", "oldest", "mostPopular", "mostPlayed"].map(
              (sortOption) => (
                <Button
                  key={sortOption}
                  className={clsx(
                    "bg-none",
                    activeSort === sortOption && "text-green",
                  )}
                  onClick={() => setActiveSort(sortOption as SortBy)}
                >
                  {sortOption === "newest" && "NEWEST"}
                  {sortOption === "oldest" && "OLDEST"}
                  {sortOption === "mostPopular" && "MOST POPULAR"}
                  {sortOption === "mostPlayed" && "MOST PLAYED"}
                </Button>
              ),
            )}
          </div>
          <h1 className="text-white"> |</h1>
          <Button
            className="bg-transparent p-0"
            onClick={async () => navigate(`/workshop/${await getRandomMap()}`)}
          >
            RANDOM MAP
          </Button>
        </Container>

        {loaded ? (
          <div className="flex gap-2 w-full">
            <div className="grid sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] auto-rows-[200px] lg:auto-rows-[300px] gap-6 p-6 w-full">
              {items.map((m) => (
                <MapTile key={`${v4()}`} {...m} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex gap-2 w-full px-4">
            <div className="w-full text-white text-center mt-64 mb-256">
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
