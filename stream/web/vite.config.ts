import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" lets the built app be served from any folder or host.
export default defineConfig({
  base: "./",
  plugins: [react()],
  server: { host: true, port: 5173 },
});
