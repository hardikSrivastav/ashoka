import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3002,
    proxy: {
      "/api/health": "http://localhost:3000",
      "/api/courses": "http://localhost:3000",
      "/api/sections": "http://localhost:3000",
      "/api/faculties": "http://localhost:3000",
      "/api/recommendations": "http://localhost:3000",
      "/api/admin": "http://localhost:3000"
    }
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
