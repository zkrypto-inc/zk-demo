// zkPoL(event-generator) 제어 클라이언트 — 데모 인터랙션용.
// event-generator가 거래소 원장 이벤트를 생성하고 zkpol 배치 스케줄러를 제어한다.
// 프록시에서 base prefix를 strip해 generator 루트(/api/...)로 보낸다.

const GEN_BASE = (import.meta.env.VITE_ZKPOL_GEN_BASE_URL?.trim() || "/pol/gen").replace(/\/+$/, "");

// 표시용 기본 코인명. 실제 토큰 id는 세션마다 "BTC-xxxx"로 회전한다(아래 참고).
export const DEMO_TOKEN_ID = (import.meta.env.VITE_ZKPOL_DEMO_TOKEN?.trim() || "BTC");
const DEMO_USER_COUNT = 1000;
const DEMO_INITIAL_BALANCE = 100_000;

// --- 데모 세션 토큰 회전 ---
// 이상징후를 주입하면 그 토큰의 파이프라인이 invariant로 차단된다(=지급 차단, 의도된 동작).
// 차단된 토큰은 복구 API가 없으므로, "거래소 운영 시작"을 누를 때마다 새 세션 토큰을 발급해
// 항상 깨끗한 BTC에서 시작한다. 화면에는 항상 기본 코인명("BTC")으로 표시한다. → 무한 반복 가능.
const SESSION_KEY = "zkpol-demo-token";

export function currentDemoToken(): string {
  try {
    return localStorage.getItem(SESSION_KEY) || DEMO_TOKEN_ID;
  } catch {
    return DEMO_TOKEN_ID;
  }
}

function newDemoSession(): string {
  const token = `${DEMO_TOKEN_ID}-${Date.now().toString(36)}`;
  try {
    localStorage.setItem(SESSION_KEY, token);
  } catch {
    /* localStorage 불가 시 기본 토큰 사용 */
  }
  return token;
}

// 실제 토큰 id("BTC-xxxx")를 표시용 코인명("BTC")으로 환원.
export function displayToken(tokenId: string): string {
  return tokenId.split("-")[0];
}

// 현재 세션 토큰에 속하는 항목만(표시 코인명 기준) 필터링하는 헬퍼.
export function isCurrentSession(tokenId: string): boolean {
  return tokenId === currentDemoToken();
}

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
export const deployContract = (tokenId = currentDemoToken()) =>
  post(`/api/tokens/${encodeURIComponent(tokenId)}/contracts/deploy`, {});

// 토큰(코인) 초기화 — 사용자/초기잔고 세팅
export const bootstrapToken = (tokenId = currentDemoToken()) =>
  post("/api/bootstrap", {
    token_id: tokenId,
    user_count: DEMO_USER_COUNT,
    initial_balance: DEMO_INITIAL_BALANCE,
  });

// zkpol 배치 증명 스케줄러 시작 (증명 생성 활성화)
export const startBatchScheduler = (tokenId = currentDemoToken()) =>
  post(`/api/zkpol/tokens/${encodeURIComponent(tokenId)}/schedulers/batch/start`);

export const stopBatchScheduler = (tokenId = currentDemoToken()) =>
  post(`/api/zkpol/tokens/${encodeURIComponent(tokenId)}/schedulers/batch/stop`);

// 정상 원장 이벤트 스트림 시작 (상시 운영 시뮬 — ZP-1)
// eps는 배치(고정 크기 936)가 자주 차서 검증 로그가 눈에 띄게 쌓이도록 높게 잡는다.
// (배치 크기는 프루버 회로 제약이라 못 줄임 → 유입 속도로 배치 빈도를 확보)
export const startStream = (tokenId = currentDemoToken(), eventsPerSecond = 300) =>
  post("/api/generator/stream/start", {
    token_id: tokenId,
    user_count: DEMO_USER_COUNT,
    events_per_second: eventsPerSecond,
    valid_only: true,
  });

// 스트림 정지. 이미 멈춰있으면(409 no active stream) 정상으로 간주.
export const stopStream = (tokenId = currentDemoToken()) =>
  post("/api/generator/stream/stop", { token_id: tokenId }).catch((e) => {
    if (e instanceof PolControlError && e.status === 409) return { alreadyStopped: true };
    throw e;
  });

