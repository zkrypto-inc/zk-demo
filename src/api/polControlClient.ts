// zkPoL(event-generator) 제어 클라이언트 — 데모 인터랙션용.
// event-generator가 원장 이벤트를 생성하고 zkpol 배치 스케줄러를 제어한다.
// 프록시에서 base prefix를 strip해 generator 루트(/api/...)로 보낸다.

const GEN_BASE = (import.meta.env.VITE_ZKPOL_GEN_BASE_URL?.trim() || "/pol/gen").replace(/\/+$/, "");

// 표시용 기본 코인명. 실제 토큰 id는 세션마다 "<coin>-xxxx"로 회전한다(아래 참고).
export const DEMO_TOKEN_ID = (import.meta.env.VITE_ZKPOL_DEMO_TOKEN?.trim() || "BTC");
const DEMO_USER_COUNT = 1000;
const DEMO_INITIAL_BALANCE = 100_000;

// --- 제품 라인(거래소 vs 스테이블코인) 분리 ---
// 두 라인은 "같은 백엔드"의 서로 다른 토큰(BTC-xxxx / KRWSC-xxxx)으로 독립 파이프라인을 돌린다.
// (백엔드 API가 전부 /api/tokens/{token_id}/... 라 토큰 단위 멀티테넌트.) 세션 키·배치 baseline
// 키도 라인별로 분리해 거래소와 스테이블코인이 서로 섞이지 않는다.
export type PolLine = "exchange" | "stablecoin";
const LINE: Record<PolLine, { coin: string; sessionKey: string; batchKey: string; ledgerKey: string }> = {
  exchange: {
    coin: DEMO_TOKEN_ID,
    sessionKey: "zkpol-demo-token",
    batchKey: "zkpol-my-batch-baseline",
    ledgerKey: "zkpol-demo-sessions",
  },
  stablecoin: {
    coin: import.meta.env.VITE_ZKPOL_STABLE_TOKEN?.trim() || "KRWSC",
    sessionKey: "zkpol-demo-token-stable",
    batchKey: "zkpol-my-batch-baseline-stable",
    ledgerKey: "zkpol-demo-sessions-stable",
  },
};

// 시나리오 id로 라인 판별. ZPS-* = 스테이블코인, 그 외(ZP-*) = 거래소.
export function lineForScenario(scenarioId: string): PolLine {
  return scenarioId.startsWith("ZPS") ? "stablecoin" : "exchange";
}

// --- 데모 세션 토큰 회전 (라인별) ---
// 이상징후를 주입하면 그 토큰의 파이프라인이 invariant로 차단된다(=지급 차단, 의도된 동작).
// 차단된 토큰은 복구 API가 없으므로, 운영 시작 때마다 새 세션 토큰을 발급해 항상 깨끗하게 시작한다.
export function currentDemoToken(line: PolLine = "exchange"): string {
  const cfg = LINE[line];
  try {
    return localStorage.getItem(cfg.sessionKey) || cfg.coin;
  } catch {
    return cfg.coin;
  }
}

// --- 세션 원장 ---
// 이 브라우저가 발급한 세션 토큰을 발급 시점에 기록해둔다. 정리할 때 서버 목록에서
// "BTC- 로 시작하는 토큰"을 역추론하지 않고 이 원장만 보면 되므로, manager 폴링(15초)
// 지연과 무관하고 대상도 내가 만든 것으로 한정된다(전체 토큰 스탬피드 방지).
// 정지에 성공한 토큰만 원장에서 지우므로, 실패한 정지는 다음 시작 때 자동 재시도된다.
const LEDGER_MAX = 20; // 백엔드가 계속 죽어 있어도 원장이 무한히 커지지 않게 상한을 둔다.

function ledgerRead(line: PolLine): string[] {
  try {
    const raw = localStorage.getItem(LINE[line].ledgerKey);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === "string") : [];
  } catch {
    return [];
  }
}

function ledgerWrite(line: PolLine, tokens: string[]): void {
  try {
    localStorage.setItem(LINE[line].ledgerKey, JSON.stringify(tokens.slice(-LEDGER_MAX)));
  } catch {
    /* localStorage 불가 시 원장 없이 동작(직전 세션만 정리됨) */
  }
}

function ledgerAdd(line: PolLine, token: string): void {
  ledgerWrite(line, [...ledgerRead(line).filter((t) => t !== token), token]);
}

function newDemoSession(line: PolLine = "exchange"): string {
  const cfg = LINE[line];
  const token = `${cfg.coin}-${Date.now().toString(36)}`;
  try {
    localStorage.setItem(cfg.sessionKey, token);
  } catch {
    /* localStorage 불가 시 기본 토큰 사용 */
  }
  ledgerAdd(line, token);
  return token;
}

