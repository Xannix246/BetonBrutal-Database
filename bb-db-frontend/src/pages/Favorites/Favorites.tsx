import { useEffect, useState } from "react";
import Footer from "../../widgets/Footer/Footer";
import Header from "../../widgets/Header/Header";
import Container from "../../shared/Containter/Container";
import MapTile from "../../entities/MapTile";
import Background from "../../widgets/Background/Background";
import { getUser, getUserFavorites } from "./requests";
import { navigate } from "vike/client/router";
import { setPrevLink } from "../../store/store";
import { t } from "i18next";

const Favorites = ({ id }: { id: string }) => {
  const [user, setUser] = useState<User>();
  const [mapData, setMapData] = useState<WorkshopItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const user = await getUser(id);
      setUser(user);

      if (user.steamId) {
        setPrevLink("favorites");
        return navigate(`/workshop/player/${user.steamId}`);
      }

      setMapData(await getUserFavorites(id));

      setLoaded(true);
    })();
  }, []);

  return (
    <div className="w-full min-h-screen h-full">
      <Background />
      <div className="fixed left-0 w-full z-50">
        <Header isAbsolute={true} />
      </div>

      <div className="flex flex-col h-full justify-between">
        {loaded ?
          <div className="flex gap-2 pt-32 min-h-screen w-full">
            <div className="flex flex-col w-full text-gray-300">
              <Container className="flex justify-center text-center gap-10 text-4xl md:text-6xl tracking-wider place-items-center text-white">
                <span>{user?.name.toUpperCase()}&apos;S FAVORITES</span>
              </Container>
              <Container className="flex justify-center gap-10 text-2xl tracking-wider place-items-center">
                <span>(This <a
                  className="text-blue hover:text-blue-500 hover:underline cursor-pointer transition duration-300"
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                >LINK</a> is public, so you can share it with anyone. Just click on &quot;link&quot;)</span>
              </Container>
              <div className="px-4">
                <div className="grid sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] auto-rows-[200px] lg:auto-rows-[300px] gap-6 p-6 w-full">
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
                {t("dataCheck")}
              </Container>
            </div>
          </div>
        }

        <Footer />
      </div>
    </div>
  );
}

export default Favorites;
