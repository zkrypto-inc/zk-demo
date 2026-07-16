# zkdemo-v2 실행 런북

이 문서는 `zkdemo-v2`를 로컬에서 바로 띄우고, `zkwallet-adapter`와 `zk-pol`까지 붙여 시연할 수 있게 만드는 실행 문서다.

기준 경로:

```bash
ZKROOT=/Users/junwoo/zkrypto
DEMO=$ZKROOT/zkdemo-v2
WALLET_ADAPTER=$ZKROOT/zkwallet-adapter
ZKPOL=$ZKROOT/zk-pol
ZKPOL_DASH=$ZKPOL/zkpol-manager/frontend
```

## 1. 현재 연동 범위

| 제품 | 현재 상태 | 백엔드 |
|---|---|---|
| zkWallet | live/mock adapter 연동 | `zkwallet-adapter` -> wallet-api, mock providers, optional EVM chain |
| zkPoL | live manager/generator 연동 + native dashboard iframe | `zkpol-manager`, `zkpol-event-generator`, `zkpol` |
| zkTransfer | 시나리오 UI 중심 | 별도 live backend 미연동 |
| zkPasskey | 시나리오 UI 중심 | 별도 live backend 미연동 |

zkWallet에서 실제값으로 볼 수 있는 범위는 wallet-api가 반환하는 user, wallet, key, sign 값이다. approval, policy, ledger, mint/burn, 일부 txHash는 adapter mock provider 값이다.

zkPoL은 `ZP-1`, `ZP-4` 스텝 화면에서 compact live console을 쓰고, `ZP-D` 운영 대시보드에서 zkPoL native dashboard를 iframe으로 연다.

## 2. 포트와 경로

| 항목 | 로컬 개발 | 정적 배포/VM |
|---|---|---|
| zkdemo-v2 dev server | `http://127.0.0.1:5173` | `WEB_PORT` 기본 `80` |
| zkwallet adapter 공개 경로 | `/wallet/adapter` | `/wallet/api` |
| zkwallet adapter target | `http://127.0.0.1:8090` | `http://127.0.0.1:8080` |
| zkPoL manager proxy | `/pol/mgr` -> `21001` | `/pol/mgr` -> `21001` |
| zkPoL event-generator proxy | `/pol/gen` -> `21000` | `/pol/gen` -> `21000` |
| zkPoL native dashboard | `/pol/dash` -> dev `8086` | `/pol/dash` -> `zkdemo-v2/pol-dash` |

중요: VM 배포에서는 프론트 빌드 시 `VITE_ZKWALLET_ADAPTER_BASE_URL=/wallet/api`를 반드시 넣는다. 로컬 dev 기본값은 `/wallet/adapter`다.

## 3. 한 번에 띄우기: 로컬 기본

아래는 zkWallet adapter를 mock mode로, zkPoL을 Docker compose로, zkdemo-v2를 Vite dev server로 띄우는 기본 절차다.

```bash
cd /Users/junwoo/zkrypto/zkdemo-v2
npm install
cp .env.example .env.local
```

### 3.1 zkWallet adapter mock mode

```bash
cd /Users/junwoo/zkrypto/zkwallet-adapter
npm install
cp .env.example .env
npm start
```

다른 터미널에서 확인한다.

```bash
curl -s http://127.0.0.1:8090/wallet/adapter/health
curl -s -X POST http://127.0.0.1:8090/wallet/adapter/cases/FU-1/run \
  -H 'Content-Type: application/json' \
  -d '{"inputs":{}}'
```

mock mode는 wallet-api credential 없이 동작한다. 데모 UI에서 zkWallet 시나리오에 들어가면 adapter run이 자동 실행된다.

### 3.2 zkPoL backend

```bash
cd /Users/junwoo/zkrypto/zk-pol
ZKPOL_MEMORY=4g ZKPOL_CPUS=4 docker compose up -d \
  mariadb manager-mariadb zkpol-manager zkpol zkpol-event-generator
```

기동 확인:

```bash
curl -i http://127.0.0.1:21001/actuator/health
curl -i http://127.0.0.1:21000/
curl -s http://127.0.0.1:21001/api/dashboard/public/overview
```

