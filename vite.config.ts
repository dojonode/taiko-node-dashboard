import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import polyfillNode from "rollup-plugin-polyfill-node";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    global: "globalThis",
    "process.env.NODE_DEBUG": false,
    "process.env.LINK_API_URL": false,
    "process.env.SDK_VERSION": "'unknown'",
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  plugins: [svelte(), VitePWA()],
});
