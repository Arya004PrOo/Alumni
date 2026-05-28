import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5181,
    allowedHosts: true,
    proxy: {
      '/alumni': 'http://127.0.0.1:8009',
      '/student': 'http://127.0.0.1:8009',
      '/admin': 'http://127.0.0.1:8009',
      '/notifications': 'http://127.0.0.1:8009',
      '/api': 'http://127.0.0.1:8009'
    }
  }
});