이상징후 주입 뒤 같은 토큰이 차단되어 반복 시연이 꼬이면 다음 스크립트로 DB volume까지 비우고 다시 시작한다. 이 명령은 `zk-pol` compose volume을 지우므로 로컬 데모용으로만 쓴다.

```bash
cd /Users/junwoo/zkrypto/zk-pol
./reset-demo.sh
```

### 3.3 zkPoL native dashboard dev server

`ZP-D` 운영 대시보드 iframe을 로컬 dev에서 보려면 dashboard dev server를 `8086`에 띄운다.

```bash
cd /Users/junwoo/zkrypto/zk-pol/zkpol-manager/frontend
npm install
VITE_DASHBOARD_BASENAME=/pol/dash \
VITE_API_BASE_URL=/pol/mgr \
VITE_GENERATOR_BASE_URL=/pol/gen \
VITE_USE_DASHBOARD_FIXTURES=false \
npm run dev -- --host 0.0.0.0 --port 8086
```

`zkdemo-v2` Vite dev server가 `/pol/dash`를 `8086`으로 프록시하고, dashboard 내부 API 호출은 다시 `zkdemo-v2`의 `/pol/mgr`, `/pol/gen` 프록시를 탄다.

### 3.4 zkdemo-v2 frontend

```bash
cd /Users/junwoo/zkrypto/zkdemo-v2
npm run dev -- --host 0.0.0.0
```

브라우저:

```text
http://127.0.0.1:5173/
http://127.0.0.1:5173/zkwallet/personal/FU-1/0
http://127.0.0.1:5173/zkwallet/personal/FU-2/0
http://127.0.0.1:5173/zkpol/risk/ZP-1/0
http://127.0.0.1:5173/zkpol/risk/ZP-4/0
http://127.0.0.1:5173/zkpol/risk/ZP-D/0
```

## 4. `.env.local` 기준값

로컬 dev는 `.env.example`을 복사하면 된다. 전체 변수 의미는 아래와 같다.

```bash
# zkWallet adapter, local dev
VITE_ZKWALLET_ADAPTER_BASE_URL=/wallet/adapter
VITE_ZKWALLET_ADAPTER_AUTORUN=true
VITE_ZKWALLET_ADAPTER_PROXY_TARGET=http://127.0.0.1:8090

# zkPoL manager/event-generator
VITE_ZKPOL_MGR_BASE_URL=/pol/mgr
VITE_ZKPOL_GEN_BASE_URL=/pol/gen
VITE_ZKPOL_MGR_PROXY_TARGET=http://127.0.0.1:21001
VITE_ZKPOL_GEN_PROXY_TARGET=http://127.0.0.1:21000

# zkPoL native dashboard iframe target in Vite dev
VITE_ZKPOL_DASH_PROXY_TARGET=http://127.0.0.1:8086

# Display/session token prefix. Actual demo token becomes BTC-<timestamp>.
VITE_ZKPOL_DEMO_TOKEN=BTC
```

Vite env를 바꾼 뒤에는 `npm run dev`를 재시작한다.

## 5. zkWallet live mode

실제 wallet-api에 붙이려면 `zkwallet-adapter/.env`를 live mode로 바꾼다.

```bash
cd /Users/junwoo/zkrypto/zkwallet-adapter
cp .env.example .env
```

필수값:

```bash
WALLET_API_MODE=live
WALLET_API_BASE_URL=http://127.0.0.1:20001
WALLET_API_CLIENT_ID=...
WALLET_API_CLIENT_PRIVATE_KEY_PEM=...
# 또는 WALLET_API_CLIENT_PRIVATE_KEY_B64URL=...
WALLET_API_ADMIN_CLIENT_ID=...
WALLET_API_ADMIN_CLIENT_PRIVATE_KEY_PEM=...
# 또는 WALLET_API_ADMIN_CLIENT_PRIVATE_KEY_B64URL=...
WALLET_API_TENANT_ID=...
```

