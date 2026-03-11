import { useEffect, useRef, useState } from "react";
import Footer from "../../widgets/Footer/Footer";
import Header from "../../widgets/Header/Header";
import {
  getComments,
  getMap,
  getReplays,
  postComment,
  uploadMap,
} from "./requests";
import Container from "../../shared/Containter/Container";
import DescriptionFormatter from "../../features/DescriptionFormatter";
import Background from "../../widgets/Background/Background";
import Input from "../../shared/Input/Input";
import Comment from "../../entities/Comment/Comment";
import LeaderboardTable from "../../widgets/LeaderboardTable/LeaderboardTable";
import {
  $prevLink,
  getFavorites,
  getTargetData,
  getUser,
  setTargetData,
} from "../../store/store";
import { navigate } from "vike/client/router";
import Button from "../../shared/Button/Button";
import { addFavorites, removeFavorites } from "../../features/FavoriteManager";
import clsx from "clsx";
import { io } from "socket.io-client";
import { config } from "../../../config/config";
import { banReplay, deleteReplay } from "../../features/DataManager";
import ContextMenu from "../../shared/ContextMenu/ContextMenu";
import getMedianTime from "./getMedianTime";
import formatTime from "../../features/FormatTime";
import { t } from "i18next";
import { Keys } from "../../../i18n/keys";

