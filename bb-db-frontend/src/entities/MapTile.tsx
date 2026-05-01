import clsx from "clsx";
import { getUser, setTargetData } from "../store/store";
import { getColor } from "../features/GetColor";

type Props = {
  item: WorkshopItemHeader;
  disableSizeClass?: boolean;
}

const getTileSize = (title: string, ratingUp: number) => {
  if (ratingUp >= 40) return "tile-large";
  if (title.length > 20) return "tile-wide";
  return "tile-normal";
};

const MapTile = ({ item, disableSizeClass = false }: Props) => {
  const sizeClass = getTileSize(item.title, item.ratingUp);
  const user = getUser();
  const color = getColor(item.rating ?? 0, 12);

  return (
    <a
      key={item.id}
      className={clsx(
        "relative shadow-md group cursor-pointer bg-black/70",
        !disableSizeClass ? sizeClass : "flex w-full h-full aspect-square"
      )}
      href={item.tags?.includes("Collection") ? `/collection/${item.id}` : `/workshop/${item.id}`}
      onContextMenu={(e) => {
        if (
          ["moderator", "admin"].includes(user?.role as string) ||
          window.location.pathname.includes("collection/create")
        ) {
          e.preventDefault();
          setTargetData({ id: item.id, name: item.title})
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
              <p className="text-lg text-gray-300 truncate text-ellipsis whitespace-nowrap">BY {item.creator?.toUpperCase() || "UNKNOWN"}</p>
              {item.rating && <p 
                className={clsx("text-xl", item.rating === -1 ? "text-gray-400" : "text-[hsl(var(--h)_80_40)]" )}
                style={{
                  "--h": color[0],
                } as React.CSSProperties}
              >{item.rating === -1 ? "P/I" : item.rating.toFixed(0)}</p>}
            </div>
          </div>
        </div>
      </div>
    </a>
  );
};

export default MapTile;