import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import glsl from "vite-plugin-glsl";

// https://vitejs.dev/config/
// ffmpeg.wasm needs to enable Corss-Origin
export default defineConfig({
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
  },
  plugins: [glsl(), preact()],
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
  },
});
