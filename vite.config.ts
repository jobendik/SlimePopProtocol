import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? "/SlimePopProtocol/" : "./",
  server: {
    port: 5173,
    host: true,
  },
  build: {
    target: "es2020",
    outDir: "dist",
    sourcemap: false,
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ["phaser"],
        },
      },
    },
  },
});
