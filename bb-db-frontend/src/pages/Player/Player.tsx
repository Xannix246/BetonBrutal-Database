import { useEffect, useState } from "react";
import Footer from "../../widgets/Footer/Footer";
import Header from "../../widgets/Header/Header";
import Container from "../../shared/Containter/Container";
import { getPlayer, getPlayerMaps } from "./requests";
import MapTile from "../../entities/MapTile";
import Background from "../../widgets/Background/Background";

const PlayerPage = ({ id }: { id: string }) => {
  const [player, setPlayer] = useState<Player>();
  const [mapData, setMapData] = useState<WorkshopItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const player = await getPlayer(id);
      setPlayer(player);

      setMapData(await getPlayerMaps(player.items));

      setLoaded(true);
    })();
  }, []);

  return (
    <div className="w-full min-h-screen h-full">
      <Background/>
      <div className="fixed left-0 w-full z-50">
        <Header isAbsolute={true} />
      </div>

      <div className="flex flex-col h-full justify-between">
        {loaded ?
          <div className="flex gap-2 pt-32 min-h-screen w-full">
            <div className="flex flex-col gap-2 w-full text-gray-300">
              <Container className="flex justify-center gap-10 text-4xl tracking-wide place-items-center">
                <div className="flex gap-3">
                  <span>MAPS BY</span>
                  <a
                    target="_blank"
                    href={`https://steamcommunity.com/profiles/${player?.id}`}
                    rel="noreferrer"
                    className="hover:text-white hover:underline"
                  >{player?.username.toUpperCase()}</a>
                </div>
              </Container>
              <div className="px-4">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] auto-rows-[300px] gap-6 p-6 w-full">
                  {mapData.map(m => (
                    <MapTile key={m.id} {...m} />
                  ))}
                </div>
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
