import { defineConfig } from "vite";

export default defineConfig({
  build: {
    sourcemap: true,
  },
  server: {
    proxy: {
      "/socket.io": {
        target: "http://localhost:3000",
        ws: true,
      },
    },
  },
});
