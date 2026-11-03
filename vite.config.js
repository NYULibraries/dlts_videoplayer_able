import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "js/dlts-player.js",
      formats: ["es"],
      fileName: () => "dlts-able-player.js",
    },
    outDir: "dist",
  },
});
