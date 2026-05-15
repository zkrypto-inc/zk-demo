import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

export default defineConfig({
  base: isGitHubPages ? "/zk-demo-v2/" : "/",
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
