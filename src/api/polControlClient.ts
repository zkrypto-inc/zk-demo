// zkPoL(event-generator) 제어 클라이언트 — 데모 인터랙션용.
// event-generator가 거래소 원장 이벤트를 생성하고 zkpol 배치 스케줄러를 제어한다.
// 프록시에서 base prefix를 strip해 generator 루트(/api/...)로 보낸다.

const GEN_BASE = (import.meta.env.VITE_ZKPOL_GEN_BASE_URL?.trim() || "/pol/gen").replace(/\/+$/, "");

export const DEMO_TOKEN_ID = (import.meta.env.VITE_ZKPOL_DEMO_TOKEN?.trim() || "BTC");
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

export const stopStream = (tokenId = DEMO_TOKEN_ID) =>
  post("/api/generator/stream/stop", { token_id: tokenId });

// 이상징후 주입 (비정상 이벤트 버스트 — ZP-4 트리거)
export const injectAnomaly = (tokenId = DEMO_TOKEN_ID, count = 100) =>
  post("/api/generator/burst", {
    token_id: tokenId,
    user_count: DEMO_USER_COUNT,
    count,
    valid_only: false,
  });

// 이미 배포/부트스트랩/실행 중(409 state_conflict)인 단계는 정상으로 간주하고 무시.
function ignoreConflict(e: unknown) {
  if (e instanceof PolControlError && (e.status === 409 || e.status === 400)) return undefined;
  throw e;
}

// 데모 시작 원클릭: 컨트랙트 배포 → bootstrap → 스케줄러 → 정상 스트림.
// 각 단계는 이미 완료된 상태면 충돌(409)을 무시하므로 재클릭/부분상태에도 안전.
export async function startDemoPipeline(tokenId = DEMO_TOKEN_ID) {
  await deployContract(tokenId).catch(ignoreConflict);
  await bootstrapToken(tokenId).catch(ignoreConflict);
  await startBatchScheduler(tokenId).catch(ignoreConflict);
  await startStream(tokenId).catch(ignoreConflict);
}
