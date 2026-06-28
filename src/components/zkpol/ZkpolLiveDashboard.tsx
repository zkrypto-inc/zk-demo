import { useState } from "react";
import {
  getIncidentEvents,
  getIncidentList,
  getIncidentSummary,
  getPublicCoins,
  getPublicOverview,
  getVerificationLogs,
  type HealthStatus,
  type PolIncidentListItem,
  type SystemStatus,
} from "@/api/polClient";
import { getPipelineCounts, injectAnomaly, startDemoPipeline, stopStream } from "@/api/polControlClient";
import { usePolling } from "@/hooks/usePolling";

type Props = { scenarioId: string };

const statusTone: Record<SystemStatus | HealthStatus, string> = {
  stable: "text-emerald-600 bg-emerald-50 border-emerald-200",
  watch: "text-amber-600 bg-amber-50 border-amber-200",
  degraded: "text-amber-600 bg-amber-50 border-amber-200",
  incident: "text-red-600 bg-red-50 border-red-200",
  unknown: "text-[var(--ink-2)] bg-[var(--surface-2)] border-[var(--line)]",
};

function StatusBadge({ status }: { status: string }) {
  const tone = statusTone[status as SystemStatus] ?? statusTone.unknown;
  return <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${tone}`}>{status}</span>;
}

function fmtAmount(v: number | null | undefined) {
  if (v == null) return "—";
  return v.toLocaleString();
}
function fmtRatio(v: number | null | undefined) {
  if (v == null) return "—";
  // manager는 coverageRatio를 퍼센트(예: 100.0)로 반환한다.
  return `${v.toFixed(2)}%`;
}
function fmtTime(v: string | null | undefined) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleTimeString();
}

function Card({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.04em] text-[var(--ink-2)]">{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}

function ControlBar({ scenarioId }: { scenarioId: string }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const isIncident = scenarioId === "ZP-4";

  const act = async (label: string, fn: () => Promise<unknown>) => {
    setBusy(label);
    setMsg(null);
    try {
      await fn();
      setMsg(`${label} 완료`);
    } catch (e) {
      setMsg(`${label} 실패: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(null);
    }
  };

  const btn = "inline-flex h-8 items-center gap-2 rounded-md px-3 text-[12px] font-medium transition disabled:opacity-50";
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3">
      <span className="text-[12px] font-medium text-[var(--ink-2)]">데모 제어:</span>
      {isIncident ? (
        // ZP-4: 이상징후 주입 — 결과(사고)가 이 화면에 바로 보인다.
        <button type="button" disabled={!!busy} onClick={() => act("이상징후 주입", () => injectAnomaly())} className={`${btn} border border-red-300 bg-red-50 text-red-600 hover:bg-red-100`}>
          이상징후 주입
        </button>
      ) : (
        // ZP-1: 정상 운영 제어
        <>
          <button type="button" disabled={!!busy} onClick={() => act("거래소 운영 시작", () => startDemoPipeline())} className={`${btn} bg-[var(--accent)] text-white hover:opacity-90`}>
            거래소 운영 시작
          </button>
          <button type="button" disabled={!!busy} onClick={() => act("운영 정지", () => stopStream())} className={`${btn} border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-2)] hover:text-[var(--ink)]`}>
            운영 정지
          </button>
        </>
      )}
      {busy && <span className="text-[12px] text-[var(--ink-2)]">{busy}…</span>}
      {msg && !busy && <span className="text-[12px] text-[var(--ink-2)]">{msg}</span>}
    </div>
  );
}

function ErrorHint({ error }: { error: string | undefined }) {
  if (!error) return null;
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-700">
      백엔드 연결 대기/오류: {error}
      <div className="mt-1 text-amber-600">zk-pol 스택(zkpol-manager:21001, event-generator:21000)이 기동됐는지 확인하세요.</div>
    </div>
  );
}

