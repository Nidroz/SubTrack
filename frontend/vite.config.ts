import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// in production the frontend calls the backend directly via VITE_API_URL.
// in dev, the proxy handles /api → localhost:8080.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server:
      mode === "development"
          ? {
            proxy: {
              "/api": {
                target: "http://localhost:8080",
                changeOrigin: true,
              },
            },
          }
          : {},
}));