import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const adapterProxyTarget = env.VITE_ZKWALLET_ADAPTER_PROXY_TARGET || "http://127.0.0.1:8090";

  return {
    base: isGitHubPages ? "/zk-demo/" : "/",
    plugins: [react(), tailwindcss()],
    server: {
      host: "0.0.0.0",
      proxy: {
        "/wallet/adapter": {
          target: adapterProxyTarget,
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
  };
});
