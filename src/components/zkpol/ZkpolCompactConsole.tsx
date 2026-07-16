import { useEffect, useRef, useState } from "react";
import {
  getIncidentList,
  getOperatorLogs,
  getPublicCoins,
  getVerificationLogs,
  type PolCoinHealth,
  type PolIncidentListItem,
  type PolVerificationLog,
} from "@/api/polClient";
import { currentDemoToken, displayToken, getMyBatchBaseline, getPipelineCounts, isCurrentSession, type PolLine } from "@/api/polControlClient";
import { usePolling } from "@/hooks/usePolling";

// 시나리오 좌측 슬롯용 컴팩트 라이브 콘솔.
// ZP-1/ZP-4의 liveView 스텝에서 목업 화면 대신 렌더되며, focus에 따라 강조 패널이 바뀐다.
// 전체 화면은 '운영 대시보드'(ZP-D, 네이티브 임베드) 몫 — 여기는 스텝 서사에 맞춘 최소 구성.
type Focus = "ingest" | "verify" | "detect" | "blocked" | "console" | "incident";

type Props = {
  focus: Focus;
  // 제품 라인(거래소=BTC / 스테이블코인=KRWSC). 각 라인의 독립 세션 토큰 데이터만 조회한다.
  line?: PolLine;
  onAdvance?: () => void;
  advanceLabel?: string;
};

const nf = new Intl.NumberFormat("ko-KR");

function fmtTime(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleTimeString("ko-KR", { hour12: false });
}

function shortHash(hash: string | null | undefined) {
  if (!hash) return "—";
  return hash.length > 14 ? `${hash.slice(0, 10)}…${hash.slice(-4)}` : hash;
}

const HEALTH_LABEL: Record<string, { text: string; cls: string }> = {
  stable: { text: "정상", cls: "text-[var(--ok)]" },
  watch: { text: "주의", cls: "text-[var(--warn)]" },
  incident: { text: "위험", cls: "text-[var(--bad)]" },
  unknown: { text: "확인 필요", cls: "text-[var(--muted)]" },
};