로컬 `zksanctum` wallet-api를 쓰는 경우 `zksanctum/scripts/full-e2e.sh bootstrap`이 출력하는 `SERVICE_CLIENT_*`, `ADMIN_CLIENT_*`, `E2E_TENANT_UUID`를 위 값에 매핑한다.

FU-2를 실제 EVM 전송까지 붙이고 싶으면 adapter env에 `CHAIN_RPC_URL`을 추가한다. 비워두면 tx broadcast는 mock이다.

```bash
CHAIN_RPC_URL=http://127.0.0.1:8545
CHAIN_FUNDER_PRIVATE_KEY=<local test funder private key>
```

Hardhat local chain 예:

```bash
cd /Users/junwoo/zkrypto/contract-manager
npx hardhat node --hostname 127.0.0.1 --port 8545
```

adapter 재시작:

```bash
cd /Users/junwoo/zkrypto/zkwallet-adapter
npm start
curl -s http://127.0.0.1:8090/wallet/adapter/health
```

## 6. 시연 흐름

### zkWallet

1. `/zkwallet`로 진입한다.
2. `개인 사용자 거래`, `디지털 자산 수탁사`, `스테이블코인 발행사` 중 하나를 선택한다.
3. 시나리오 페이지가 열리면 adapter badge가 `adapter 연결 중` -> `adapter OK`로 바뀐다.
4. 화면은 기존 데모 스텝대로 재생되며, wallet-api/adapter 결과값이 필드에 주입된다.
5. 같은 케이스를 처음부터 새로 만들려면 상단 `리셋`을 누른다. 해당 케이스 실행 이력, 서명, 케이스 카테고리 지갑이 adapter state에서 지워지고 새 keygen부터 다시 실행된다.

주요 케이스:

| 경로 | 의미 |
|---|---|
| `/zkwallet/personal/FU-1/0` | 개인 지갑 생성 |
| `/zkwallet/personal/FU-2/0` | 개인 거래 서명 |
| `/zkwallet/custody/CU-1/0` | 수탁 지갑 개설 |
| `/zkwallet/custody/CU-2/0` | 수탁 입금 |
| `/zkwallet/custody/CU-3/0` | 수탁 출금 |
| `/zkwallet/issuer/IS-1/0` | 발행사 지갑 생성 |
| `/zkwallet/issuer/FS-2/0` | 발행 요청 |
| `/zkwallet/issuer/FS-3/0` | 상환/소각 요청 |

### zkPoL

`ZP-1`과 `ZP-4`는 시나리오형 step UI다. 첫 사용자 액션이 실제 backend trigger를 호출한다.

| 경로 | 액션 | 결과 |
|---|---|---|
| `/zkpol/risk/ZP-1/0` | 첫 CTA에서 `startDemoPipeline()` 실행 | 새 BTC 세션, deploy, bootstrap, scheduler start, normal stream |
| `/zkpol/risk/ZP-4/0` | 첫 CTA에서 `injectAnomaly()` 실행 | 비정상 burst, invariant violation, incident |
| `/zkpol/risk/ZP-D/0` | iframe dashboard | native operator/public dashboard, 같은 세션 공유 |

`ZP-1`, `ZP-4` 페이지를 벗어나면 `stopStream()`을 호출해 백그라운드 이벤트 생성을 멈춘다. `ZP-D`는 운영 대시보드라 예외다.

## 7. 정적 빌드와 로컬 production smoke

정적 배포 모드에서는 `deploy/web-server.cjs`가 `dist/`를 서빙하고 backend prefix를 프록시한다.

### 7.1 zkPoL native dashboard dist 만들기

```bash
cd /Users/junwoo/zkrypto/zk-pol/zkpol-manager/frontend
VITE_DASHBOARD_BASENAME=/pol/dash \
VITE_API_BASE_URL=/pol/mgr \
VITE_GENERATOR_BASE_URL=/pol/gen \
VITE_USE_DASHBOARD_FIXTURES=false \
npm run build

rm -rf /Users/junwoo/zkrypto/zkdemo-v2/pol-dash
cp -R dist /Users/junwoo/zkrypto/zkdemo-v2/pol-dash
```

