import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const configDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: configDir,
  envDir: path.resolve(configDir, "../.."),
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(configDir, "src"),
      "@postbird/shared": path.resolve(
        configDir,
        "../../packages/shared/src/index.ts",
      ),
    },
  },
  build: {
    chunkSizeWarningLimit: 550,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "react-vendor",
              test: /node_modules[\\/](react|react-dom|scheduler)\b/,
            },
            {
              name: "router-vendor",
              test: /node_modules[\\/]react-router/,
            },
            {
              name: "query-vendor",
              test: /node_modules[\\/]@tanstack/,
            },
          ],
        },
      },
    },
  },
});
