import { useEffect, useState } from "react";
import { navigate } from "vike/client/router";
import Background from "../../widgets/Background/Background";
import { authClient } from "../../features/Auth";
import LeftBar from "./LeftBar";
import MapContainer from "./tabs/MapContainer";
import { getActiveMap, setActiveMap } from "../../store/store";
import UpsertMapContainer from "./tabs/UpsertMapContainer";
import ReplaysContainer from "./tabs/ReplaysContainer";
import Button from "../../shared/Button/Button";
import CommentsContainer from "./tabs/CommentsContainer";

const Manage = () => {
  const [allow, setAllow] = useState(false);
  const activeMap = getActiveMap();
  const [isNewMap, setNewMap] = useState(false);

  useEffect(() => {
    (async () => {
      const user = (await authClient.getSession()).data?.user;

      if (!["writer", "admin"].includes(user?.role as string)) {
        return navigate("/");
      } else {
        setAllow(true);
      }
    })();
  }, []);

  const onCreate = () => {
    setNewMap(true);
    setActiveMap({
      id: "",
      steamId: "",
      title: "",
      description: "",
      creator: "",
      creatorId: "",
      previewUrl: "",
      createDate: new Date(),
      previews: [],
      ratingUp: 0,
      ratingDown: 0,
    });
  }

  return (
    <div className="min-h-screen min-w-screen overflow-y-auto">
      <Background />
      {allow ? (
        <div>
          <LeftBar />
          <section className="pl-80 pt-32 place-items-center w-full">
            <div className="flex flex-col gap-16 w-5xl">
              <MapContainer />
              {!activeMap && <Button className="uppercase w-full hover:text-white hover:bg-green/50" onClick={onCreate}>Create new map</Button>}
              {activeMap && <UpsertMapContainer createNewMap={isNewMap} />}
              {activeMap && <ReplaysContainer />}
              {activeMap && <CommentsContainer />}
            </div>
          </section>
        </div>
      ) : (
        <h1 className="flex text-6xl place-content-center w-full text-white pt-32 uppercase">
          Loading...
        </h1>
      )}
    </div>
  );
};

export default Manage;
