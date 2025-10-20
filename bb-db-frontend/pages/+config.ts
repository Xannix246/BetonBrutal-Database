import type { Config } from "vike/types";
import vikeReact from "vike-react/config";
import { LayoutDefault as Layout } from "../layouts/LayoutDefault";
import icon from "../assets/icons/favicon.png";

// Default config (can be overridden by pages)
// https://vike.dev/config

export default {
  // https://vike.dev/Layout
  Layout,
  port: 3001,

  // https://vike.dev/head-tags
  title: "BETON BRUTAL Database",
  image: icon,
  // description: "Demo showcasing Vike",

  extends: vikeReact,
} satisfies Config;
