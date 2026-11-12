import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

declare const process: { env: Record<string, string | undefined> };

// Inspiration projects (third-party reference photography) are internal-preview only.
// Unless VITE_INSPIRATION=1, their data is swapped for an empty list so nothing about them ships.
const inspiration = process.env.VITE_INSPIRATION === "1";
const emptyInspiration = "/src/site/inspiration.empty.json";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: inspiration ? [] : [{ find: /^\.\/inspiration\.json$/, replacement: emptyInspiration }],
  },
  build: {
    target: "es2022",
    cssCodeSplit: false,
  },
});
