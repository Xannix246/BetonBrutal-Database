import clsx from "clsx";
import { setTargetData } from "../store/store";

type Props = {
  id?: string;
  steamId: string;
  title: string;
  creator: string;
  previewUrl: string;
  ratingUp: number;
  ratingDown: number;
}

const getTileSize = (title: string, ratingUp: number) => {
  if (ratingUp >= 40) return "tile-large";
  if (title.length > 20) return "tile-wide";
  return "tile-normal";
};

const MapTile = ({ steamId, title, creator, previewUrl, ratingUp, id }: Props) => {
  const sizeClass = getTileSize(title, ratingUp);

  return (
    <a
      key={steamId === undefined ? id : steamId}
      className={clsx(
        "relative shadow-md group cursor-pointer bg-black/70",
        sizeClass
      )}
      href={`/workshop/${steamId === undefined ? id : steamId}`}
      onContextMenu={(e) => {
        e.preventDefault();
        setTargetData({ id: id as string, name: title})
      }}
    >
      <div className="absolute right-0 bottom-0 w-full h-full group-hover:-right-5 group-hover:-bottom-5 transform transition-all duration-300">
        <div className="relative w-full h-full overflow-clip">
          <img
            src={previewUrl}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-90 group-hover:opacity-70 transition-all duration-300" />
          <div className="absolute -bottom-10 group-hover:bottom-0 z-10 flex flex-col gap-4 w-full p-4 group-hover:bg-black transition-all duration-300">
            <h2 className="text-3xl font-bold text-white drop-shadow-md line-clamp-2">
              {title?.toUpperCase()}
            </h2>
            <p className="text-lg text-gray-300 truncate text-ellipsis whitespace-nowrap">BY {creator?.toUpperCase() || "UNKNOWN"}</p>
          </div>
        </div>
      </div>
    </a>
  );
};

export default MapTile;