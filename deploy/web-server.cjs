#!/usr/bin/env node
// zkdemo-v2 정적 서버 (의존성 없음).
// 데모는 루트(/)에서 서빙된다: 랜딩 /, 제품 /zkwallet · /zkpol 등.
// 백엔드는 경로 프리픽스로 같은 VM의 서비스에 프록시한다:
//   /wallet/api → 어댑터(:8080)         (경로 그대로 전달; 어댑터가 /wallet/api로 서빙)
//   /pol/mgr    → zkpol-manager(:21001)  (프리픽스 strip 후 /api/... 로)
//   /pol/gen    → zkpol-event-generator(:21000)
// 그 외는 dist/ 정적 + SPA 폴백(index.html).
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const DIST = path.resolve(__dirname, "..", "dist");
const PORT = Number(process.env.WEB_PORT || 80);
const HOST = process.env.WEB_HOST || "0.0.0.0";
const INDEX = path.join(DIST, "index.html");
// zkpol 네이티브 대시보드 dist를 /pol/dash 에 마운트 (iframe 임베드용).
// 위치는 POL_DASH_DIST로 지정. 디렉터리가 없으면 해당 경로는 데모 SPA 폴백으로 넘어간다.
const DASH_PREFIX = "/pol/dash";
const DASH_DIST = process.env.POL_DASH_DIST || path.resolve(__dirname, "..", "pol-dash");
const DASH_INDEX = path.join(DASH_DIST, "index.html");

// 프록시 라우트: prefix로 매칭. strip=true면 prefix를 떼고 대상 루트로 보낸다.
const PROXIES = [
  { prefix: "/wallet/api", strip: false, host: process.env.ADAPTER_HOST || "127.0.0.1", port: Number(process.env.ADAPTER_PORT || 8080) },
  { prefix: "/pol/mgr", strip: true, host: process.env.POL_MGR_HOST || "127.0.0.1", port: Number(process.env.POL_MGR_PORT || 21001) },
  { prefix: "/pol/gen", strip: true, host: process.env.POL_GEN_HOST || "127.0.0.1", port: Number(process.env.POL_GEN_PORT || 21000) },
];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".map": "application/json; charset=utf-8",
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || "application/octet-stream";
  const stream = fs.createReadStream(filePath);
  stream.on("open", () => res.writeHead(200, { "content-type": type }));
  stream.on("error", () => send(res, 500, "read error"));
  stream.pipe(res);
}

function proxy(req, res, route) {
  // strip=true면 prefix 제거(예: /pol/mgr/api/x → /api/x). false면 경로 그대로.
  const upstreamPath = route.strip ? req.url.slice(route.prefix.length) || "/" : req.url;
  const proxyReq = http.request(
    { host: route.host, port: route.port, method: req.method, path: upstreamPath, headers: req.headers },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res);
    },
  );
  proxyReq.on("error", () => send(res, 502, JSON.stringify({ ok: false, message: `upstream unreachable: ${route.prefix}` }), { "content-type": "application/json" }));
  req.pipe(proxyReq);
}

const server = http.createServer((req, res) => {
  const pathname = decodeURI((req.url || "/").split("?")[0]);

  // 백엔드 프록시 (정적 서빙보다 먼저)
  const route = PROXIES.find((r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`));
  if (route) return proxy(req, res, route);

  // zkpol 네이티브 대시보드 (/pol/dash) — 빌드가 base=/pol/dash 라 prefix를 떼고 서빙
  if (pathname === DASH_PREFIX || pathname.startsWith(`${DASH_PREFIX}/`)) {
    const dashPath = pathname.slice(DASH_PREFIX.length) || "/";
    const dashRel = path.normalize(dashPath === "/" ? "/index.html" : dashPath).replace(/^(\.\.[/\\])+/, "");
    const dashFile = path.join(DASH_DIST, dashRel);
    if (!dashFile.startsWith(DASH_DIST)) return send(res, 403, "forbidden");
    return fs.stat(dashFile, (err, stat) => {
      if (!err && stat.isFile()) return serveFile(res, dashFile);
      fs.stat(DASH_INDEX, (indexErr) => {
        if (indexErr) return send(res, 404, "pol dashboard not deployed");
        serveFile(res, DASH_INDEX); // 대시보드 SPA 폴백 (/public, /operator 등)
      });
    });
  }

  // 정적 서빙(루트 base). 파일 없으면 SPA 폴백.
  const rel = path.normalize(pathname === "/" ? "/index.html" : pathname).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(DIST, rel);
  if (!filePath.startsWith(DIST)) return send(res, 403, "forbidden");

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isFile()) return serveFile(res, filePath);
    serveFile(res, INDEX); // SPA 폴백
  });
});

server.listen(PORT, HOST, () => {
  console.log(`zkdemo-v2 web server listening on ${HOST}:${PORT}, serving ${DIST} (root base)`);
});
