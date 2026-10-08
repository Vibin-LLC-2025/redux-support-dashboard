import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxy /api to the Express server so the client and API share an origin in dev.
export default defineConfig({
  plugins: [react()],
  test: {
    // Use a browser-like environment so localStorage and DOM APIs exist in tests.
    environment: "jsdom",
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
});
