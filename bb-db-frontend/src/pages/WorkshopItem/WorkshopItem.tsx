import { useEffect, useState } from "react";
import Footer from "../../widgets/Footer/Footer";
import Header from "../../widgets/Header/Header";
import { getComments, getMap, getReplays, postComment } from "./requests";
import Container from "../../shared/Containter/Container";
import DescriptionFormatter from "../../features/DescriptionFormatter";
import Background from "../../widgets/Background/Background";
import { authClient } from "../../features/Auth";
import Input from "../../shared/Input/Input";
import Comment from "../../entities/Comment/Comment";
import LeaderboardTable from "../../widgets/LeaderboardTable/LeaderboardTable";
import { $prevLink, getFavorites } from "../../store/store";
import { navigate } from "vike/client/router";
import Button from "../../shared/Button/Button";
import { addFavorites, removeFavorites } from "../../features/FavoriteManager";
import clsx from "clsx";

const WorkshopItemPage = ({ id }: { id: string }) => {
  const [mapData, setMapData] = useState<WorkshopItem>();
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState<User>();
  const [comments, setComments] = useState<UserComment[]>([]);
  const [replays, setReplays] = useState<Replay[]>([]);
  const [value, setValue] = useState("");
  const favorites = getFavorites();

  useEffect(() => {
    (async () => {
      if (["TimeMS", "TimeDLC1", "TimeBirthday"].includes(id)) {
        return navigate("/");
      }
      const map = await getMap(id);
      const replays = (await getReplays(id)).sort(
        (a, b) => a.score - b.score
      );
      setMapData(map);
      setReplays(replays);

      setUser((await authClient.getSession()).data?.user);
      setComments((await getComments(id)).sort(
        (a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf()
      ));
      setLoaded(true);
    })();
  }, []);

  const handleSendComment = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && value.length > 0) {
      const comment = await postComment(id, value);
      setComments([comment, ...comments]);
      setValue("");
    }
  }

  return (
    <div className="w-full min-h-screen h-full">
      <Background />
      <div className="fixed left-0 w-full z-50">
        <Header isAbsolute={true} />
      </div>

      <div className="flex flex-col h-full justify-between">
        {loaded ?
          <div className="flex flex-col gap-2 pt-32 px-4 min-h-screen w-full">
            <div className="flex gap-2">
              <div className="flex flex-col gap-2">
                <div className="group relative min-w-128 h-128 bg-black/70">
                  <img src={mapData?.previewUrl} className="absolute w-128 h-128 object-cover bottom-0 right-0 group-hover:-bottom-5 group-hover:-right-5 transition-all duration-300" />
                </div>
                <Container className="text-white flex gap-16 text-4xl justify-center">
                  <h2 className="text-green">{mapData && mapData?.ratingUp > 0 && "+"} {mapData?.ratingUp}</h2>
                  |
                  {mapData && <h2>{mapData.ratingUp - mapData.ratingDown}</h2>}
                  |
                  <h2 className="text-red">{mapData && mapData?.ratingDown > 0 && "-"} {mapData?.ratingDown}</h2>
                </Container>
              </div>
              <div className="flex flex-col w-full gap-2">
                <Container className="text-white text-8xl w-full text-center">
                  <a target="_blank" href={`https://steamcommunity.com/sharedfiles/filedetails/?id=${mapData?.id}`} rel="noreferrer">{mapData?.title.toUpperCase()}</a>
                </Container>
                <Container className="text-gray-300 text-4xl w-full text-center flex justify-between">
                  <a
                    href={`/workshop/player/${mapData?.creatorId}`}
                    onClick={() => $prevLink.set("mapCreator")}
                    className="hover:text-white hover:underline"
                  >BY {mapData?.creator.toUpperCase()}</a>
                  <Button
                    onClick={() => favorites.includes(id) ? removeFavorites(id) : addFavorites(id)}
                    className={clsx(
                      "bg-transparent p-1 transition duration-300 text-xl text-white",
                      favorites.includes(id) ? "hover:bg-red/40" : "hover:bg-green/40"
                    )}
                  >{favorites.includes(id) ? "REMOVE FROM FAVORITES" : "ADD TO FAVORITES"}</Button>
                  <a
                    target="_blank"
                    href={`https://josiahshields.com/beton/leaderboard/?lb=${mapData?.id}`}
                    rel="noreferrer"
                    className="hover:text-white hover:underline"
                  >MAP ON BBLB</a>
                </Container>
                <Container className="text-2xl w-full">
                  <DescriptionFormatter content={mapData?.description} />
                </Container>
              </div>
            </div>
            <div className="flex gap-2 w-full">
              <div className="flex flex-col gap-2 w-full">
                <Container>
                  <h2 className="text-white tracking-wider text-xl">COMMENTS</h2>
                </Container>
                {user ?
                  <Input
                    className="text-xl mx-2 p-3 bg-white/10"
                    placeholder="Type your comment here..."
                    value={value}
                    onChange={(e) => { setValue(e.target.value) }}
                    onKeyDown={handleSendComment}
                  />
                  :
                  <Container className="text-white text-xl mx-2">You need to be logged in to leave comments</Container>
                }
                {comments.map(comment => (
                  <Comment comment={comment} key={comment.id} />
                ))}
                {comments.length === 0 && <Container className="mx-2">
                  <h2 className="text-[#f1e4c7] tracking-wider text-xl text-center">SEEMS LIKE STILL NO ONE HAS LEFT A COMMENT HERE... DO YOU WANT TO BE FIRST?</h2>
                </Container>}
              </div>
              <LeaderboardTable replays={replays}/>
            </div>
          </div>
          :
          <div className="flex gap-2 pt-32 px-4 h-screen w-full">
            <div className="w-full text-white text-center">
              <Container className="text-6xl w-full">
                CHECKING WHAT&apos;S NEW...
              </Container>
            </div>
          </div>
        }

        <Footer />
      </div>
    </div>
  );
}

export default WorkshopItemPage;
