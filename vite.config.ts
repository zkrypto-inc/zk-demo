import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const adapterProxyTarget = env.VITE_ZKWALLET_ADAPTER_PROXY_TARGET || "http://127.0.0.1:8090";
  const transferAdapterTarget = env.VITE_ZKTRANSFER_ADAPTER_PROXY_TARGET || "http://127.0.0.1:9090";
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
        // zkTransfer 데모 어댑터 — prefix strip 후 어댑터 /demo/... 로
        "/transfer/api": {
          target: transferAdapterTarget,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/transfer\/api/, ""),
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
        // zkPoL 네이티브 대시보드 정적 서빙 (dev에선 web-server.cjs가 :8086에서 담당)
        "/pol/dash": {
          target: env.VITE_ZKPOL_DASH_PROXY_TARGET || "http://127.0.0.1:8086",
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
  };
});
