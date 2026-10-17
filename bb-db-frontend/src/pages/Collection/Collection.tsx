import { useEffect, useState } from "react";
import { navigate } from "vike/client/router";
import clsx from "clsx";
import { t } from "i18next";
import { v4 } from "uuid";
import { Button, Container } from "@shared";
import { MapTile } from "@entities";
import { addFavorites, removeFavorites, DescriptionFormatter } from "@features";
import { Background, Header, Footer } from "@widgets";
import { $prevLink, getFavorites, getUser } from "@store";
import { Keys } from "@locales/keys";
import { isClassic } from "@utils";
import { getCollection, getItem, getItemData, getStats, getVote, voteCollection } from "./requests";

const key = Keys.collection.item;

const Collection = ({ id }: { id: string }) => {
  const [loaded, setLoaded] = useState(false);
  const [itemData, setItemData] = useState<WorkshopItemHeader[]>([]);
  const [item, setItem] = useState<WorkshopItem>();
  const [collection, setCollection] = useState<Collection>();
  const [stats, setStats] = useState<CollectionStats>();
  const [vote, setVote] = useState<Vote | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const user = getUser();
  const favorites = getFavorites();

  useEffect(() => {
    (async () => {
      const collection = await getCollection(id);

      setCollection(collection);
      setStats(await getStats(id));
      setItemData(await getItemData(collection.mapsId));
      setItem(await getItem(id));
      if (user) setVote(await getVote(id));
      setLoaded(true);
    })();
  }, []);

  const onVote = async (type: Vote["type"]) => {
    setVote(await voteCollection(id, type));
    setStats(await getStats(id));
  }

  useEffect(() => {
    setHydrated(window && true);
  }, []);

  if (!hydrated) return;

  return (
    <div className="w-full min-h-screen h-full">
      {item && item.previewUrl && (
        <div className="absolute inset-0 -z-5 w-full h-screen blur-[2px]">
          <img
            src={item.previewUrl}
            className="w-full h-full object-cover [mask-image:linear-gradient(to_bottom,white_0%,transparent)]"
          />
        </div>
      )}
      <Background />

      {!isClassic() && <div className="fixed left-0 w-full z-50">
        <Header isAbsolute={true} />
      </div>}

      <div className="h-full justify-between">
        {loaded ? (
          <div className="flex flex-col gap-2 pt-32 px-4 min-h-screen w-full">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex flex-col gap-2">
                <div className={clsx("aspect-square",
                  isClassic()
                    ? "w-96 border-2 border-classic-blue-300 border-l-gray-200 border-t-gray-200"
                    : "group relative w-full md:w-96 md:h-96 lg:w-128 lg:h-128 bg-black/70"
                )}>
                  <img
                    src={item?.previewUrl}
                    className={clsx(
                      isClassic()
                        ? "w-full"
                        : "aspect-square absolute w-full md:w-96 md:h-96 lg:w-128 lg:h-128 object-cover bottom-0 right-0 group-hover:-bottom-5 group-hover:-right-5 transition-all duration-300"
                    )}
                  />
                </div>
                <Container className={clsx("flex justify-between px-2",
                  isClassic()
                    ? "container-gray"
                    : "text-white text-2xl sm:text-4xl mb-8 md:mb-0"
                )}>
                  <h2 className="text-green">
                    {stats && stats.totalVotesUp > 0 && "+"} {stats?.totalVotesUp}
                  </h2>
                  |{stats && <h2>{stats.totalVotesUp - stats.totalVotesDown}</h2>}
                  |
                  <h2 className="text-red">
                    {stats && stats.totalVotesDown > 0 && "-"} {stats?.totalVotesDown}
                  </h2>
                </Container>
                {user && <div className="flex gap-2">
                  <Button
                    className={clsx("w-full",
                      !isClassic() && "p-2 text-4xl uppercase bg-green/50"
                    )}
                    disabled={vote?.type === "upvote"}
                    onClick={() => onVote("upvote")}
                  >{vote?.type === "upvote" ? t(key.voted) : t(key.voteUp)}</Button>
                  <Button
                    className={clsx("w-full",
                      !isClassic() && "p-2 text-4xl uppercase bg-white/20"
                    )}
                    disabled={vote?.type === "neutral"}
                    onClick={() => onVote("neutral")}
                  >{vote?.type === "neutral" ? t(key.voted) : t(key.clearVote)}</Button>
                  <Button
                    className={clsx("w-full",
                      !isClassic() && "p-2 text-4xl uppercase bg-red/50"
                    )}
                    disabled={vote?.type === "downvote"}
                    onClick={() => onVote("downvote")}
                  >{vote?.type === "downvote" ? t(key.voted) : t(key.voteDown)}</Button>
                </div>}
                {user?.role && (user?.id === collection?.authorId || ["moderator", "admin"].includes(user?.role)) &&
                  <Button
                    className={clsx("w-full",
                      !isClassic() && "p-2 text-4xl uppercase bg-yellow/50"
                    )}
                    onClick={async () => await navigate(`/collection/${id}/update`)}
                  >{t(key.edit)}</Button>}
              </div>
              <div className="flex flex-col w-full gap-2">
                <Container className={clsx(
                  isClassic()
                    ? "container-blue font-semibold text-center text-xl"
                    : "text-white text-5xl lg:text-8xl w-full text-center"
                )}>
                  <h2 className="uppercase">
                    {item?.title}
                  </h2>
                </Container>
                <Container className={clsx("flex justify-between place-items-center",
                  isClassic()
                    ? "container-yellow p-2"
                    : "text-gray-300 text-2xl lg:text-4xl w-full"
                )}>
                  <a
                    href={`/workshop/player/${item?.creatorId}`}
                    onClick={() => $prevLink.set("mapCreator")}
                    onPointerDown={() => $prevLink.set("mapCreator")}
                    className={clsx("hover:underline",
                      isClassic()
                        ? "hover:text-classic-blue-500"
                        : "hover:text-white uppercase"
                    )}
                  >
                    {t(key.by)} {item?.creator ?? item?.creatorId}
                  </a>
                  {user && (
                    <Button
                      onClick={() =>
                        favorites.includes(id)
                          ? removeFavorites(id)
                          : addFavorites(id)
                      }
                      className={clsx(
                        isClassic()
                          ? ""
                          : "bg-transparent p-1 text-2xl lg:text-4xl transition duration-300 text-white uppercase",
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
                </Container>
                <Container className={clsx("flex flex-col",
                  isClassic()
                    ? "container-gray p-2 gap-2"
                    : "gap-6 text-2xl lg:text-3xl text-white uppercase"
                )}>
                  <div className="flex gap-4">
                    <h4 className="text-blue">{t(key.release)}</h4>
                    <h4>
                      {item &&
                        new Date(item.createDate).toLocaleDateString()}
                    </h4>
                  </div>
                  <div className="flex gap-4">
                    <h4 className="text-green">{t(key.played)}</h4>
                    <h4>
                      {stats?.totalReplays} {t(key.replays)}
                    </h4>
                  </div>
                  <div className="flex gap-4">
                    <h4 className="text-red">{t(key.totalMaps)}</h4>
                    <h4>
                      {stats?.totalMaps} {t(key.maps)}
                    </h4>
                  </div>
                </Container>
                <Container className="text-2xl w-full">
                  <DescriptionFormatter content={item?.description} />
                </Container>
              </div>
            </div>

            <div className={clsx("gap-6 p-6 w-full",
              isClassic()
                ? "flex flex-col !gap-4"
                : "grid sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] auto-rows-[200px] lg:auto-rows-[300px]"
            )}>
              {itemData.map((m) => (
                <MapTile key={`${v4()}`} item={m} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex gap-2 pt-32 px-4 h-screen w-full">
            <div className="w-full text-white text-center">
              <Container className="text-6xl w-full uppercase">
                {collection === null ? t(key.notFound) : t(Keys.dataCheck)}
              </Container>
            </div>
          </div>
        )}

         {!isClassic() && <Footer/>}
      </div>
    </div>
  );
};

export default Collection;
