import clsx from "clsx";
import { getColor } from "../features/GetColor";
import Container from "../shared/Containter/Container";

type TierCard = {
  entry: TierEntry;
  mapName: string;
}

const TierCard = ({ entry, mapName }: TierCard) => {
  return (
    <Container className="w-full">
      <div className="w-full h-full flex justify-between text-white place-items-center">
        <a 
          href={`/workshop/${entry.mapId}`} 
          target="_blank"
          className="text-xl uppercase hover:underline"
        >{mapName}</a>
        <div className="text-2xl flex gap-2">
          <p>Tier:</p>
          <p
            className="text-[hsl(var(--h)_80_40)]"
            style={{
              "--h": getColor(entry.tier, 10)[0],
            } as React.CSSProperties}
          >{entry.tier}</p>
        </div>
        <div className="text-2xl flex gap-2">
          <p>Status:</p>
          <p className={clsx(
            entry.status === "accepted" && "text-green",
            entry.status === "pending" && "text-yellow",
            entry.status === "denied" && "text-red",
          )}>{entry.status}</p>
        </div>
      </div>
    </Container>
  );
}

export default TierCard;
