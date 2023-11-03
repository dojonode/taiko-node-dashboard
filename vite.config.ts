import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    global: "globalThis",
    "process.env.NODE_DEBUG": false,
    "process.env.LINK_API_URL": false,
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  plugins: [
    svelte(),
    VitePWA({
      manifest: {
        name: "dojo node dashboard",
        short_name: "dojo node",
        start_url: "./",
        display: "standalone",
        background_color: "#FFF9EB",
        theme_color: "#1a1b1b",
        icons: [
          {
            src: "dojonodelogo-dark-square.png",
            sizes: "any",
          },
        ],
      },
    }),
  ],
  base: "/",
});
