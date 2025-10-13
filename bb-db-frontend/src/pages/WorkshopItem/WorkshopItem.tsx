import { useEffect, useState } from "react";
import Footer from "../../widgets/Footer/Footer";
import Header from "../../widgets/Header/Header";
import { getMap } from "./requests";
import Container from "../../shared/Containter/Container";
import DescriptionFormatter from "../../features/DescriptionFormatter";

const WorkshopItemPage = ({ id }: { id: string }) => {
  const [mapData, setMapData] = useState<WorkshopItem>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const map = await getMap(id);
      setMapData(map);
      setLoaded(true);
    })();
  }, []);

  return (
    <div className="w-full min-h-screen h-full bg-[url(/assets/img/bg.jpg)] bg-center bg-fixed bg-no-repeat bg-cover bg-black">
      <div className="fixed left-0 w-full z-50">
        <Header isAbsolute={true} />
      </div>

      <div className="flex flex-col h-full justify-between">
        {loaded ?
          <div className="flex gap-2 pt-32 px-4 h-screen w-full">
            <div className="flex flex-col gap-2">
              <div className="relative min-w-128 h-128 bg-black/70">
                <img src={mapData?.previewUrl} className="absolute w-128 h-128 object-cover bottom-0 right-0 hover:-bottom-5 hover:-right-5 transition-all duration-300" />
              </div>
              <Container className="text-white flex gap-16 text-4xl justify-center">
                <h2 className="text-green">+ {mapData?.ratingUp}</h2>
                |
                {mapData && <h2>{mapData.ratingUp - mapData.ratingDown}</h2>}
                |
                <h2 className="text-red">- {mapData?.ratingDown}</h2>
              </Container>
            </div>
            <div className="flex flex-col w-full gap-2">
              <Container className="text-white text-8xl w-full text-center">
                <a target="_blank" href={`https://steamcommunity.com/sharedfiles/filedetails/?id=${mapData?.id}`} rel="noreferrer">{mapData?.title.toUpperCase()}</a>
              </Container>
              <Container className="text-gray-300 text-4xl w-full text-center flex justify-between">
                <a 
                  href={`/workshop/player/${mapData?.creatorId}`} 
                  className="hover:text-white hover:underline"
                >BY {mapData?.creator.toUpperCase()}</a>
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
