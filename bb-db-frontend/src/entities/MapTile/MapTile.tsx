import clsx from "clsx";
import { getUser, setTargetData } from "@store";
import { getColor, isClassic } from "@utils";

type Props = {
  item: WorkshopItemHeader;
  disableSizeClass?: boolean;
};

const getTileSize = (title: string, ratingUp: number) => {
  if (ratingUp >= 40) return "tile-large";
  if (title.length > 20) return "tile-wide";
  return "tile-normal";
};

const getClassicColor = (ratingUp: number) => {
  if (ratingUp >= 40) return "container-green";
  if (ratingUp >= 25) return "container-yellow";
  return "container-gray";
};

const MapTile = ({ item, disableSizeClass = false }: Props) => {
  const sizeClass = getTileSize(item.title, item.ratingUp);
  const classicColor = getClassicColor(item.ratingUp);
  const user = getUser();
  const color = getColor(item.rating ?? 0, 13);

  return !isClassic() ? (
    <a
      key={item.id}
      className={clsx(
        "relative shadow-md group cursor-pointer bg-black/70",
        !disableSizeClass ? sizeClass : "flex w-full h-full aspect-square",
      )}
      href={
        item.tags?.includes("Collection")
          ? `/collection/${item.id}`
          : `/workshop/${item.id}`
      }
      onContextMenu={(e) => {
        if (
          ["moderator", "admin"].includes(user?.role as string) ||
          window.location.pathname.includes("collection/create")
        ) {
          e.preventDefault();
          setTargetData({ id: item.id, name: item.title });
        }
      }}
    >
      <div className="absolute right-0 bottom-0 w-full h-full group-hover:-right-5 group-hover:-bottom-5 transform transition-all duration-300">
        <div className="relative w-full h-full overflow-clip">
          <img
            src={item.previewUrl}
            alt={item.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-90 group-hover:opacity-70 transition-all duration-300" />
          <div className="absolute -bottom-13 group-hover:bottom-0 z-10 flex flex-col gap-4 w-full p-4 group-hover:bg-black transition-all duration-300">
            <h2 className="text-3xl font-bold text-white drop-shadow-md line-clamp-2">
              {item.title?.toUpperCase()}
            </h2>
            <div className="flex justify-between place-items-center">
              <p className="text-lg text-gray-300 truncate text-ellipsis whitespace-nowrap">
                BY {item.creator?.toUpperCase() || "UNKNOWN"}
              </p>
              {item.rating !== undefined && (
                <p
                  className={clsx(
                    "text-xl",
                    item.rating === -1
                      ? "text-gray-400"
                      : "text-[hsl(var(--h)_80_40)]",
                  )}
                  style={
                    {
                      "--h": color[0],
                    } as React.CSSProperties
                  }
                >
                  {item.rating === -1 ? "P/I" : item.rating.toFixed(0)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </a>
  ) : (
    <div
      className={clsx("w-full flex p-2", classicColor)} key={item.id}
      onContextMenu={(e) => {
        if (
          ["moderator", "admin"].includes(user?.role as string) ||
          window.location.pathname.includes("collection/create")
        ) {
          e.preventDefault();
          setTargetData({ id: item.id, name: item.title });
        }
      }}
    >
      <div className="relative w-fit h-fit">
        <img
          src={item.previewUrl}
          alt={item.title}
          className="w-48 min-w-48 object-cover aspect-square border-1 border-classic-blue-300"
        />
        {/* <img className="absolute w-16 -right-4 -bottom-4" src="/assets/icons/anniv-icons/WindowsMessenger.png"/> */}
      </div>
      <div className="flex flex-col ml-8">
        <span className="text-classic-blue-500 font-bold text-2xl">{item.title}</span>
        <span className="mx-2"><span className="font-bold">Author:</span> {item.creator}</span>
        {item.rating !== undefined && (
          <span className="ms-2">
            <span className="font-bold">Tier: </span>
            <span
              className={clsx(
                item.rating === -1
                  ? "text-gray-800"
                  : "text-[hsl(var(--h)_80_40)]",
              )}
              style={
                {
                  "--h": color[0],
                } as React.CSSProperties
            }>
              {item.rating === -1 ? "P/I" : item.rating.toFixed(0)}
            </span>
          </span>
        )}
        <span className="m-2 line-clamp-3 min-w-full">{item.description ?? "No description"}</span>
        <div className="flex gap-2 place-items-center group">
          <img className="w-6 group-hover:brightness-120" src="/assets/icons/anniv-icons/Go.png"/>
          <a
            className="text-classic-blue-500 hover:underline"
            href={
              item.tags?.includes("Collection")
                ? `/collection/${item.id}`
                : `/workshop/${item.id}`
            }
          >Go to workshop item</a>
        </div>
        <div className="flex gap-2 flex-wrap mt-8">
          {item.previews?.map((preview) => (
            <a href={preview} target="_blank" className="w-48">
              <img
                src={preview}
                alt={item.title}
                className="w-48 object-cover border-1 border-classic-blue-300"
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapTile;
