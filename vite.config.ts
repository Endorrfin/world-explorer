import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base ('./') makes the built site work both locally (vite preview)
// and on GitHub Pages under any project sub-path, because the app uses
// hash-based routing instead of HTML5 history.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 1200,
  },
});