// 이상징후 주입 (비정상 BTC 원장 이벤트 — ZP-4 트리거). 거래 중인 BTC에 그대로 주입해
// "정상 거래 중 이상 거래 유입 → 감지 → 지급 차단" 내러티브를 보인다.
// 주의: invariant 위반이 BTC 파이프라인을 차단하므로(=지급 차단), 재시연하려면 데모 초기화 필요.
export async function injectAnomaly(tokenId = currentDemoToken(), count = 100) {
  // BTC가 아직 준비 안 됐으면 준비(거래 시작 안 누르고 ZP-4부터 본 경우 대비)
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
export async function getPipelineCounts(tokenId = currentDemoToken()): Promise<PolPipelineCounts> {
  const res = await fetch(`${GEN_BASE}/api/tokens/${encodeURIComponent(tokenId)}/pipeline-state-counts`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new PolControlError(`pipeline counts 조회 실패 (${res.status})`, res.status);
  return res.json();
}

// 데모 시작 원클릭: 새 BTC 세션 발급 → 컨트랙트 배포 → bootstrap → 스케줄러 → 정상 스트림.
// 매번 새 세션이라 이전에 차단된 토큰과 무관하게 항상 깨끗하게 시작한다(무한 반복).
export async function startDemoPipeline() {
  // 이전 세션 스트림을 정지해 동시 스트림 누적을 막는다(없으면 409 무시).
  await stopStream(currentDemoToken()).catch(() => undefined);
  const tokenId = newDemoSession();
  await deployContract(tokenId).catch(ignoreConflict);
  await bootstrapToken(tokenId).catch(ignoreConflict);
  await startBatchScheduler(tokenId).catch(ignoreConflict);
  await startStream(tokenId).catch(ignoreConflict);
}

// --- 통합 운영 모델 (v2.3) ---
// 거래소 운영(세션)은 하나로 공유한다. 시작/정지/재시작은 운영 대시보드에서만 하고,
// zkPoL 진입 시 세션이 없으면 자동 시작, ZP-1/ZP-4는 그 세션에 정상/비정상 거래를 얹는다.

// 브라우저 언로드(탭 닫기·새로고침) 중 세션 스트림 정지 요청.
// 일반 fetch는 언로드 중 취소될 수 있어 keepalive로 전송을 보장한다(다중 사용자 좀비 스트림 방지).
export function stopStreamOnUnload(tokenId = currentDemoToken()): void {
  try {
    void fetch(`${GEN_BASE}/api/generator/stream/stop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token_id: tokenId }),
      keepalive: true,
    });
  } catch {
    /* 언로드 중 실패는 무시 */
  }
}

// 현재 세션의 원장 스트림이 도는지(=거래소 운영 중) 조회.
export async function isExchangeRunning(tokenId = currentDemoToken()): Promise<boolean> {
  try {
    const res = await fetch(`${GEN_BASE}/api/generator/stream?token_id=${encodeURIComponent(tokenId)}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return false;
    const payload = (await res.json()) as { active?: boolean };
    return payload.active === true;
  } catch {
    return false;
  }
}

// zkPoL 진입 시 호출: 거래소가 이미 운영 중이면 그대로 두고, 아니면 새 세션으로 운영 시작.
// (동시 호출 방지를 위해 진행 중 Promise를 공유한다)
let ensurePromise: Promise<void> | null = null;
export function ensureExchangeRunning(): Promise<void> {
  if (ensurePromise) return ensurePromise;
  ensurePromise = (async () => {
    if (await isExchangeRunning()) return;
    await startDemoPipeline();
  })().finally(() => {
    ensurePromise = null;
  });
  return ensurePromise;
}

// 사용자가 제출한 거래는 '제출 시점 이후 처음 생성되는 배치'에 담긴다.
// 그 기준(제출 직전 최대 batchSeq)을 세션과 함께 기록해, 콘솔이 내 거래 배치를 특정한다.
const MY_BATCH_KEY = "zkpol-my-batch-baseline";
export function setMyBatchBaseline(baselineSeq: number, tokenId = currentDemoToken()) {
  try {
    localStorage.setItem(MY_BATCH_KEY, JSON.stringify({ token: tokenId, baseline: baselineSeq }));
  } catch {
    /* localStorage 불가 시 무시 */
  }
}
export function getMyBatchBaseline(): number | null {
  try {
    const raw = localStorage.getItem(MY_BATCH_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as { token: string; baseline: number };
    return v.token === currentDemoToken() ? v.baseline : null;
  } catch {
    return null;
  }
}

// ZP-1: 운영 중 거래소에 '정상 거래'가 흐르게 한다(세션 유지). 세션이 없으면 먼저 시작.
// ⚠ 정상 거래는 스트림(초당 수백 건)이 이미 계속 생성 중이므로, burst로 1건을 더 넣지 않는다.
// 스트림이 도는 중 같은 계정에 burst를 주입하면 old_value가 stale해져 invariant 위반(=경합)이 난다.
// 사용자의 '제출'은 baseline 시점 이후 스트림이 만드는 첫 배치를 '내 거래'로 표시하는 것으로 대신한다.
export async function submitNormalTransaction(): Promise<string> {
  await ensureExchangeRunning();
  return currentDemoToken();
}

// ZP-4: 운영 중 거래소에 '비정상 거래 1건'을 주입한다(세션 유지). 세션이 없으면 먼저 시작.
export async function submitAnomalyTransaction(): Promise<string> {
  await ensureExchangeRunning();
  const tokenId = currentDemoToken();
  await injectAnomaly(tokenId);
  return tokenId;
}
