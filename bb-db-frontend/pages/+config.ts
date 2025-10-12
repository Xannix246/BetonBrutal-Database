import type { Config } from "vike/types";
import vikeReact from "vike-react/config";
import { LayoutDefault as Layout } from "../layouts/LayoutDefault";

// Default config (can be overridden by pages)
// https://vike.dev/config

export default {
  // https://vike.dev/Layout
  Layout,

  // https://vike.dev/head-tags
  title: "BETON BRUTAL Database",
  // description: "Demo showcasing Vike",

  extends: vikeReact,
} satisfies Config;
