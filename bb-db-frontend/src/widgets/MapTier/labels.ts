export const Labels = {
  grapples: "grapples",
  wallruns: "wallruns",
  trampolines: "trampolines",
  ice: "ice",
  nerveControl: "nerveControl",
  xxl: "xxl",
  coyotes: "coyotes",
  pfp: "pfp",
  gimicky: "gimicky",
  puzzle: "puzzle",
  moving: "moving",
  showcase: "showcase",
  overall: "overall",
  nonLinear: "nonLinear",
  chockepoints: "chockepoints",
  shitpost: "shitpost",
} as const;

export type Labels = typeof Labels[keyof typeof Labels];
