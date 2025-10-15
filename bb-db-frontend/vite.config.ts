import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import vike from "vike/plugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vike(), react(), tailwindcss()],
  build: {
    target: "es2022",
  },
  server: {
    allowedHosts: ["localhost", "26.220.176.177"],
    host: "localhost",
    port: 3001
  }
});
