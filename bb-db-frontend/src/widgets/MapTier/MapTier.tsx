import Container from "../../shared/Containter/Container";
import { TbArrowsExchange } from "react-icons/tb";
import { PiArrowSquareDownRightLight, PiArrowsCounterClockwise, PiArrowsHorizontal } from "react-icons/pi";
import TierLabel from "../../entities/TierLabel";
import RateTierModal from "../../features/RateTierModal";
import { useState } from "react";
import { getColor } from "../../features/GetColor";

const MapTier = () => {
  const [open, setOpen] = useState(false);
  const tier = 7;
  const value = tier;
  const color = getColor(value, 10);
  
  return (
    <Container className="w-full md:min-w-18 md:w-18 text-white flex md:flex-col gap-4 place-items-center justify-center md:justify-start h-fit md:h-fit md:min-h-146">
      <div 
        className="aspect-square bg-[hsl(var(--h)_80_40)]/90 w-12 h-auto flex justify-center place-items-center text-4xl cursor-pointer"
        style={{
          "--h": color[0],
        } as React.CSSProperties}
        onClick={() => setOpen(true)}
      >
        7
      </div>
      <TierLabel
        icon={<TbArrowsExchange className="w-12 h-auto bg-red/40" />}
        tooltip="Requires wallkicks knowledge"
      />
      <TierLabel
        icon={<PiArrowSquareDownRightLight className="w-12 h-auto bg-yellow/40"/>}
        tooltip="Requires coyote jumps knowledge"
      />
      <TierLabel
        icon={<PiArrowsHorizontal className="w-12 h-auto bg-green/40"/>}
        tooltip="Requires pixel perfect jumps knowledge"
      />
      <TierLabel
        icon={<PiArrowsCounterClockwise className="w-12 h-auto bg-green/40"/>}
        tooltip="Requires something else with very very very very very very very very very very very very long description"
      />
      <RateTierModal open={open} setOpen={setOpen}/>
    </Container>
  );
}

export default MapTier;
