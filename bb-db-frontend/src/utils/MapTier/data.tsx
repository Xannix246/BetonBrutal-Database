import {
  PiPuzzlePiece,
  PiBoot,
  PiSnowflake,
  PiBrain,
  PiClock,
  PiExclamationMark,
  PiQuestionMark,
  PiEye,
  PiCheck,
  PiArrowsSplit,
  PiTarget,
} from "react-icons/pi";
import { GiHook } from "react-icons/gi";
import { CgArrowsShrinkH } from "react-icons/cg";
import { ImMoveUp } from "react-icons/im";
import { FaRegFaceAngry, FaFaucetDrip } from "react-icons/fa6";
import { TbArrowBounce } from "react-icons/tb";
import { LiaPoopSolid, LiaDiceD6Solid } from "react-icons/lia";
import { t } from "i18next";
import { Keys } from "@locales/keys";

const tips = Keys.mapTiers.tooltips
const lbs = Keys.mapTiers.labels;

export const tiersTooltips: Record<string, string> = {
  "tier-1": tips["tier-1"],
  "tier0": tips.tier0,
  "tier1": tips.tier1,
  "tier2": tips.tier2,
  "tier3": tips.tier3,
  "tier4": tips.tier4,
  "tier5": tips.tier5,
  "tier6": tips.tier6,
  "tier7": tips.tier7,
  "tier8": tips.tier8,
  "tier9": tips.tier9,
  "tier10": tips.tier10,
  "tier11": tips.tier11,
};

export const tiersLabels: Record<Labels, { icon: React.ReactNode, tooltip: string, color?: string }> = {
  grapples: {
    icon: <GiHook className="w-14 h-auto"/>,
    tooltip: lbs.grapples,
    color: "bg-white/10",
  },
  wallruns: {
    icon: <PiBoot className="w-14 h-auto"/>,
    tooltip: lbs.wallruns,
    color: "bg-white/10",
  },
  trampolines: {
    icon: <TbArrowBounce className="w-14 h-auto"/>,
    tooltip: lbs.trampolines,
    color: "bg-white/10",
  },
  ice: {
    icon: <PiSnowflake className="w-14 h-auto"/>,
    tooltip: lbs.ice,
    color: "bg-white/10",
  },
  nerveControl: {
    icon: <PiBrain className="w-14 h-auto"/>,
    tooltip: lbs.nerveControl,
    color: "bg-white/10",
  },
  xxl: {
    icon: <PiClock className="w-14 h-auto"/>,
    tooltip: lbs.xxl,
    color: "bg-white/10",
  },
  coyotes: {
    icon: <CgArrowsShrinkH className="w-14 h-auto"/>,
    tooltip: lbs.coyotes,
    color: "bg-white/10",
  },
  pfp: {
    icon: <PiExclamationMark className="w-14 h-auto"/>,
    tooltip: lbs.pfp,
    color: "bg-white/10",
  },
  gimicky: {
    icon: <PiQuestionMark className="w-14 h-auto"/>,
    tooltip: lbs.gimicky,
    color: "bg-white/10",
  },
  puzzle: {
    icon: <PiPuzzlePiece className="w-14 h-auto"/>,
    tooltip: lbs.puzzle,
    color: "bg-white/10",
  },
  moving: {
    icon: <ImMoveUp className="w-14 h-auto"/>,
    tooltip: lbs.moving,
    color: "bg-white/10",
  },
  showcase: {
    icon: <PiEye className="w-14 h-auto"/>,
    tooltip: lbs.showcase,
    color: "bg-white/10",
  },
  overall: {
    icon: <PiCheck className="w-14 h-auto"/>,
    tooltip: lbs.overall,
    color: "bg-white/10",
  },
  nonLinear: {
    icon: <PiArrowsSplit className="w-14 h-auto"/>,
    tooltip: lbs.nonLinear,
    color: "bg-white/10",
  },
  chockepoints: {
    icon: <FaRegFaceAngry className="w-14 h-auto"/>,
    tooltip: lbs.chockepoints,
    color: "bg-white/10",
  },
  shitpost: {
    icon: <LiaPoopSolid className="w-14 h-auto"/>,
    tooltip: lbs.shitpost,
    color: "bg-white/10",
  },
  bath: {
    icon: <FaFaucetDrip className="w-14 h-auto"/>,
    tooltip: lbs.bath,
    color: "bg-white/10",
  },
  random: {
    icon: <LiaDiceD6Solid className="w-14 h-auto"/>,
    tooltip: lbs.random,
    color: "bg-white/10",
  },
  precision: {
    icon: <PiTarget className="w-14 h-auto"/>,
    tooltip: lbs.precision,
    color: "bg-white/10",
  },
};