function Zp1Reconciliation() {
  const overview = usePolling(getPublicOverview, 5000);
  const coins = usePolling(getPublicCoins, 5000);
  const logs = usePolling(getVerificationLogs, 5000);
  const counts = usePolling(getPipelineCounts, 2000);
  const c = counts.data;

  return (
    <div className="space-y-4">
      <ErrorHint error={overview.error ?? coins.error ?? logs.error} />

      <Card title="실시간 원장 처리량" right={<span className="text-[11px] text-[var(--ink-2)]">2초 갱신</span>}>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="min-w-0">
            <div className="truncate text-[12px] text-[var(--ink-2)]">누적 처리 거래</div>
            <div className="mt-1 font-mono text-[24px] font-semibold tabular-nums text-[var(--accent)]">{(c?.latest_event_id ?? 0).toLocaleString()}</div>
          </div>
          <div className="min-w-0">
            <div className="truncate text-[12px] text-[var(--ink-2)]">미반영 대기</div>
            <div className="mt-1 font-mono text-[24px] tabular-nums text-[var(--ink)]">{(c?.ledger_change_event_count ?? 0).toLocaleString()}</div>
          </div>
          <div className="min-w-0">
            <div className="truncate text-[12px] text-[var(--ink-2)]">증명 대기</div>
            <div className="mt-1 font-mono text-[24px] tabular-nums text-amber-600">{(c?.prove_pending_event_count ?? 0).toLocaleString()}</div>
          </div>
          <div className="min-w-0">
            <div className="truncate text-[12px] text-[var(--ink-2)]">제출 대기</div>
            <div className="mt-1 font-mono text-[24px] tabular-nums text-amber-600">{(c?.submit_pending_event_count ?? 0).toLocaleString()}</div>
          </div>
        </div>
      </Card>

      <Card title="시스템 상태" right={overview.data ? <StatusBadge status={overview.data.systemStatus} /> : null}>
        <div className="grid grid-cols-2 gap-4 text-[13px] text-[var(--ink)]">
          <div>
            <div className="text-[var(--ink-2)]">최근 반영 시각</div>
            <div className="mt-1 font-mono">{fmtTime(overview.data?.lastReflectedAt)}</div>
          </div>
          <div>
            <div className="text-[var(--ink-2)]">최근 반영 코인</div>
            <div className="mt-1 font-mono">{overview.data?.lastReflectedToken ?? "—"}</div>
          </div>
        </div>
      </Card>

      <Card title="코인별 부채 정합성">
        <table className="w-full text-left text-[13px]">
          <thead className="text-[11px] uppercase text-[var(--ink-2)]">
            <tr className="border-b border-[var(--line)]">
              <th className="py-2">코인</th>
              <th className="py-2 text-right">준비금</th>
              <th className="py-2 text-right">부채(고객잔고합)</th>
              <th className="py-2 text-right">커버리지</th>
              <th className="py-2 text-right">상태</th>
            </tr>
          </thead>
          <tbody>
            {(coins.data ?? []).map((c) => (
              <tr key={c.tokenId} className="border-b border-[var(--line)]/50">
                <td className="py-2 font-mono">{c.tokenId}</td>
                <td className="py-2 text-right font-mono">{fmtAmount(c.reserveAmount)}</td>
                <td className="py-2 text-right font-mono">{fmtAmount(c.liabilityAmount)}</td>
                <td className="py-2 text-right font-mono">{fmtRatio(c.coverageRatio)}</td>
                <td className="py-2 text-right"><StatusBadge status={c.healthStatus} /></td>
              </tr>
            ))}
            {(coins.data ?? []).length === 0 && (
              <tr><td colSpan={5} className="py-6 text-center text-[var(--ink-2)]">데이터 없음 — "거래소 운영 시작"을 눌러 원장 이벤트를 생성하세요.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <Card title="증명 검증 로그 (배치별)">
        <div className="max-h-[280px] space-y-2 overflow-auto">
          {(logs.data ?? []).map((l) => (
            <div key={`${l.tokenId}-${l.batchSeq}`} className="flex items-center justify-between rounded border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2 text-[12px]">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[var(--ink)]">{l.tokenId} #{l.batchSeq}</span>
                <span className="text-[var(--ink-2)]">{l.changeSummary ?? `${fmtAmount(l.rowCount)} rows`}</span>
              </div>
              <div className="flex items-center gap-3 text-[var(--ink-2)]">
                {l.txHash && <span className="font-mono">{l.txHash.slice(0, 10)}…</span>}
                <span>{fmtTime(l.verifiedAt)}</span>
              </div>
            </div>
          ))}
          {(logs.data ?? []).length === 0 && <div className="py-6 text-center text-[12px] text-[var(--ink-2)]">검증 로그 없음</div>}
        </div>
      </Card>
    </div>
  );
}

function Zp4Incidents() {
  const summary = usePolling(getIncidentSummary, 4000);
  const list = usePolling(getIncidentList, 4000);
  const [selected, setSelected] = useState<PolIncidentListItem | null>(null);
  const events = usePolling(
    () => (selected ? getIncidentEvents(selected.tokenId, selected.batchSeq) : Promise.resolve([])),
    4000,
    !!selected,
  );

  const s = summary.data;
  return (
    <div className="space-y-4">
      <ErrorHint error={summary.error ?? list.error} />
      <div className="grid grid-cols-3 gap-4">
        <Card title="사고 건수"><div className="text-[28px] font-semibold text-[var(--ink)]">{s?.incidentCount ?? 0}</div></Card>
        <Card title="고위험"><div className="text-[28px] font-semibold text-red-600">{s?.highRiskCount ?? 0}</div></Card>
        <Card title="미해결"><div className="text-[28px] font-semibold text-amber-600">{s?.unresolvedCount ?? 0}</div></Card>
      </div>

      <Card title="사고 목록">
        <table className="w-full text-left text-[13px]">
          <thead className="text-[11px] uppercase text-[var(--ink-2)]">
            <tr className="border-b border-[var(--line)]">
              <th className="py-2">코인 / 배치</th>
              <th className="py-2">심각도</th>
              <th className="py-2">사유</th>
              <th className="py-2 text-right">영향 계정</th>
              <th className="py-2 text-right">발생</th>
            </tr>
          </thead>
          <tbody>
            {(list.data ?? []).map((it, idx) => {
              const hasBatch = it.batchSeq != null;
              return (
              <tr
                key={`${it.tokenId}-${it.batchSeq ?? `open-${idx}`}`}
                onClick={hasBatch ? () => setSelected(it) : undefined}
                className={`border-b border-[var(--line)]/50 ${hasBatch ? "cursor-pointer hover:bg-[var(--surface-2)]" : ""} ${selected?.batchSeq === it.batchSeq && selected?.tokenId === it.tokenId ? "bg-[var(--surface-2)]" : ""}`}
              >
                <td className="py-2 font-mono">{it.tokenId}{hasBatch ? ` #${it.batchSeq}` : " · 증명 전 차단"}</td>
                <td className="py-2"><StatusBadge status={it.severity === "high" || it.severity === "critical" ? "incident" : "watch"} /></td>
                <td className="py-2 max-w-[280px] truncate text-[var(--ink-2)]">{it.errorMessage ?? "—"}</td>
                <td className="py-2 text-right font-mono">{fmtAmount(it.impactedAccounts)}</td>
                <td className="py-2 text-right text-[var(--ink-2)]">{fmtTime(it.occurredAt)}</td>
              </tr>
              );
            })}
            {(list.data ?? []).length === 0 && (
              <tr><td colSpan={5} className="py-6 text-center text-[var(--ink-2)]">사고 없음 — "이상징후 주입"으로 비정상 원장 이벤트를 발생시키세요.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      {selected && (
        <Card title={`사고 상세 — ${selected.tokenId} #${selected.batchSeq} · 관련 원장 이벤트`}>
          <div className="max-h-[260px] space-y-2 overflow-auto">
            {(events.data ?? []).map((e) => (
              <div key={e.eventId} className="flex items-center justify-between rounded border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2 text-[12px]">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[var(--ink)]">{e.accountId}</span>
                  <span className="text-[var(--ink-2)]">{e.eventType}</span>
                  <span className={`font-mono ${(e.deltaAmount ?? 0) < 0 ? "text-red-600" : "text-emerald-600"}`}>{(e.deltaAmount ?? 0) >= 0 ? "+" : ""}{fmtAmount(e.deltaAmount)}</span>
                </div>
                <div className="flex items-center gap-3 text-[var(--ink-2)]">
                  <span>{e.processingStatus}</span>
                  <span>{fmtTime(e.occurredAt)}</span>
                </div>
              </div>
            ))}
            {(events.data ?? []).length === 0 && <div className="py-6 text-center text-[12px] text-[var(--ink-2)]">이벤트 없음</div>}
          </div>
        </Card>
      )}
    </div>
  );
}

export function ZkpolLiveDashboard({ scenarioId }: Props) {
  return (
    <div className="space-y-4">
      <ControlBar scenarioId={scenarioId} />
      {scenarioId === "ZP-4" ? <Zp4Incidents /> : <Zp1Reconciliation />}
    </div>
  );
}

export const ZKPOL_LIVE_SCENARIOS = new Set(["ZP-1", "ZP-4"]);
