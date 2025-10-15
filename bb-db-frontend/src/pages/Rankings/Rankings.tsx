import Header from "../../widgets/Header/Header";
import Container from "../../shared/Containter/Container";
import Background from "../../widgets/Background/Background";
import { useEffect, useState } from "react";
import clsx from "clsx";
import Footer from "../../widgets/Footer/Footer";
import { getBathReplays, getBdayReplays, getBrutalReplays } from "./requests";
import LeaderboardTable from "../../widgets/LeaderboardTable/LeaderboardTable";
import FuzzySearch from 'fuzzy-search';
import Input from "../../shared/Input/Input";

const Rankings = () => {
  const [page, setPage] = useState<"TimeMS" | "TimeDLC1" | "TimeBirthday">("TimeMS");
  const [brutalReplays, setBrutalReplays] = useState<Replay[]>([]);
  const [bathReplays, setBathReplays] = useState<Replay[]>([]);
  const [bdayReplays, setBdayReplays] = useState<Replay[]>([]);
  const [searchText, setSearchText] = useState("");

  const searcher = new FuzzySearch(
    page === "TimeMS" && brutalReplays ||
    page === "TimeDLC1" && bathReplays ||
    bdayReplays, ['creator'], {});

  const result = searcher.search(searchText);

  useEffect(() => {
    (async () => {
      setBrutalReplays((await getBrutalReplays()).sort((a, b) => a.score - b.score));
      setBathReplays((await getBathReplays()).sort((a, b) => a.score - b.score));
      setBdayReplays((await getBdayReplays()).sort((a, b) => a.score - b.score));
    })();
  }, []);

  return (
    <div className="w-full min-h-screen h-full">
      <Background />
      <div className="fixed left-0 w-full z-50">
        <Header isAbsolute={true} />
      </div>

      <div className="flex flex-col h-full justify-between min-h-screen">
        <div className="flex gap-2 pt-32 w-full">
          <div className="w-full text-white text-center">
            <Container className="flex justify-center gap-10 text-4xl tracking-wide place-items-center">
              <div className="flex gap-10">
                <span
                  className={clsx("transition duration-300 cursor-pointer hover:text-pink", page === "TimeMS" && "text-green")}
                  onClick={() => {
                    setSearchText("");
                    setPage("TimeMS");
                  }}
                >BETON BRUTAL</span>
                <span
                  className={clsx("transition duration-300 cursor-pointer hover:text-pink", page === "TimeDLC1" && "text-green")}
                  onClick={() => {
                    setSearchText("");
                    setPage("TimeDLC1");
                  }}
                >BETON BATH</span>
                <span
                  className={clsx("transition duration-300 cursor-pointer hover:text-pink", page === "TimeBirthday" && "text-green")}
                  onClick={() => {
                    setSearchText("");
                    setPage("TimeBirthday");
                  }}
                >BETON B-DAY</span>
              </div>
            </Container>
            <Container className="my-16 text-8xl">
              {
                page === "TimeMS" && "BETON BRUTAL REPLAYS" ||
                page === "TimeDLC1" && "BETON BATH REPLAYS" ||
                "BETON B-DAY REPLAYS"
              }
            </Container>
          </div>
        </div>
        <div className="px-4">
          <div className="flex flex-col w-full place-items-center">
            <Input
              placeholder="Search by name"
              className="bg-white/10 text-xl w-5xl mb-5"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <div className="w-5xl">
              <LeaderboardTable
                replays={result}
                comment="NO PLAYERS FOUND"
              />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default Rankings;
