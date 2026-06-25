import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const adapterProxyTarget = env.VITE_ZKWALLET_ADAPTER_PROXY_TARGET || "http://127.0.0.1:8090";
  const polMgrTarget = env.VITE_ZKPOL_MGR_PROXY_TARGET || "http://127.0.0.1:21001";
  const polGenTarget = env.VITE_ZKPOL_GEN_PROXY_TARGET || "http://127.0.0.1:21000";

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
        // zkPoL manager(대시보드 조회) — prefix strip 후 manager 루트(/api/...)로
        "/pol/mgr": {
          target: polMgrTarget,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/pol\/mgr/, ""),
        },
        // zkPoL event-generator(원장 제어)
        "/pol/gen": {
          target: polGenTarget,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/pol\/gen/, ""),
        },
      },
    },
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
  };
});
