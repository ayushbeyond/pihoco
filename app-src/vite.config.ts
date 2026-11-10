import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Built into ../app and served from https://<site>/app/
export default defineConfig({
  base: "/app/",
  plugins: [react()],
  build: { outDir: "../app", emptyOutDir: true, sourcemap: false, chunkSizeWarningLimit: 900 },
});
