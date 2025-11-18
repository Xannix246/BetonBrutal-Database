import { useEffect, useRef, useState } from "react";
import Container from "../../shared/Containter/Container";
import Background from "../../widgets/Background/Background";
import Footer from "../../widgets/Footer/Footer";
import Header from "../../widgets/Header/Header";
import { getArticles } from "./requests";
import ArticleTile from "../../entities/ArticleTile";
import clsx from "clsx";
import RadioGroup from "../../shared/RadioGroup/RadioGroup";
import Input from "../../shared/Input/Input";
import { MinusIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Checkbox from "../../shared/Checkbox/Checkbox";
import Button from "../../shared/Button/Button";
import { getUser } from "../../store/store";
import Link from "../../shared/Link/Link";

const Articles = () => {
  const [loaded, setLoaded] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [openFilters, setOpenFilters] = useState(false);
  const sortByItems = ["None", "Day", "Week", "Month", "Year"];
  const [selectedDate, setSelectedDate] = useState(sortByItems[0]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagValue, setTagValue] = useState("");
  const [strictTagSearch, setStrictTagSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isMd, setIsMd] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const isLoadingMore = useRef(false);
  const pageRef = useRef(page);
  const user = getUser();

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    (async () => {
      setOpenFilters(window.innerWidth > 768 ? true : false);
      setIsMd(window.innerWidth > 768 ? true : false);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    setArticles([]);
    setPage(1);
    setHasMore(true);
    handleLoad(1, true);
  }, [selectedDate, tags, strictTagSearch]);


  const handleLoad = async (page: number, newSearch?: boolean) => {
    if (!hasMore && !newSearch) return;
    if (isLoadingMore.current) return;
    isLoadingMore.current = true;
    let date: 'day' | 'week' | 'month' | 'year' | undefined = undefined;

    switch (selectedDate) {
      case "Day":
        date = "day";
        break;
      case "Week":
        date = "week";
        break;
      case "Month":
        date = "month";
        break;
      case "Year":
        date = "year";
        break;
    }

    const articles = await getArticles("newest", 50, date, page, tags, strictTagSearch, searchText);
    if (articles.length < 50) setHasMore(false);

    setArticles(prev => [...prev, ...articles]);
    setLoaded(true);
    isLoadingMore.current = false;
  }

  const handleTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagValue !== "" && !tags.includes(tagValue) && tagValue.length <= 20) {
      setTags([...tags, tagValue]);
      setTagValue("");
    }
  }

  const handleSearch = () => {
    setArticles([]);
    setPage(1);
    setHasMore(true);
    handleLoad(1, true);
  }

  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || isLoadingMore.current) return;

      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= docHeight - 300) {
        const nextPage = pageRef.current + 1;
        setPage(nextPage);
        handleLoad(nextPage);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore]);

  return (
    <div className="w-full h-full bg-center bg-fixed bg-no-repeat bg-cover">
      <Background />
      <div className="fixed left-0 w-full z-50">
        <Header isAbsolute={true} />
      </div>
      <div className="flex flex-col min-h-screen justify-between pt-32">
        {loaded ? (
          <div className="flex flex-col">
            <div className="flex flex-col mb-16 w-full">
              <Container className="flex justify-center gap-10 text-4xl tracking-wide place-items-center text-white">
                ARTICLES
              </Container>
              {["writer", "admin"].includes(user?.role as string) && <Container className="flex justify-center bg-green/40 gap-10 text-4xl tracking-wide place-items-center text-white">
                <h2>HMM... SEEMS LIKE YOU CAN WRITE ARTICLES... DO YOU HAVE SOMETHING ON YOU MIND?</h2>
                <Link href="/articles/new" className="hover:text-pink transition duration-300">CLICK HERE</Link>
              </Container>}
            </div>

            <div className="flex flex-col md:flex-row gap-2 w-full px-4">
              <div className="md:sticky md:h-[calc(100vh-80px)] top-18 scrollbar-hide">
                <Container className="flex flex-col text-white place-items-center p-4 w-full md:w-[250px] h-full">
                  <div
                    className="flex gap-4 w-full justify-center place-items-center transition-all duration-300"
                    onClick={() => setOpenFilters(!isMd ? !openFilters : true)}
                  >
                    {!isMd && <ChevronRightIcon width={42} className={clsx("transition duration-300", openFilters ? "rotate-90" : "rotate-0")} />}
                    <h2 className="text-xl font-bold">FILTERS</h2>
                  </div>
                  <div className={clsx(
                    "flex flex-col gap-8 w-full",
                    "transition-all duration-300 ease-in-out",
                    openFilters ? "h-180 opacity-100" : "h-0 opacity-0"
                  )}>
                    <div className="w-full flex flex-col">
                      <h3 className="text-2xl font-bold text-center">SORT BY DATE</h3>
                      <RadioGroup label="some-label" items={sortByItems} selected={selectedDate} setSelected={setSelectedDate} />
                    </div>
                    <div className="w-full flex flex-col gap-2">
                      <h3 className="text-2xl font-bold text-center">SORT BY TAGS</h3>
                      <Input
                        placeholder="Add tag"
                        className="text-xl bg-white/10"
                        value={tagValue}
                        onChange={(e) => setTagValue(e.target.value)}
                        onKeyDown={(e) => handleTag(e)}
                      />
                      <div className="text-xl text-gray-400 grid gap-2 overflow-y-auto h-[65%]">
                        {tags.map((tag, i) => (
                          <div key={i} className="flex gap-1 group">
                            <MinusIcon
                              width={24}
                              className="hover:text-pink opacity-0 group-hover:text-white group-hover:opacity-100 transition duration-300 cursor-pointer group"
                              onClick={() => setTags(tags.filter((t) => t !== tag))}
                            />
                            {tag.toUpperCase()}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-4">
                        <Checkbox enabled={strictTagSearch} setEnabled={setStrictTagSearch} />
                        <h4 className="text-2xl font-bold text-center">INCLUDE ALL TAGS</h4>
                      </div>
                    </div>
                  </div>
                </Container>
              </div>


              <div className="min-h-screen w-full">
                <div className="w-full flex flex-col gap-8 place-items-center">
                  <div className="flex w-full xl:max-w-5xl">
                    <Input
                      placeholder="Search article"
                      className="bg-white/10 text-xl w-full mb-5"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                    <Button className="text-xl py-2 h-full" onClick={handleSearch}>
                      SEARCH
                    </Button>
                  </div>
                  <div className="grid w-full gap-4 grid-cols-[repeat(auto-fill,minmax(1fr,1fr))] md:grid-cols-[repeat(auto-fill,minmax(500px,1fr))]">
                    {articles.map((article, i) => (
                      <ArticleTile article={article} key={i} />
                    ))}
                  </div>
                </div>
              </div>
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
}

export default Articles;