const WorkshopItemPage = ({ id }: { id: string }) => {
  const [mapData, setMapData] = useState<WorkshopItem | null>();
  const [loaded, setLoaded] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const user = getUser();
  const [comments, setComments] = useState<UserComment[]>([]);
  const [replays, setReplays] = useState<Replay[]>([]);
  const [value, setValue] = useState("");
  const [preivewId, setPreviewId] = useState<number | null>(null);
  const favorites = getFavorites();
  const [openCMenu, setOpenCMenu] = useState(false);
  const targetData = getTargetData();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const key = Keys.workshopItem;

  const menuItems = [
    {
      name: t(Keys.rankings.delReplay, { player: targetData?.name }),
      onClick: () => {
        if (!targetData) return;

        const updatedItems = [
          ...replays.filter((item) => item.id !== targetData.id),
        ];
        setReplays(updatedItems);
        deleteReplay(targetData.id);
      },
    },
    {
      name: t(Keys.rankings.banReplay, { player: targetData?.name }),
      onClick: () => {
        if (!targetData) return;

        const updatedItems = [
          ...replays.filter((item) => item.id !== targetData.id),
        ];
        setReplays(updatedItems);
        banReplay(targetData.id);
      },
    },
  ];

  useEffect(() => {
    if (targetData) {
      setOpenCMenu(true);
    }
  }, [targetData]);

  useEffect(() => {
    setHydrated(window && true);

    (async () => {
      if (["TimeMS", "TimeDLC1", "TimeBirthday"].includes(id)) {
        return navigate("/");
      }
      const map = await getMap(id);
      const replays = (await getReplays(id)).sort((a, b) => a.score - b.score);
      if (map) {
        setMapData(map);
        setReplays(replays);

        if (map.previews.length > 0)
          setPreviewId(Math.floor(Math.random() * map.previews.length));

        setComments(
          (await getComments(id)).sort(
            (a, b) =>
              new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf(),
          ),
        );
        setLoaded(true);
      } else {
        setMapData(null);
      }
    })();
  }, []);

  useEffect(() => {
    const socket = io(config.baseAuthUrl);

    socket.on("connect", () => {
      console.log("Connected to server");
      socket.emit("request_leaderboard", id);
    });

    socket.on("request_leaderboard", (data: Replay[]) => {
      setReplays(data);
      socket.disconnect();
    });
  }, []);

  const handleSendComment = async (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter" && value.length > 0) {
      const comment = await postComment(id, value);
      setComments([comment, ...comments]);
      setValue("");
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const filename = (await uploadMap(id, event.target.files[0]))
      .filename as string;

    if (filename) {
      setMapData({
        ...mapData!,
        filename,
      });
    }

    event.target.value = "";
  };

  if (!hydrated) return;

  return (
    <div className="w-full min-h-screen h-full">
      {preivewId !== null && mapData ? (
        <img
          src={mapData.previews[preivewId]}
          className="fixed inset-0 -z-10 w-full h-full object-cover blur-md"
        />
      ) : (
        <Background />
      )}

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

      <div className="h-full justify-between">
        {loaded ? (
          <div className="flex flex-col gap-2 pt-32 px-4 min-h-screen w-full">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex flex-col gap-2">
                <div className="aspect-square group relative w-full md:w-96 md:h-96 lg:w-128 lg:h-128 bg-black/70">
                  <img
                    src={mapData?.previewUrl}
                    className="aspect-square absolute w-full md:w-96 md:h-96 lg:w-128 lg:h-128 object-cover bottom-0 right-0 group-hover:-bottom-5 group-hover:-right-5 transition-all duration-300"
                  />
                </div>
                <Container className="text-white flex gap-16 text-2xl sm:text-4xl justify-center mb-8 md:mb-0">
                  <h2 className="text-green">
                    {mapData && mapData.ratingUp > 0 && "+"} {mapData?.ratingUp}
                  </h2>
                  |{mapData && <h2>{mapData.ratingUp - mapData.ratingDown}</h2>}
                  |
                  <h2 className="text-red">
                    {mapData && mapData.ratingDown > 0 && "-"}{" "}
                    {mapData?.ratingDown}
                  </h2>
                </Container>
                {["moderator", "admin"].includes(user?.role as string) && (
                  <div>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleUpload}
                      accept="application/zip"
                      multiple={false}
                      ref={fileInputRef}
                    />
                    <Button
                      className="uppercase bg-blue/60 text-2xl sm:text-4xl p-3 w-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {t(key.upload)}
                    </Button>
                  </div>
                )}
                {mapData?.filename && (
                  <a
                    className="uppercase bg-green/60 text-2xl sm:text-4xl p-3 w-full flex justify-center text-white hover:text-pink transition duration-150"
                    href={`${config.serverUri}/db/download?id=${id}`}
                  >
                    {t(key.download)}
                  </a>
                )}
              </div>
              <div className="flex flex-col w-full gap-2">
                <Container className="text-white text-5xl lg:text-8xl w-full text-center">
                  <a
                    className="hover:underline uppercase"
                    target="_blank"
                    href={`https://steamcommunity.com/sharedfiles/filedetails/?id=${mapData?.id}`}
                    rel="noreferrer"
                  >
                    {mapData?.title}
                  </a>
                </Container>
                <Container className="text-gray-300 text-2xl lg:text-4xl w-full text-center flex justify-between place-items-center">
                  <a
                    href={`/workshop/player/${mapData?.creatorId}`}
                    onClick={() => $prevLink.set("mapCreator")}
                    onPointerDown={() => $prevLink.set("mapCreator")}
                    className="hover:text-white hover:underline uppercase"
                  >
                    BY {mapData?.creator ?? mapData?.creatorId}
                  </a>
                  {user && (
                    <Button
                      onClick={() =>
                        favorites.includes(id)
                          ? removeFavorites(id)
                          : addFavorites(id)
                      }
                      className={clsx(
                        "bg-transparent p-1 text-2xl lg:text-4xl transition duration-300 text-white uppercase",
                        favorites.includes(id)
                          ? "hover:bg-red/40"
                          : "hover:bg-green/40",
                      )}
                    >
                      {favorites.includes(id)
                        ? t(key.favRemove)
                        : t(key.favAdd)}
                    </Button>
                  )}
                  <a
                    target="_blank"
                    href={`https://josiahshields.com/beton/leaderboard/?lb=${mapData?.id}`}
                    rel="noreferrer"
                    className="hover:text-white hover:underline uppercase"
                  >
                    {t(key.bblb)}
                  </a>
                </Container>
                <Container className="flex flex-col gap-6 text-2xl lg:text-3xl text-white">
                  <div className="flex gap-4">
                    <h4 className="uppercase text-blue">{t(key.release)}</h4>
                    <h4 className="uppercase">
                      {mapData && new Date(mapData.createDate).toLocaleDateString()}
                    </h4>
                  </div>
                  <div className="flex gap-4">
                    <h4 className="uppercase text-green">{t(key.time)}</h4>
                    <h4 className="uppercase">
                      {getMedianTime(replays) ? formatTime(getMedianTime(replays)!) : "N/A"}
                    </h4>
                  </div>
                </Container>
                <Container className="text-2xl w-full">
                  <DescriptionFormatter content={mapData?.description} />
                </Container>
              </div>
            </div>
            <div className="flex flex-col-reverse gap-16 mt-16 md:mt-0 md:flex-row md:gap-2 w-full">
              <div className="flex flex-col gap-2 w-full uppercase">
                <Container>
                  <h2 className="text-white tracking-wider text-xl">
                    {t(key.comments)}
                  </h2>
                </Container>
                {user ? (
                  <Input
                    className="text-xl md:mx-2 p-3 bg-white/10"
                    placeholder={t(key.placeholder)}
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value);
                    }}
                    onKeyDown={handleSendComment}
                  />
                ) : (
                  <Container className="text-white text-xl md:mx-2">
                    {t(key.commentsNoAuth)}
                  </Container>
                )}
                {comments.map((comment) => (
                  <Comment comment={comment} key={comment.id} />
                ))}
                {comments.length === 0 && (
                  <Container className="md:mx-2">
                    <h2 className="text-[#f1e4c7] tracking-wider text-xl text-center">
                      {t(key.noComments)}
                    </h2>
                  </Container>
                )}
              </div>
              <LeaderboardTable replays={replays} />
            </div>
          </div>
        ) : (
          <div className="flex gap-2 pt-32 px-4 h-screen w-full">
            <div className="w-full text-white text-center">
              <Container className="text-6xl w-full uppercase">
                {mapData === null ? t(key.notFound) : t(Keys.dataCheck)}
              </Container>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
};

export default WorkshopItemPage;
