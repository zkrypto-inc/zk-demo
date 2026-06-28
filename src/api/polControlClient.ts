// zkPoL(event-generator) 제어 클라이언트 — 데모 인터랙션용.
// event-generator가 거래소 원장 이벤트를 생성하고 zkpol 배치 스케줄러를 제어한다.
// 프록시에서 base prefix를 strip해 generator 루트(/api/...)로 보낸다.

const GEN_BASE = (import.meta.env.VITE_ZKPOL_GEN_BASE_URL?.trim() || "/pol/gen").replace(/\/+$/, "");

export const DEMO_TOKEN_ID = (import.meta.env.VITE_ZKPOL_DEMO_TOKEN?.trim() || "BTC");
// 이상징후는 별도 토큰에 주입한다. 같은 토큰에 넣으면 invariant 차단이 정상 스트림(ZP-1)까지
// 막아버리므로, ZP-4 데모는 전용 토큰을 써서 ZP-1 흐름과 분리한다.
export const ANOMALY_TOKEN_ID = (import.meta.env.VITE_ZKPOL_ANOMALY_TOKEN?.trim() || "ETH");
const DEMO_USER_COUNT = 1000;
const DEMO_INITIAL_BALANCE = 100_000;

export class PolControlError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "PolControlError";
    this.status = status;
  }
}

async function post<T = unknown>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${GEN_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let payload: unknown = undefined;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }
  if (!res.ok) {
    const msg = typeof payload === "object" && payload && "message" in payload ? String((payload as { message: unknown }).message) : `제어 실패 (${res.status}) ${path}`;
    throw new PolControlError(msg, res.status);
  }
  return payload as T;
}

// 온체인 게시판 컨트랙트 배포 (bootstrap 선행 필수)
export const deployContract = (tokenId = DEMO_TOKEN_ID) =>
  post(`/api/tokens/${encodeURIComponent(tokenId)}/contracts/deploy`, {});

// 토큰(코인) 초기화 — 사용자/초기잔고 세팅
export const bootstrapToken = (tokenId = DEMO_TOKEN_ID) =>
  post("/api/bootstrap", {
    token_id: tokenId,
    user_count: DEMO_USER_COUNT,
    initial_balance: DEMO_INITIAL_BALANCE,
  });

// zkpol 배치 증명 스케줄러 시작 (증명 생성 활성화)
export const startBatchScheduler = (tokenId = DEMO_TOKEN_ID) =>
  post(`/api/zkpol/tokens/${encodeURIComponent(tokenId)}/schedulers/batch/start`);

export const stopBatchScheduler = (tokenId = DEMO_TOKEN_ID) =>
  post(`/api/zkpol/tokens/${encodeURIComponent(tokenId)}/schedulers/batch/stop`);

// 정상 원장 이벤트 스트림 시작 (상시 운영 시뮬 — ZP-1)
export const startStream = (tokenId = DEMO_TOKEN_ID, eventsPerSecond = 50) =>
  post("/api/generator/stream/start", {
    token_id: tokenId,
    user_count: DEMO_USER_COUNT,
    events_per_second: eventsPerSecond,
    valid_only: true,
  });

// 스트림 정지. 이미 멈춰있으면(409 no active stream) 정상으로 간주.
export const stopStream = (tokenId = DEMO_TOKEN_ID) =>
  post("/api/generator/stream/stop", { token_id: tokenId }).catch((e) => {
    if (e instanceof PolControlError && e.status === 409) return { alreadyStopped: true };
    throw e;
  });

// 이상징후 주입 (비정상 이벤트 버스트 — ZP-4 트리거). 전용 토큰을 먼저 준비한 뒤 주입해
// ZP-1(정상 BTC) 흐름과 분리한다.
export async function injectAnomaly(tokenId = ANOMALY_TOKEN_ID, count = 100) {
  await deployContract(tokenId).catch(ignoreConflict);
  await bootstrapToken(tokenId).catch(ignoreConflict);
  await startBatchScheduler(tokenId).catch(ignoreConflict);
  return post("/api/generator/burst", {
    token_id: tokenId,
    user_count: DEMO_USER_COUNT,
    count,
    valid_only: false,
  });
}

// 이미 배포/부트스트랩/실행 중(409 state_conflict)인 단계는 정상으로 간주하고 무시.
function ignoreConflict(e: unknown) {
  if (e instanceof PolControlError && (e.status === 409 || e.status === 400)) return undefined;
  throw e;
}

export type PolPipelineCounts = {
  ledger_change_event_count: number;
  latest_event_id: number;
  prove_pending_event_count: number;
  submit_pending_event_count: number;
  finalize_pending_event_count: number;
  archive_pending_event_count: number;
};

// 파이프라인 단계별 처리 건수 (라이브 카운터용). 스트림이 돌면 계속 증가한다.
export async function getPipelineCounts(tokenId = DEMO_TOKEN_ID): Promise<PolPipelineCounts> {
  const res = await fetch(`${GEN_BASE}/api/tokens/${encodeURIComponent(tokenId)}/pipeline-state-counts`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new PolControlError(`pipeline counts 조회 실패 (${res.status})`, res.status);
  return res.json();
}

// 데모 시작 원클릭: 컨트랙트 배포 → bootstrap → 스케줄러 → 정상 스트림.
// 각 단계는 이미 완료된 상태면 충돌(409)을 무시하므로 재클릭/부분상태에도 안전.
export async function startDemoPipeline(tokenId = DEMO_TOKEN_ID) {
  await deployContract(tokenId).catch(ignoreConflict);
  await bootstrapToken(tokenId).catch(ignoreConflict);
  await startBatchScheduler(tokenId).catch(ignoreConflict);
  await startStream(tokenId).catch(ignoreConflict);
}