### 7.2 zkdemo-v2 dist 만들기

로컬 production smoke에서 `/wallet/api` 경로를 쓰려면 adapter도 `/wallet/api`로 띄운다.

```bash
cd /Users/junwoo/zkrypto/zkwallet-adapter
ADAPTER_HOST=127.0.0.1 \
ADAPTER_PORT=8080 \
PUBLIC_BASE_PATH=/wallet/api \
WALLET_API_MODE=mock \
npm start
```

프론트 빌드:

```bash
cd /Users/junwoo/zkrypto/zkdemo-v2
VITE_ZKWALLET_ADAPTER_BASE_URL=/wallet/api \
VITE_ZKWALLET_ADAPTER_AUTORUN=true \
VITE_ZKPOL_MGR_BASE_URL=/pol/mgr \
VITE_ZKPOL_GEN_BASE_URL=/pol/gen \
VITE_ZKPOL_DEMO_TOKEN=BTC \
npm run build
```

정적 서버 실행:

```bash
cd /Users/junwoo/zkrypto/zkdemo-v2
WEB_HOST=0.0.0.0 \
WEB_PORT=8088 \
ADAPTER_HOST=127.0.0.1 \
ADAPTER_PORT=8080 \
POL_MGR_HOST=127.0.0.1 \
POL_MGR_PORT=21001 \
POL_GEN_HOST=127.0.0.1 \
POL_GEN_PORT=21000 \
POL_DASH_DIST=/Users/junwoo/zkrypto/zkdemo-v2/pol-dash \
node deploy/web-server.cjs
```

브라우저:

```text
http://127.0.0.1:8088/
http://127.0.0.1:8088/wallet/api/health
http://127.0.0.1:8088/pol/dash/operator
```

## 8. VM 배포 핵심값

VM에서는 adapter가 `/wallet/api` 슬롯을 차지한다.

zkwallet-adapter systemd 권장값:

```bash
ADAPTER_HOST=127.0.0.1
ADAPTER_PORT=8080
PUBLIC_BASE_PATH=/wallet/api
WALLET_API_MODE=live
WALLET_API_BASE_URL=http://127.0.0.1:18080
WALLET_API_CLIENT_ID=...
WALLET_API_CLIENT_PRIVATE_KEY_B64URL=...
WALLET_API_ADMIN_CLIENT_ID=...
WALLET_API_ADMIN_CLIENT_PRIVATE_KEY_B64URL=...
WALLET_API_TENANT_ID=...
```

zkdemo-v2 VM build:

```bash
cd /Users/junwoo/zkrypto/zkdemo-v2
VITE_ZKWALLET_ADAPTER_BASE_URL=/wallet/api \
VITE_ZKWALLET_ADAPTER_AUTORUN=true \
VITE_ZKPOL_MGR_BASE_URL=/pol/mgr \
VITE_ZKPOL_GEN_BASE_URL=/pol/gen \
VITE_ZKPOL_DEMO_TOKEN=BTC \
npm run build
```

정적 서버:

```bash
WEB_PORT=80 node deploy/web-server.cjs
```

프록시 계약:

| 공개 경로 | upstream | 비고 |
|---|---|---|
| `/wallet/api` | zkwallet-adapter `127.0.0.1:8080` | prefix 유지, adapter `PUBLIC_BASE_PATH=/wallet/api` 필요 |
| `/pol/mgr` | zkpol-manager `127.0.0.1:21001` | prefix strip |
| `/pol/gen` | zkpol-event-generator `127.0.0.1:21000` | prefix strip |
| `/pol/dash` | `POL_DASH_DIST` 정적 파일 | dashboard build basename `/pol/dash` 필요 |

## 9. 검증 체크리스트

### Frontend

```bash
cd /Users/junwoo/zkrypto/zkdemo-v2
npm run build
```

### zkWallet adapter

```bash
cd /Users/junwoo/zkrypto/zkwallet-adapter
npm run check
curl -s http://127.0.0.1:8090/wallet/adapter/health
curl -s -X POST http://127.0.0.1:8090/wallet/adapter/cases/FU-2/run \
  -H 'Content-Type: application/json' \
  -d '{"inputs":{"amount":"50000"}}'
```

