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
      includeAssets: [
        "splashscreens/iphone5_splash.png",
        "splashscreens/iphone6_splash.png",
        "splashscreens/iphoneplus_splash.png",
        "splashscreens/iphonex_splash.png",
        "splashscreens/iphonexr_splash.png",
        "splashscreens/iphonexsmax_splash.png",
        "splashscreens/ipad_splash.png",
        "splashscreens/ipadpro1_splash.png",
        "splashscreens/ipadpro3_splash.png",
        "splashscreens/ipadpro2_splash.png",
      ],
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
