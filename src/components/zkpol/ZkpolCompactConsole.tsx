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
import { currentDemoToken, displayToken, getMyBatchBaseline, getPipelineCounts, isCurrentSession, startDemoPipeline, type PolLine } from "@/api/polControlClient";
import { usePolling } from "@/hooks/usePolling";

// 시나리오 좌측 슬롯용 컴팩트 라이브 콘솔.
// ZP-1/ZP-4의 liveView 스텝에서 목업 화면 대신 렌더되며, focus에 따라 강조 패널이 바뀐다.
// 전체 화면은 '운영 대시보드'(ZP-D, 네이티브 임베드) 몫 — 여기는 스텝 서사에 맞춘 최소 구성.
type Focus = "ingest" | "verify" | "detect" | "blocked" | "console" | "incident" | "monitor" | "normal";

type Props = {
  focus: Focus;
  // 제품 라인(거래소=BTC / 스테이블코인=KRWSC). 각 라인의 독립 세션 토큰 데이터만 조회한다.
  line?: PolLine;
  onAdvance?: () => void;
  advanceLabel?: string;
  // monitor 모드: 콘솔 안에서 이상 거래를 주입한다(주입과 스텝 진행을 분리).
  onInject?: () => void | Promise<void>;
  injectLabel?: string;
  injectDisabled?: boolean;
  // 상위에서 세션을 새로 발급하는 중 — 주입을 막고 준비 중 안내를 띄운다.
  preparing?: boolean;
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

export function ZkpolCompactConsole({
  focus,
  line = "exchange",
  onAdvance,
  advanceLabel = "다음 단계 →",
  onInject,
  injectLabel = "이상 거래 주입",
  injectDisabled = false,
  preparing = false,
}: Props) {
  // incident = ZP-4 종합(배치 로그 + 사고 + 차단 카운터). 사고 없을 땐 detect처럼 대기 연출.
  // monitor  = incident와 같은 구성이되 '정상 운영'에서 출발한다 — 사고 전에는 중립 톤·중립 문구.
  const wantLogs = focus === "verify" || focus === "console" || focus === "incident" || focus === "monitor" || focus === "normal";
  const wantIncidents =
    focus === "detect" || focus === "blocked" || focus === "console" || focus === "incident" || focus === "monitor" || focus === "normal";
  const wantWaitingCue = focus === "detect" || focus === "incident";

  // monitor 모드의 주입 상태 (idle → busy → done). done이면 감지될 때까지 대기 배지를 띄운다.
  const [injectState, setInjectState] = useState<"idle" | "busy" | "done">("idle");
  const [injectError, setInjectError] = useState<string | null>(null);
  const [restarting, setRestarting] = useState(false);

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
      // 실패 행(status=failed)은 batchSeq가 없어도 로그에 남긴다 — "문제가 생긴 배치" 강조용.
      // (조립 단계 실패는 배치번호가 부여되기 전이라 batchSeq=null로 온다)
      // 그 외 batchSeq 없는 행(생성 중)은 제외. 실패 행이 맨 위, 이후 최신 배치 내림차순.
      return page.items
        .filter((l) => l.batchSeq != null || l.status === "failed")
        .sort((a, b) => (b.batchSeq ?? Number.MAX_SAFE_INTEGER) - (a.batchSeq ?? Number.MAX_SAFE_INTEGER));
    },
    3000,
    wantLogs,
  );
  const incidents = usePolling(
    async () => (await getIncidentList()).filter((i: PolIncidentListItem) => isCurrentSession(i.tokenId, line)),
    3000,
    wantIncidents,
  );

  const hasIncident = (incidents.data?.length ?? 0) > 0;

  // 게이팅: verify는 첫 배치, detect/monitor는 첫 사고가 등장해야 다음으로.
  // normal(정상 운영)은 게이팅 없이 바로 다음으로 넘어간다.
  const gateMet =
    focus === "verify" ? (batchLogs.data?.length ?? 0) > 0 :
    focus === "detect" || focus === "monitor" ? hasIncident :
    true;
  const gateWaitText =
    focus === "verify" ? "첫 배치 증명을 기다리는 중… (~10초)" :
    focus === "detect" ? "위반 감지 대기 중… (~10초)" : "";

  const runInject = async () => {
    if (!onInject || injectState !== "idle") return;
    setInjectState("busy");
    setInjectError(null);
    try {
      await onInject();
      setInjectState("done");
    } catch (error) {
      // 실패하면 다시 누를 수 있게 idle로 되돌린다.
      setInjectError(error instanceof Error ? error.message : String(error));
      setInjectState("idle");
    }
  };

  const restartSession = async () => {
    if (restarting) return;
    setRestarting(true);
    try {
      await startDemoPipeline(line);
    } catch {
      /* 실패해도 폴링이 계속 돌며 상태를 다시 보여준다 */
    } finally {
      setRestarting(false);
    }
  };

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
  // monitor는 '정상 → 사고' 전환이 연출의 핵심이라 사고가 실제로 감지된 뒤에만 빨강으로 바뀐다.
  const blockedTone = focus === "blocked" || focus === "incident" || (focus === "monitor" && hasIncident);
  // 세션이 이미 사고로 차단된 채 진입한 경우(ZP-1 등) 빈 콘솔만 보이지 않도록 안내한다.
  // monitor는 진입 시 상위에서 새 세션으로 갈아끼우므로(ensureRunningFresh) 대상에서 제외.
  const sessionBlocked = coin?.healthStatus === "incident";
  const showBlockedBanner = (focus === "ingest" || focus === "verify") && sessionBlocked;
  // 세션 누적 거래 = 이 세션에서 증명 완료된 행수 합 + 미반영 대기.
  // (latest_event_id는 전 세션 공용 전역 시퀀스라 새 세션인데도 큰 값으로 보인다)
  const provenRows = (logs.data ?? []).reduce((sum, log) => sum + (log.rowCount ?? 0), 0);
  const sessionTotal = provenRows + (c?.ledger_change_event_count ?? 0);
  // 내 거래 배치: 제출 시점 baseline(그 시점 최대 batchSeq)이 있으면 '그 다음 배치'(baseline 초과 최소),
  // 없으면(폴백) 세션 첫 배치. baseline 이후 배치가 아직 안 생겼으면 강조 없음.
  const myBatchSeq = (() => {
    // monitor/normal(ZP-4)은 사용자가 제출한 거래가 없다 — 주입만 하거나 관찰만 한다. 폴백(세션
    // 첫 배치)이 걸리면 아무 배치에나 '내 거래 포함'이 붙어 서사를 흐린다.
    if (focus === "monitor" || focus === "normal") return null;
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
        {/* 차단된 세션으로 진입한 경우 안내 + 재시작 (빈 콘솔만 보이는 상황 방지) */}
        {showBlockedBanner && (
          <div className="flex items-center justify-between gap-3 rounded-md border border-[var(--bad)]/40 bg-[var(--bad-soft)] px-3 py-2.5">
            <span className="text-[12px] leading-[1.6] text-[var(--ink-2)]">
              이 세션은 이상징후로 차단된 상태입니다. 운영 대시보드에서 새 세션을 시작하세요.
            </span>
            <button
              type="button"
              onClick={restartSession}
              disabled={restarting}
              className="shrink-0 rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-[11px] font-medium text-[var(--ink-2)] transition hover:border-[var(--ink-2)] hover:text-[var(--ink)] disabled:opacity-50"
            >
              {restarting ? "시작 중…" : "새 세션 시작"}
            </button>
          </div>
        )}

        {/* 세션 준비 중 (ZP-4 진입 시 차단 세션 자동 교체) */}
        {preparing && (
          <div className="rounded-md border border-dashed border-[var(--line)] px-3 py-2.5 text-[12px] text-[var(--ink-2)]">
            운영 세션 준비 중… (수 초 소요)
          </div>
        )}

        {/* 카운터 — ingest/blocked/incident/monitor/console에서 표시 */}
        {(focus === "ingest" || focus === "blocked" || focus === "console" || focus === "incident" || focus === "monitor") && (
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
                  // batchSeq가 없는 행(조립 실패)끼리 null === null로 매칭돼 '내 거래 포함'이
                  // 실패 행에 잘못 붙던 문제 — 번호가 있는 행만 비교한다.
                  const isMine = log.batchSeq != null && log.batchSeq === myBatchSeq;
                  const done = log.status === "completed";
                  const failed = log.status === "failed";
                  return (
                    <div
                      key={log.batchSeq ?? `failed-${log.finishedAt ?? "now"}`}
                      className={`flex items-center justify-between gap-2 border-b border-[var(--line-2)] px-3 py-2 text-[12px] last:border-b-0 transition-colors ${
                        failed
                          ? "border-l-2 border-l-[var(--bad)] bg-[var(--bad-soft)]"
                          : isMine
                            ? "border-l-2 border-l-[var(--accent)] bg-[var(--accent-soft)]"
                            : flashBatch === log.batchSeq
                              ? "bg-[var(--accent-soft)]"
                              : ""
                      }`}
                    >
                      <span className="flex items-center gap-1.5 font-mono text-[var(--ink)]">
                        {log.batchSeq != null ? (
                          `#${log.batchSeq}`
                        ) : (
                          // 조립 단계 실패는 batch_seq 부여 전에 발생해 번호가 없다 (거짓 번호를 만들지 않는다).
                          <span
                            className="not-italic text-[11px] text-[var(--ink-2)]"
                            title="배치 번호가 부여되기 전 조립 단계에서 검증에 실패했습니다"
                          >
                            조립 중 배치
                          </span>
                        )}
                        {failed && (
                          <span className="rounded bg-[var(--bad)] px-1.5 py-0.5 text-[9px] font-semibold not-italic text-white">
                            사고
                          </span>
                        )}
                        {isMine && (
                          <span className="rounded bg-[var(--accent)] px-1.5 py-0.5 text-[9px] font-semibold not-italic text-white">
                            내 거래 포함
                          </span>
                        )}
                      </span>
                      <span className={failed ? "font-medium text-[var(--bad)]" : done ? "text-[var(--ok)]" : "text-[var(--ink-2)]"}>
                        {failed ? "검증 실패 · 차단" : done ? "증명 완료" : "처리 중"}
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

        {/* 주입(monitor) + 진행 버튼 (게이팅) */}
        {(onAdvance || onInject) && (
          <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] pt-3">
            <span className="min-w-0 text-[11px] leading-[1.5]">
              {injectError ? (
                <span className="text-[var(--bad)]">주입 실패: {injectError}</span>
              ) : injectState === "done" && !hasIncident ? (
                <span className="text-[var(--warn)]">주입됨 · 위반 감지 대기 중… (최대 30초)</span>
              ) : (
                <span className="text-[var(--muted)]">{!gateMet ? gateWaitText : ""}</span>
              )}
            </span>
            <div className="flex shrink-0 items-center gap-2">
              {onInject && (
                <button
                  type="button"
                  onClick={runInject}
                  disabled={injectDisabled || preparing || injectState !== "idle"}
                  className="inline-flex items-center rounded-md bg-[var(--bad)] px-4 py-2 text-[12px] font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {injectState === "busy" ? "주입 중…" : injectState === "done" ? "주입됨" : injectLabel}
                </button>
              )}
              {onAdvance && (
                <button
                  type="button"
                  onClick={onAdvance}
                  disabled={!gateMet}
                  className="inline-flex items-center rounded-md bg-[var(--accent)] px-4 py-2 text-[12px] font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {advanceLabel}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
