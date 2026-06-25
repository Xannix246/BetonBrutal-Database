import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import vike from "vike/plugin";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  plugins: [vike(), react(), tailwindcss()],
  build: {
    target: "es2022",
  },
  server: {
    allowedHosts: ["localhost", "26.220.176.177", "db.betonbrutal.com"],
    host: "localhost",
    port: 3001,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@widgets": path.resolve(__dirname, "./src/widgets"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@entities": path.resolve(__dirname, "./src/entities"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@layout": path.resolve(__dirname, "./layouts"),
      "@locales": path.resolve(__dirname, "./i18n"),
      "@config": path.resolve(__dirname, "./config/config.ts"),
      "@assets": path.resolve(__dirname, "./assets"),
    },
  },
});