export function ZkpolCompactConsole({ focus, line = "exchange", onAdvance, advanceLabel = "다음 단계 →" }: Props) {
  // incident = ZP-4 종합(배치 로그 + 사고 + 차단 카운터). 사고 없을 땐 detect처럼 대기 연출.
  const wantLogs = focus === "verify" || focus === "console" || focus === "incident";
  const wantIncidents = focus === "detect" || focus === "blocked" || focus === "console" || focus === "incident";
  const wantWaitingCue = focus === "detect" || focus === "incident";

  const counts = usePolling(() => getPipelineCounts(currentDemoToken(line)), 2000);
  const coins = usePolling(
    async () => (await getPublicCoins()).filter((c: PolCoinHealth) => isCurrentSession(c.tokenId, line)),
    5000,
  );
  // verification-logs는 세션당 최신 1개만 준다 → 세션 누적 거래(카운터) 계산 용도로만 폴링.
  const logs = usePolling(
    async () => (await getVerificationLogs()).filter((l: PolVerificationLog) => isCurrentSession(l.tokenId, line)),
    3000,
  );
  // 표시용 검증 로그는 operator/logs로 세션의 '모든 배치'를 가져와 쌓는다(운영 대시보드 로그와 동일 소스).
  const batchLogs = usePolling(
    async () => {
      const token = currentDemoToken(line);
      if (!token) return [];
      const page = await getOperatorLogs(token);
      // batchSeq가 아직 없는(생성 중) 배치는 제외하고, 최신 배치가 위로 오도록 내림차순 정렬
      return page.items.filter((l) => l.batchSeq != null).sort((a, b) => b.batchSeq - a.batchSeq);
    },
    3000,
    wantLogs,
  );
  const incidents = usePolling(
    async () => (await getIncidentList()).filter((i: PolIncidentListItem) => isCurrentSession(i.tokenId, line)),
    3000,
    wantIncidents,
  );

  // 게이팅: verify는 첫 배치, detect는 첫 사고가 등장해야 다음으로
  const gateMet =
    focus === "verify" ? (batchLogs.data?.length ?? 0) > 0 :
    focus === "detect" ? (incidents.data?.length ?? 0) > 0 :
    true;
  const gateWaitText =
    focus === "verify" ? "첫 배치 증명을 기다리는 중… (~10초)" :
    focus === "detect" ? "위반 감지 대기 중… (~10초)" : "";

  // 새로 등장한 검증 로그 하이라이트
  const prevTopBatch = useRef<number | null>(null);
  const [flashBatch, setFlashBatch] = useState<number | null>(null);
  useEffect(() => {
    const top = batchLogs.data?.[0]?.batchSeq ?? null;
    if (top !== null && prevTopBatch.current !== null && top !== prevTopBatch.current) {
      setFlashBatch(top);
      const t = setTimeout(() => setFlashBatch(null), 2500);
      return () => clearTimeout(t);
    }
    prevTopBatch.current = top;
  }, [batchLogs.data]);

  const coin = coins.data?.[0];
  const health = HEALTH_LABEL[coin?.healthStatus ?? "unknown"] ?? HEALTH_LABEL.unknown;
  const c = counts.data;
  const blockedTone = focus === "blocked" || focus === "incident";
  // 세션 누적 거래 = 이 세션에서 증명 완료된 행수 합 + 미반영 대기.
  // (latest_event_id는 전 세션 공용 전역 시퀀스라 새 세션인데도 큰 값으로 보인다)
  const provenRows = (logs.data ?? []).reduce((sum, log) => sum + (log.rowCount ?? 0), 0);
  const sessionTotal = provenRows + (c?.ledger_change_event_count ?? 0);
  // 내 거래 배치: 제출 시점 baseline(그 시점 최대 batchSeq)이 있으면 '그 다음 배치'(baseline 초과 최소),
  // 없으면(폴백) 세션 첫 배치. baseline 이후 배치가 아직 안 생겼으면 강조 없음.
  const myBatchSeq = (() => {
    const seqs = (batchLogs.data ?? []).map((l) => l.batchSeq);
    if (seqs.length === 0) return null;
    const baseline = getMyBatchBaseline(line);
    if (baseline != null) {
      const after = seqs.filter((s) => s > baseline);
      return after.length > 0 ? Math.min(...after) : null;
    }
    return Math.min(...seqs);
  })();

  return (
    <section className="flex w-full flex-col rounded-lg border border-[var(--line)] bg-[var(--surface)]">
      {/* 상태 스트립 */}
      <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] font-semibold text-[var(--ink)]">
            {displayToken(coin?.tokenId ?? currentDemoToken(line))}
          </span>
          <span className={`text-[12px] font-medium ${health.cls}`}>{health.text}</span>
        </div>
        <span className="font-mono text-[10px] text-[var(--muted)]">
          블록 {fmtTime(batchLogs.data?.[0]?.blockCreatedAt)} · 라이브
        </span>
      </div>

      <div className="space-y-5 p-4">
        {/* 카운터 — ingest/blocked/incident/console에서 표시 */}
        {(focus === "ingest" || focus === "blocked" || focus === "console" || focus === "incident") && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md bg-[var(--surface-2)] p-3">
              <div className="text-[11px] text-[var(--ink-2)]">누적 거래 (이번 세션)</div>
              <div className="mt-1 font-mono text-[24px] font-semibold tabular-nums text-[var(--accent)]">
                {nf.format(sessionTotal)}
              </div>
            </div>
            <div className={`rounded-md p-3 ${blockedTone ? "bg-[var(--bad-soft)]" : "bg-[var(--surface-2)]"}`}>
              <div className={`text-[11px] ${blockedTone ? "text-[var(--bad)]" : "text-[var(--ink-2)]"}`}>
                미반영 대기{blockedTone && " (누적만 됨 = 차단)"}
              </div>
              <div className={`mt-1 font-mono text-[24px] font-semibold tabular-nums ${blockedTone ? "text-[var(--bad)]" : "text-[var(--ink)]"}`}>
                {nf.format(c?.ledger_change_event_count ?? 0)}
              </div>
            </div>
          </div>
        )}

        {/* 검증 로그 — verify/console */}
        {wantLogs && (
          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
              배치 증명 검증 로그
            </div>
            {(batchLogs.data?.length ?? 0) === 0 ? (
              <div className="rounded-md border border-dashed border-[var(--line)] px-3 py-4 text-center text-[12px] text-[var(--muted)]">
                아직 검증된 배치가 없습니다 — 미반영 대기가 배치로 묶이면 여기 나타납니다.
              </div>
            ) : (
              <div className="max-h-[360px] overflow-y-auto rounded-md border border-[var(--line)]">
                {batchLogs.data!.map((log) => {
                  const isMine = log.batchSeq === myBatchSeq;
                  const done = log.status === "completed";
                  return (
                    <div
                      key={log.batchSeq}
                      className={`flex items-center justify-between gap-2 border-b border-[var(--line-2)] px-3 py-2 text-[12px] last:border-b-0 transition-colors ${
                        isMine
                          ? "border-l-2 border-l-[var(--accent)] bg-[var(--accent-soft)]"
                          : flashBatch === log.batchSeq
                            ? "bg-[var(--accent-soft)]"
                            : ""
                      }`}
                    >
                      <span className="flex items-center gap-1.5 font-mono text-[var(--ink)]">
                        #{log.batchSeq}
                        {isMine && (
                          <span className="rounded bg-[var(--accent)] px-1.5 py-0.5 text-[9px] font-semibold not-italic text-white">
                            내 거래 포함
                          </span>
                        )}
                      </span>
                      <span className={done ? "text-[var(--ok)]" : "text-[var(--ink-2)]"}>
                        {done ? "증명 완료" : "처리 중"}
                      </span>
                      <span className="font-mono text-[11px] text-[var(--muted)]" title="데모 체인(mockchain) 제출 해시">
                        {shortHash(log.txHash)}
                      </span>
                      <span className="font-mono text-[11px] text-[var(--muted)]">{fmtTime(log.finishedAt)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 사고 — detect/blocked/console */}
        {wantIncidents && (
          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
              사고 (invariant 위반)
            </div>
            {(incidents.data?.length ?? 0) === 0 ? (
              wantWaitingCue ? (
                <div className="rounded-md border border-[var(--warn)]/40 bg-[var(--warn-soft)] px-3 py-3 text-[12px] leading-[1.6] text-[var(--ink-2)]">
                  <span className="font-medium text-[var(--warn)]">감지 대기 중…</span> 비정상 이벤트가 포함된
                  배치의 증명 생성이 시도되는 순간, 등식이 깨지며 위반이 드러납니다.
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-[var(--line)] px-3 py-3 text-center text-[12px] text-[var(--muted)]">
                  기록된 사고가 없습니다.
                </div>
              )
            ) : (
              <div className="space-y-2">
                {incidents.data!.slice(0, 3).map((it) => (
                  <div key={`${it.tokenId}-${it.batchSeq}-${it.occurredAt}`} className="rounded-md border border-[var(--bad)]/40 bg-[var(--bad-soft)] px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--bad)]">
                        <span className="rounded bg-[var(--bad)] px-1.5 py-0.5 font-mono text-[10px] text-white">
                          {it.batchSeq != null ? `배치 #${it.batchSeq}` : "이벤트 검증"}
                        </span>
                        {String(it.severity).toUpperCase()} · {it.batchSeq != null ? "증명 실패 → 지급 차단" : "위반 감지 → 지급 차단"}
                      </span>
                      <span className="font-mono text-[11px] text-[var(--muted)]">{fmtTime(it.occurredAt)}</span>
                    </div>
                    <div className="mt-1 break-all font-mono text-[11px] leading-[1.5] text-[var(--ink-2)]">
                      {it.errorMessage ?? "invariant violation"}
                      {it.impactedAccounts != null && ` · 영향 계정 ${nf.format(it.impactedAccounts)}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 진행 버튼 (게이팅) */}
        {onAdvance && (
          <div className="flex items-center justify-between border-t border-[var(--line)] pt-3">
            <span className="text-[11px] text-[var(--muted)]">{!gateMet ? gateWaitText : ""}</span>
            <button
              type="button"
              onClick={onAdvance}
              disabled={!gateMet}
              className="inline-flex items-center rounded-md bg-[var(--accent)] px-4 py-2 text-[12px] font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {advanceLabel}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