VM/static path:

```bash
curl -s http://127.0.0.1:8080/wallet/api/health
curl -s -X POST http://127.0.0.1:8080/wallet/api/cases/FU-1/run \
  -H 'Content-Type: application/json' \
  -d '{"inputs":{}}'
```

### zkPoL

```bash
curl -s http://127.0.0.1:21001/actuator/health
curl -s http://127.0.0.1:21000/
curl -s http://127.0.0.1:21001/api/dashboard/public/coins
curl -s http://127.0.0.1:21000/api/tokens/BTC/pipeline-state-counts
```

### Browser smoke

1. `/zkwallet/personal/FU-1/0` -> adapter badge `adapter OK`.
2. `/zkwallet/personal/FU-2/0` -> `Sign ID`, `Raw Signature`, `Tx Hash` 표시.
3. `/zkpol/risk/ZP-1/0` -> 첫 CTA 후 compact console에 거래/검증 로그 증가.
4. `/zkpol/risk/ZP-4/0` -> 첫 CTA 후 incident 표시.
5. `/zkpol/risk/ZP-D/0` -> iframe dashboard 로드, public/operator 링크 작동.

## 10. 자주 나는 문제

| 증상 | 원인 | 조치 |
|---|---|---|
| zkwallet adapter badge가 오류 | adapter 미기동 또는 base path mismatch | 로컬은 `/wallet/adapter:8090`, VM은 `/wallet/api:8080` 확인 |
| `Adapter response is not valid JSON` | 프론트가 backend 대신 SPA HTML을 받은 경우 | `VITE_ZKWALLET_ADAPTER_BASE_URL`과 proxy/web-server 경로 확인 |
| `/wallet/api/health` 404 | adapter가 `/wallet/api`로 mount되지 않음 | adapter env `PUBLIC_BASE_PATH=/wallet/api` |
| zkPoL console이 계속 비어 있음 | zk-pol stack 미기동 또는 stream 미시작 | `21001`, `21000` health 확인 후 ZP-1 첫 CTA 재실행 |
| ZP-4 재시연이 꼬임 | 이전 세션 token이 invariant block 상태 | `zk-pol/reset-demo.sh`로 compose volume 초기화 |
| `/pol/dash` 404 | dashboard dist 없음 또는 dev server 미기동 | dev는 dashboard `8086`, static은 `pol-dash` dist 생성 |
| native dashboard router 404 | dashboard basename 불일치 | build/dev 시 `VITE_DASHBOARD_BASENAME=/pol/dash` |
| Vite proxy가 갑자기 사라짐 | stale `vite.config.js`가 루트에 복구됨 | 루트는 `vite.config.ts`만 사용. `.stale-backup/`의 파일을 되살리지 말 것 |
| FU-2 live sign `keygen session not found` | wallet-api/MPC manager 재시작으로 stale key | adapter self-heal 후 재시도. 계속 실패하면 케이스 `리셋` 또는 `POST /demo/reset` |

## 11. 파일 지도

| 파일 | 역할 |
|---|---|
| `src/api/adapterClient.ts` | zkwallet-adapter client, case run/reset |
| `src/hooks/useAdapterScenarioRun.ts` | zkWallet 시나리오 autorun/reset |
| `src/api/polClient.ts` | zkPoL manager 조회 API |
| `src/api/polControlClient.ts` | zkPoL generator 제어 API |
| `src/components/zkpol/ZkpolCompactConsole.tsx` | ZP-1/ZP-4 step 내 compact console |
| `src/components/zkpol/ZkpolLiveDashboard.tsx` | ZP-D native dashboard iframe |
| `src/pages/ScenarioPage.tsx` | adapter run, zkPoL trigger, live view 분기 |
| `vite.config.ts` | Vite dev proxy |
| `deploy/web-server.cjs` | 정적 배포 서버 + backend proxy + `/pol/dash` mount |
| `.env.example` | 로컬 dev 기본 public env |

