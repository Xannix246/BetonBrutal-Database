import { useEffect, useState } from "react";
import Footer from "../../widgets/Footer/Footer";
import Header from "../../widgets/Header/Header";
import Container from "../../shared/Containter/Container";
import { getPlayer, getPlayerMaps, getPlayerReplays, getUser, getUserFavorites } from "./requests";
import MapTile from "../../entities/MapTile";
import Background from "../../widgets/Background/Background";
import { getPrevLink } from "../../store/store";
import clsx from "clsx";
import LeaderboardTable from "../../widgets/LeaderboardTable/LeaderboardTable";
import UserProfile from "./UserProfile";

const PlayerPage = ({ id }: { id: string }) => {
  const [player, setPlayer] = useState<Player>();
  const [mapData, setMapData] = useState<WorkshopItem[]>([]);
  const [replays, setReplays] = useState<Replay[]>([]);
  const [loaded, setLoaded] = useState(false);
  const source = getPrevLink();
  const [page, setPage] = useState<"mapCreator" | "run" | "favorites">(source);
  const [user, setUser] = useState<User>();
  const [publicData, setPublicData] = useState<PublicData>();

  useEffect(() => {
    (async () => {
      const player = await getPlayer(id);
      const user = await getUser(player.id);

      setPlayer(player);
      setUser(user);

      setReplays(await getPlayerReplays(player.replays));

      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    const onPageUpdate = async () => {
      if (!player) return;

      switch (page) {
        case "mapCreator":
          setMapData(await getPlayerMaps(player.items));
          break;

        case "favorites":
          if (!user) return;
          setMapData(await getUserFavorites(user.id));
          break;
      }
    };

    onPageUpdate();
  }, [page, player, user]);

  return (
    <div className="w-full min-h-screen h-full">
      {publicData?.backgroundUrl ? (
        <img
          src={publicData.backgroundUrl}
          className="fixed inset-0 -z-10 w-full h-full object-cover blur-md"
        />
      ) : (
        <Background />
      )}
      <div className="fixed left-0 w-full z-50">
        <Header isAbsolute={true} />
      </div>

      <div className="flex flex-col h-full justify-between">
        {loaded ?
          <div className="flex gap-2 pt-32 min-h-screen w-full">
            <div className="flex flex-col gap-2 w-full text-gray-300">
              {user?.steamId && player && <UserProfile user={user} player={player} publicData={publicData} setPublicData={setPublicData} /> }
              <Container className="flex justify-center gap-10 text-4xl tracking-wide place-items-center">
                <div className="flex gap-3 uppercase">
                  <div className="flex gap-3">
                    <span
                      className={clsx("transition duration-300 cursor-pointer hover:text-pink", page === "mapCreator" && "text-green")}
                      onClick={() => setPage("mapCreator")}
                    >Maps</span>
                    |
                    <span
                      className={clsx("transition duration-300 cursor-pointer hover:text-pink", page === "run" && "text-green")}
                      onClick={() => setPage("run")}
                    >Runs</span>
                    {!user?.steamId && <span>by</span>}
                  </div>
                  {!user?.steamId && <a
                    target="_blank"
                    href={`https://steamcommunity.com/profiles/${player?.id}`}
                    rel="noreferrer"
                    className="hover:text-white hover:underline"
                  >{player?.username}</a>}
                  {user?.steamId && <>
                    |
                    <span
                      className={clsx("transition duration-300 cursor-pointer hover:text-pink", page === "favorites" && "text-green")}
                      onClick={() => setPage("favorites")}
                    >Favorites</span>
                  </>}
                </div>
              </Container>
              <div className="px-4">
                {["mapCreator", "favorites"].includes(page) ?
                  <div className="flex w-full justify-center">
                    {mapData.length > 0 && <div className="grid sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] auto-rows-[200px] lg:auto-rows-[300px] gap-6 p-6 w-full">
                      {mapData.map(m => (
                        <MapTile key={m.id} {...m} />
                      ))}
                    </div>}
                    {mapData.length === 0 && <Container className="w-5xl mt-16">
                      {page === "mapCreator" ? <h2 className="text-[#f1e4c7] tracking-wider text-xl text-center">THIS PLAYER DIDN&apos;T POST ANY MAPS YET...</h2> 
                      : <h2 className="text-[#f1e4c7] tracking-wider text-xl text-center">THIS PLAYER DON&apos;T HAVE FAVORITE MAPS YET...</h2>
                      }
                    </Container>}
                  </div>
                  :
                  <div className="flex w-full justify-center">
                    <div className="w-full md:w-5xl">
                      <LeaderboardTable replays={replays} />
                    </div>
                  </div>
                }
              </div>
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

export default PlayerPage;