// 실제 토큰 id("BTC-xxxx"/"KRWSC-xxxx")를 표시용 코인명("BTC"/"KRWSC")으로 환원.
export function displayToken(tokenId: string): string {
  return tokenId.split("-")[0];
}

// 해당 라인의 현재 세션 토큰에 속하는 항목만 필터링하는 헬퍼.
export function isCurrentSession(tokenId: string, line: PolLine = "exchange"): boolean {
  return tokenId === currentDemoToken(line);
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

// 정상 원장 이벤트 스트림 시작 (상시 운영 시뮬 — ZP-1/ZPS-1)
// eps는 배치(고정 크기 936)가 ~6초마다 차도록 잡되, DB 부하(원장 이벤트 누적 → mariadb OOM)를
// 고려해 150으로 제한한다. (배치 크기는 프루버 회로 제약이라 못 줄임)
export const startStream = (tokenId = currentDemoToken(), eventsPerSecond = 150) =>
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

// 이상징후 주입 (비정상 원장 이벤트 — ZP-4/ZPS-4 트리거). 거래 중인 토큰에 그대로 주입해
// "정상 거래 중 이상 거래 유입 → 감지 → 지급 차단" 내러티브를 보인다.
// 주의: invariant 위반이 그 파이프라인을 차단하므로(=지급 차단), 재시연하려면 데모 초기화 필요.
export async function injectAnomaly(tokenId = currentDemoToken(), count = 100) {
  // 토큰이 아직 준비 안 됐으면 준비(거래 시작 안 누르고 ZP-4부터 본 경우 대비)
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

// 해당 라인의 "모든" 옛 세션(스트림 + 배치 스케줄러)을 정지한다 — 운영 시작 = 전체 초기화.
// 좀비 파이프라인이 쌓이면 프루버가 토큰마다 DB를 폴링해 커넥션 풀(32)이 고갈되고
// ("pool timed out") 원장 이벤트가 무한 누적돼 mariadb OOM까지 간다.
// 이미 멈춰 있거나(400/409) 서버가 모르는 토큰(404)은 "정지 완료"로 본다.
// 그 외 오류만 실패로 취급해 원장에 남긴다 — 그래야 다음 시작 때 재시도된다.
function stoppedOrAbsent(e: unknown) {
  if (e instanceof PolControlError && (e.status === 400 || e.status === 404 || e.status === 409)) return undefined;
  throw e;
}

// 스트림 정지가 실패해도 스케줄러 정지는 반드시 시도한다 — 좀비의 본체는 스케줄러 쪽이라
// 순차 await로 묶으면 앞이 실패했을 때 정작 중요한 정지가 건너뛰어진다.
async function stopPipeline(tokenId: string): Promise<void> {
  const results = await Promise.allSettled([
    stopStream(tokenId).catch(stoppedOrAbsent),
    stopBatchScheduler(tokenId).catch(stoppedOrAbsent),
  ]);
  if (results.some((r) => r.status === "rejected")) {
    throw new PolControlError(`파이프라인 정지 실패: ${tokenId}`, 0);
  }
}

async function stopLinePipelines(line: PolLine): Promise<void> {
  const prefix = `${LINE[line].coin}-`;
  // 원장 = 이 브라우저가 발급한 세션들. 직전 세션은 원장 도입 이전에 만들어졌을 수 있어 합친다.
  const pending = new Set(ledgerRead(line));
  const previous = currentDemoToken(line);
  if (previous.startsWith(prefix)) pending.add(previous);

  // 순차 처리 — 한꺼번에 수십 개를 던지면 프록시에서 일부가 실패하고, 그 실패가 조용히 묻힌다.
  const survivors: string[] = [];
  for (const tokenId of pending) {
    try {
      await stopPipeline(tokenId);
    } catch {
      survivors.push(tokenId); // 정지 실패 → 원장에 남겨 다음 시작 때 재시도
    }
  }
  ledgerWrite(line, survivors);

  void sweepLegacyPipelines(line, pending);
}

// 원장에 없는 옛 토큰(다른 탭·이전 방문·원장 도입 이전 세션)은 manager 목록으로 걷는다.
// 데모 시작을 막지 않도록 await하지 않고, 페이지 로드당 라인별 1회만 돈다.
const legacySwept: Record<PolLine, boolean> = { exchange: false, stablecoin: false };
async function sweepLegacyPipelines(line: PolLine, already: Set<string>): Promise<void> {
  if (legacySwept[line]) return;
  legacySwept[line] = true;
  const prefix = `${LINE[line].coin}-`;
  try {
    const { getPublicCoins } = await import("./polClient");
    const stale = (await getPublicCoins())
      .map((c) => c.tokenId)
      .filter((id) => id.startsWith(prefix) && !already.has(id));
    for (const tokenId of stale) {
      await stopPipeline(tokenId).catch(() => undefined);
    }
  } catch {
    /* 목록 조회 실패는 무시 — 원장 기반 정리가 본류다 */
  }
}

// 데모 시작 원클릭: 라인 전체 초기화 → 새 세션 발급 → 컨트랙트 배포 → bootstrap → 스케줄러 → 정상 스트림.
// 매번 새 세션이라 이전에 차단된 토큰과 무관하게 항상 깨끗하게 시작한다(무한 반복).
// 진행 중 호출은 같은 Promise를 공유한다 — 버튼 연타나 effect 중복 실행이 세션을 두 개
// 발급하면 그만큼 좀비가 는다. (ensureRunning* 밖에서 직접 부르는 대시보드·콘솔 버튼 대비)
const startPromise: Record<PolLine, Promise<void> | null> = { exchange: null, stablecoin: null };
export function startDemoPipeline(line: PolLine = "exchange"): Promise<void> {
  if (startPromise[line]) return startPromise[line]!;
  const p = (async () => {
    await stopLinePipelines(line);
    const tokenId = newDemoSession(line);
    await deployContract(tokenId).catch(ignoreConflict);
    await bootstrapToken(tokenId).catch(ignoreConflict);
    await startBatchScheduler(tokenId).catch(ignoreConflict);
    await startStream(tokenId).catch(ignoreConflict);
  })().finally(() => {
    startPromise[line] = null;
  });
  startPromise[line] = p;
  return p;
}

// --- 통합 운영 모델 (v2.3) ---
// 각 라인의 운영(세션)은 하나로 공유한다. 시작/정지/재시작은 운영 대시보드에서만 하고,
// zkPoL 진입 시 세션이 없으면 자동 시작, ZP-1/ZP-4(및 ZPS-1/ZPS-4)는 그 세션에 정상/비정상 거래를 얹는다.

// 브라우저 언로드(탭 닫기·새로고침) 중 세션 파이프라인 정지 요청.
// 일반 fetch는 언로드 중 취소될 수 있어 keepalive로 전송을 보장한다(다중 사용자 좀비 방지).
// ⚠ 스트림만 멈추면 안 된다: 이벤트 생성이 멈춰도 zkpol 배치 스케줄러는 "새 이벤트 있나"를
// 계속 폴링한다(루프가 stop 신호로만 빠져나온다). 그 좀비가 토큰마다 DB 커넥션을 잡아
// 풀(32)을 고갈시키는 것이 OOM의 출발점이므로, 스케줄러도 같이 정지한다.
function stopBeacon(path: string, body: unknown): void {
  try {
    void fetch(`${GEN_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    /* 언로드 중 실패는 무시 */
  }
}

export function stopStreamOnUnload(line: PolLine = "exchange"): void {
  const tokenId = currentDemoToken(line);
  stopBeacon("/api/generator/stream/stop", { token_id: tokenId });
  stopBeacon(`/api/zkpol/tokens/${encodeURIComponent(tokenId)}/schedulers/batch/stop`, {});
}

// 해당 라인의 원장 스트림이 도는지(=운영 중) 조회.
export async function isLineRunning(line: PolLine = "exchange"): Promise<boolean> {
  const tokenId = currentDemoToken(line);
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

// SideNav 상태 칩용(거래소 운영 중 여부). 하위호환 별칭.
export const isExchangeRunning = () => isLineRunning("exchange");

// 현재 세션이 사고(invariant 위반)로 차단된 상태인지 조회.
export async function isLineBlocked(line: PolLine): Promise<boolean> {
  try {
    const { getPublicCoins } = await import("./polClient");
    const token = currentDemoToken(line);
    const coin = (await getPublicCoins()).find((c) => c.tokenId === token);
    return coin?.healthStatus === "incident";
  } catch {
    return false;
  }
}

// zkPoL 진입 시 호출: 해당 라인이 이미 운영 중이면 그대로 두고, 아니면 새 세션으로 운영 시작.
// 단, 사고로 정지된 세션은 자동 재시작하지 않는다 — "이상 유입 → 오류 + 운영 정지" 상태를
// 재진입/새로고침에도 유지하고, 명시적 '운영 시작'(=전체 초기화)으로만 재개한다.
// (동시 호출 방지를 위해 진행 중 Promise를 라인별로 공유한다)
const ensurePromise: Record<PolLine, Promise<void> | null> = { exchange: null, stablecoin: null };
export function ensureRunning(line: PolLine = "exchange"): Promise<void> {
  if (ensurePromise[line]) return ensurePromise[line]!;
  const p = (async () => {
    if (await isLineRunning(line)) return;
    if (await isLineBlocked(line)) return;
    await startDemoPipeline(line);
  })().finally(() => {
    ensurePromise[line] = null;
  });
  ensurePromise[line] = p;
  return p;
}

// ZP-4/ZPS-4 진입 전용: '정상 운영 중인 파이프라인'을 반드시 보장한다.
// 이 시나리오의 스텝 1은 정상 로그가 쌓이는 화면에서 출발해야 하므로, 차단된 세션이면
// ensureRunning과 달리 새 세션으로 갈아끼운다(= 무한 재시연 가능).
// ensureRunning의 동작은 그대로 두고(다른 시나리오의 '정지 상태 유지' 의도 보존),
// 진행 중 Promise만 공유해 동시 호출로 세션이 두 번 발급되는 것을 막는다.
export function ensureRunningFresh(line: PolLine = "exchange"): Promise<void> {
  if (ensurePromise[line]) return ensurePromise[line]!;
  const p = (async () => {
    if (await isLineBlocked(line)) {
      await startDemoPipeline(line);
      return;
    }
    if (await isLineRunning(line)) return;
    await startDemoPipeline(line);
  })().finally(() => {
    ensurePromise[line] = null;
  });
  ensurePromise[line] = p;
  return p;
}

// 사용자가 제출한 거래는 '제출 시점 이후 처음 생성되는 배치'에 담긴다.
// 그 기준(제출 직전 최대 batchSeq)을 세션과 함께 기록해, 콘솔이 내 거래 배치를 특정한다. (라인별 키)
export function setMyBatchBaseline(baselineSeq: number, tokenId = currentDemoToken(), line: PolLine = "exchange") {
  try {
    localStorage.setItem(LINE[line].batchKey, JSON.stringify({ token: tokenId, baseline: baselineSeq }));
  } catch {
    /* localStorage 불가 시 무시 */
  }
}
export function getMyBatchBaseline(line: PolLine = "exchange"): number | null {
  try {
    const raw = localStorage.getItem(LINE[line].batchKey);
    if (!raw) return null;
    const v = JSON.parse(raw) as { token: string; baseline: number };
    return v.token === currentDemoToken(line) ? v.baseline : null;
  } catch {
    return null;
  }
}

// ZP-1/ZPS-1: 운영 중 거래소/발행사에 '정상 거래'가 흐르게 한다(세션 유지). 세션이 없으면 먼저 시작.
// ⚠ 정상 거래는 스트림(초당 수백 건)이 이미 계속 생성 중이므로, burst로 1건을 더 넣지 않는다.
// 스트림이 도는 중 같은 계정에 burst를 주입하면 old_value가 stale해져 invariant 위반(=경합)이 난다.
// 사용자의 '제출'은 baseline 시점 이후 스트림이 만드는 첫 배치를 '내 거래'로 표시하는 것으로 대신한다.
export async function submitNormalTransaction(line: PolLine = "exchange"): Promise<string> {
  await ensureRunning(line);
  return currentDemoToken(line);
}

// ZP-4/ZPS-4: 운영 중 라인에 '비정상 거래'를 주입한다(세션 유지). 세션이 없으면 먼저 시작.
// 주입 후 원장 스트림을 정지한다 — 목표 동작 "이상징후 유입 → 오류 + 운영 정지".
// (차단된 파이프라인에 초당 수백 건이 계속 쌓이면 DB만 부풀고 재시연도 어려워진다.
//  주입 전에 쌓인 정상 이벤트들은 그대로 배치로 증명 완료되고, 이상 이벤트 차례에서 사고가 난다.)
export async function submitAnomalyTransaction(line: PolLine = "exchange"): Promise<string> {
  await ensureRunning(line);
  const tokenId = currentDemoToken(line);
  await injectAnomaly(tokenId);
  await stopStream(tokenId).catch(() => undefined);
  return tokenId;
}

// ZP-4/ZPS-4 스텝1 → 스텝2 전환 시 호출: 이미 차단된 세션의 배치 스케줄러를 정지한다.
// 사고 이후 그 스케줄러는 할 일이 없는데도 계속 DB를 폴링하므로, 발표가 스텝2에 머무는
// 동안 무의미한 부하가 쌓인다. 언로드(층1)·다음 세션 시작(층2) 사이의 공백을 메운다.
//
// ⚠ 반드시 '차단됨'을 확인한 뒤에만 멈춘다. 정상 세션의 스케줄러를 멈추면 스트림만 남아
// 이벤트가 계속 쌓이는데 배치는 영영 안 생기고, ensureRunning은 '스트림이 돌면 정상'으로
// 보기 때문에 재진입해도 복구되지 않는다(스텝 목록으로 스텝2를 직접 클릭하는 경로 대비).
export async function stopIncidentScheduler(line: PolLine = "exchange"): Promise<void> {
  if (!(await isLineBlocked(line))) return;
  await stopPipeline(currentDemoToken(line)).catch(() => undefined);
}
