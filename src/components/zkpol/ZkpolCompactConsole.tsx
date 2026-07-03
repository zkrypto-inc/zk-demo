import { useEffect, useRef, useState } from "react";
import {
  getIncidentList,
  getPublicCoins,
  getVerificationLogs,
  type PolCoinHealth,
  type PolIncidentListItem,
  type PolVerificationLog,
} from "@/api/polClient";
import { displayToken, getPipelineCounts, isCurrentSession } from "@/api/polControlClient";
import { usePolling } from "@/hooks/usePolling";

// 시나리오 좌측 슬롯용 컴팩트 라이브 콘솔.
// ZP-1/ZP-4의 liveView 스텝에서 목업 화면 대신 렌더되며, focus에 따라 강조 패널이 바뀐다.
// 전체 화면은 '운영 대시보드'(ZP-D, 네이티브 임베드) 몫 — 여기는 스텝 서사에 맞춘 최소 구성.
type Focus = "ingest" | "verify" | "detect" | "blocked" | "console";

type Props = {
  focus: Focus;
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

export function ZkpolCompactConsole({ focus, onAdvance, advanceLabel = "다음 단계 →" }: Props) {
  const wantLogs = focus === "verify" || focus === "console";
  const wantIncidents = focus === "detect" || focus === "blocked" || focus === "console";

  const counts = usePolling(getPipelineCounts, 2000);
  const coins = usePolling(
    async () => (await getPublicCoins()).filter((c: PolCoinHealth) => isCurrentSession(c.tokenId)),
    5000,
  );
  // 로그는 표시(verify/console) 외에도 세션 누적 거래 계산에 쓰여 항상 폴링한다.
  const logs = usePolling(
    async () => (await getVerificationLogs()).filter((l: PolVerificationLog) => isCurrentSession(l.tokenId)),
    3000,
  );
  const incidents = usePolling(
    async () => (await getIncidentList()).filter((i: PolIncidentListItem) => isCurrentSession(i.tokenId)),
    3000,
    wantIncidents,
  );

  // 게이팅: verify는 첫 배치, detect는 첫 사고가 등장해야 다음으로
  const gateMet =
    focus === "verify" ? (logs.data?.length ?? 0) > 0 :
    focus === "detect" ? (incidents.data?.length ?? 0) > 0 :
    true;
  const gateWaitText =
    focus === "verify" ? "첫 배치 증명을 기다리는 중… (~10초)" :
    focus === "detect" ? "위반 감지 대기 중… (~10초)" : "";

  // 새로 등장한 검증 로그 하이라이트
  const prevTopBatch = useRef<number | null>(null);
  const [flashBatch, setFlashBatch] = useState<number | null>(null);
  useEffect(() => {
    const top = logs.data?.[0]?.batchSeq ?? null;
    if (top !== null && prevTopBatch.current !== null && top !== prevTopBatch.current) {
      setFlashBatch(top);
      const t = setTimeout(() => setFlashBatch(null), 2500);
      return () => clearTimeout(t);
    }
    prevTopBatch.current = top;
  }, [logs.data]);

  const coin = coins.data?.[0];
  const health = HEALTH_LABEL[coin?.healthStatus ?? "unknown"] ?? HEALTH_LABEL.unknown;
  const c = counts.data;
  const blockedTone = focus === "blocked";
  // 세션 누적 거래 = 이 세션에서 증명 완료된 행수 합 + 미반영 대기.
  // (latest_event_id는 전 세션 공용 전역 시퀀스라 새 세션인데도 큰 값으로 보인다)
  const provenRows = (logs.data ?? []).reduce((sum, log) => sum + (log.rowCount ?? 0), 0);
  const sessionTotal = provenRows + (c?.ledger_change_event_count ?? 0);

  return (
    <section className="flex w-full flex-col rounded-lg border border-[var(--line)] bg-[var(--surface)]">
      {/* 상태 스트립 */}
      <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] font-semibold text-[var(--ink)]">
            {displayToken(coin?.tokenId ?? "BTC")}
          </span>
          <span className={`text-[12px] font-medium ${health.cls}`}>{health.text}</span>
        </div>
        <span className="font-mono text-[10px] text-[var(--muted)]">
          블록 {fmtTime(logs.data?.[0]?.blockCreatedAt)} · 라이브
        </span>
      </div>

      <div className="space-y-5 p-4">
        {/* 카운터 — ingest/blocked에서 강조 */}
        {(focus === "ingest" || focus === "blocked" || focus === "console") && (
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
            {(logs.data?.length ?? 0) === 0 ? (
              <div className="rounded-md border border-dashed border-[var(--line)] px-3 py-4 text-center text-[12px] text-[var(--muted)]">
                아직 검증된 배치가 없습니다 — 미반영 대기가 배치로 묶이면 여기 나타납니다.
              </div>
            ) : (
              <div className="overflow-hidden rounded-md border border-[var(--line)]">
                {logs.data!.slice(0, 5).map((log) => (
                  <div
                    key={log.batchSeq}
                    className={`flex items-center justify-between gap-2 border-b border-[var(--line-2)] px-3 py-2 text-[12px] last:border-b-0 transition-colors ${
                      flashBatch === log.batchSeq ? "bg-[var(--accent-soft)]" : ""
                    }`}
                  >
                    <span className="font-mono text-[var(--ink)]">#{log.batchSeq}</span>
                    <span className="text-[var(--ink-2)]">{nf.format(log.rowCount ?? 0)}건 증명</span>
                    <span className="font-mono text-[11px] text-[var(--muted)]" title="데모 체인(mockchain) 제출 해시">
                      {shortHash(log.txHash)}
                    </span>
                    <span className="font-mono text-[11px] text-[var(--muted)]">{fmtTime(log.verifiedAt)}</span>
                  </div>
                ))}
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
              focus === "detect" ? (
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
                      <span className="text-[12px] font-semibold text-[var(--bad)]">
                        {String(it.severity).toUpperCase()} · 지급 차단
                      </span>
                      <span className="font-mono text-[11px] text-[var(--muted)]">{fmtTime(it.occurredAt)}</span>
                    </div>
                    <div className="mt-1 break-all font-mono text-[11px] leading-[1.5] text-[var(--ink-2)]">
                      {it.errorMessage ?? "invariant violation"}
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
