import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  css: {
    postcss: {
      plugins: [],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@mono/shared_ui": path.resolve(
        __dirname,
        "../../packages/shared_ui/src"
      ),
      "@mono/api_client": path.resolve(
        __dirname,
        "../../packages/api_client/src"
      ),
    },
  },
  server: {
    port: 54321,
    allowedHosts: true,
  },
});
