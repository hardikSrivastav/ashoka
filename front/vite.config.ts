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
      "/health": "http://localhost:3000",
      "/courses": "http://localhost:3000",
      "/sections": "http://localhost:3000",
      "/faculties": "http://localhost:3000",
      "/recommendations": "http://localhost:3000",
      "/admin": "http://localhost:3000"
    }
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
