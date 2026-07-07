// zkPoL(zkpol-manager) 대시보드 조회 클라이언트.
// manager는 context-path 없이 /api/dashboard/... 로 서빙하므로, 프록시에서 base prefix를
// strip해 manager 루트로 보낸다 (vite proxy / web-server.js 참고).
// 응답 래퍼: { statusCode, data, error }.

const MGR_BASE = (import.meta.env.VITE_ZKPOL_MGR_BASE_URL?.trim() || "/pol/mgr").replace(/\/+$/, "");

export type SystemStatus = "stable" | "degraded" | "incident" | "unknown";
export type HealthStatus = "stable" | "watch" | "incident" | "unknown";
export type IncidentSeverity = "medium" | "high" | "critical" | string;
export type IncidentStatus = string;

export type PolOverview = {
  lastReflectedAt: string | null;
  lastReflectedToken: string | null;
  systemStatus: SystemStatus;
};

export type PolCoinHealth = {
  tokenId: string;
  reserveAmount: number | null;
  liabilityAmount: number | null;
  coverageRatio: number | null;
  healthStatus: HealthStatus;
};

export type PolVerificationLog = {
  tokenId: string;
  batchSeq: number;
  verifiedAt: string | null;
  blockCreatedAt: string | null;
  changeSummary: string | null;
  txHash: string | null;
  rowCount: number | null;
};

export type PolReserveSeriesPoint = {
  timestamp: string;
  reserveAmount: number | null;
  liabilityAmount: number | null;
  coverageRatio: number | null;
};

export type PolIncidentSummary = {
  generatedAt: string | null;
  incidentCount: number;
  highRiskCount: number;
  unresolvedCount: number;
};

export type PolIncidentListItem = {
  tokenId: string;
  batchSeq: number;
  status: IncidentStatus;
  severity: IncidentSeverity;
  errorMessage: string | null;
  occurredAt: string | null;
  retryCount: number | null;
  impactedAccounts: number | null;
};

export type PolIncidentEvent = {
  eventId: string;
  accountId: string;
  eventType: string;
  processingStatus: string;
  deltaAmount: number | null;
  occurredAt: string | null;
};

export class PolClientError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "PolClientError";
    this.status = status;
  }
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${MGR_BASE}${path}`, { headers: { Accept: "application/json" } });
  const text = await res.text();
  let payload: unknown = undefined;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      throw new PolClientError(`zkPoL 응답이 JSON이 아닙니다 (${path})`, res.status);
    }
  }
  const envelope = payload as { data?: T; error?: { message?: string } } | null;
  if (!res.ok) {
    throw new PolClientError(envelope?.error?.message || `zkPoL 조회 실패 (${res.status}) ${path}`, res.status);
  }
  return (envelope?.data ?? null) as T;
}

// --- ZP-1: 상시 대사 (공개 대시보드) ---
export const getPublicOverview = () => getJson<PolOverview>("/api/dashboard/public/overview");
export const getPublicCoins = () => getJson<PolCoinHealth[]>("/api/dashboard/public/coins");
export const getVerificationLogs = () => getJson<PolVerificationLog[]>("/api/dashboard/public/verification-logs");

// 세션(tokenId)의 배치별 처리 로그 — public verification-logs가 세션당 1개만 주는 것과 달리
// 한 세션의 모든 배치를 페이지로 반환한다(운영 대시보드 로그 테이블과 동일 소스).
export type PolOperatorLog = {
  tokenId: string;
  batchSeq: number;
  stage: string;
  status: string;
  txHash: string | null;
  finishedAt: string | null;
  blockCreatedAt: string | null;
};
export const getOperatorLogs = (tokenId: string, limit = 40) =>
  getJson<{ items: PolOperatorLog[]; totalCount: number }>(
    `/api/dashboard/operator/logs?tokenId=${encodeURIComponent(tokenId)}&limit=${limit}&offset=0`,
  );
export const getReserveSeries = (tokenId = "ALL", period = "1h") =>
  getJson<PolReserveSeriesPoint[]>(
    `/api/dashboard/operator/reserve-series?tokenId=${encodeURIComponent(tokenId)}&period=${encodeURIComponent(period)}`,
  );

// --- ZP-4: 이상징후 (사고) ---
export const getIncidentSummary = () => getJson<PolIncidentSummary>("/api/dashboard/operator/incidents/summary");
export const getIncidentList = () => getJson<PolIncidentListItem[]>("/api/dashboard/operator/incidents");
export const getIncidentEvents = (tokenId: string, batchSeq: number) =>
  getJson<PolIncidentEvent[]>(
    `/api/dashboard/operator/incidents/${encodeURIComponent(tokenId)}/${encodeURIComponent(String(batchSeq))}/events`,
  );
