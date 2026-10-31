import { defineConfig } from "vite";
import { gameServerPlugin } from "./server/plugin.mjs";
import { modelAssetsPlugin } from "./server/model-assets.mjs";

export default defineConfig({
  plugins: [gameServerPlugin(), modelAssetsPlugin()],
  server: {
    port: 3000,
    host: true,
  },
  preview: {
    port: 3000,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
        },
      },
    },
  },
});
