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
  "tier-1": t(tips["tier-1"]),
  "tier0": t(tips.tier0),
  "tier1": t(tips.tier1),
  "tier2": t(tips.tier2),
  "tier3": t(tips.tier3),
  "tier4": t(tips.tier4),
  "tier5": t(tips.tier5),
  "tier6": t(tips.tier6),
  "tier7": t(tips.tier7),
  "tier8": t(tips.tier8),
  "tier9": t(tips.tier9),
  "tier10": t(tips.tier10),
  "tier11": t(tips.tier11),
};

export const tiersLabels: Record<Labels, { icon: React.ReactNode, tooltip: string, color?: string }> = {
  grapples: {
    icon: <GiHook className="w-14 h-auto"/>,
    tooltip: t(lbs.grapples),
    color: "bg-white/10",
  },
  wallruns: {
    icon: <PiBoot className="w-14 h-auto"/>,
    tooltip: t(lbs.wallruns),
    color: "bg-white/10",
  },
  trampolines: {
    icon: <TbArrowBounce className="w-14 h-auto"/>,
    tooltip: t(lbs.trampolines),
    color: "bg-white/10",
  },
  ice: {
    icon: <PiSnowflake className="w-14 h-auto"/>,
    tooltip: t(lbs.ice),
    color: "bg-white/10",
  },
  nerveControl: {
    icon: <PiBrain className="w-14 h-auto"/>,
    tooltip: t(lbs.nerveControl),
    color: "bg-white/10",
  },
  xxl: {
    icon: <PiClock className="w-14 h-auto"/>,
    tooltip: t(lbs.xxl),
    color: "bg-white/10",
  },
  coyotes: {
    icon: <CgArrowsShrinkH className="w-14 h-auto"/>,
    tooltip: t(lbs.coyotes),
    color: "bg-white/10",
  },
  pfp: {
    icon: <PiExclamationMark className="w-14 h-auto"/>,
    tooltip: t(lbs.pfp),
    color: "bg-white/10",
  },
  gimicky: {
    icon: <PiQuestionMark className="w-14 h-auto"/>,
    tooltip: t(lbs.gimicky),
    color: "bg-white/10",
  },
  puzzle: {
    icon: <PiPuzzlePiece className="w-14 h-auto"/>,
    tooltip: t(lbs.puzzle),
    color: "bg-white/10",
  },
  moving: {
    icon: <ImMoveUp className="w-14 h-auto"/>,
    tooltip: t(lbs.moving),
    color: "bg-white/10",
  },
  showcase: {
    icon: <PiEye className="w-14 h-auto"/>,
    tooltip: t(lbs.showcase),
    color: "bg-white/10",
  },
  overall: {
    icon: <PiCheck className="w-14 h-auto"/>,
    tooltip: t(lbs.overall),
    color: "bg-white/10",
  },
  nonLinear: {
    icon: <PiArrowsSplit className="w-14 h-auto"/>,
    tooltip: t(lbs.nonLinear),
    color: "bg-white/10",
  },
  chockepoints: {
    icon: <FaRegFaceAngry className="w-14 h-auto"/>,
    tooltip: t(lbs.chockepoints),
    color: "bg-white/10",
  },
  shitpost: {
    icon: <LiaPoopSolid className="w-14 h-auto"/>,
    tooltip: t(lbs.shitpost),
    color: "bg-white/10",
  },
  bath: {
    icon: <FaFaucetDrip className="w-14 h-auto"/>,
    tooltip: t(lbs.bath),
    color: "bg-white/10",
  },
  random: {
    icon: <LiaDiceD6Solid className="w-14 h-auto"/>,
    tooltip: t(lbs.random),
    color: "bg-white/10",
  },
  precision: {
    icon: <PiTarget className="w-14 h-auto"/>,
    tooltip: t(lbs.precision),
    color: "bg-white/10",
  },
};
