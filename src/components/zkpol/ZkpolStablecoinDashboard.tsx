import { useState } from "react";
import { ZkpolCompactConsole } from "./ZkpolCompactConsole";
import { ZkpolSolvencyPanel } from "./ZkpolSolvencyPanel";
import {
  currentDemoToken,
  startDemoPipeline,
  stopStream,
  submitAnomalyTransaction,
  type PolLine,
} from "@/api/polControlClient";

// 스테이블코인(ZPS) 운영 대시보드 — 거래소 ZP-D와 대칭.
// 거래소 ZP-D는 네이티브 임베드(USDT/USDC fixture·"Exchange PoL" 하드코딩)라 스테이블코인에 못 씀.
// 여기는 라인 인지 polControlClient(line="stablecoin")로 KRWSC 세션을 직접 제어하는 React 패널.
const LINE: PolLine = "stablecoin";

export function ZkpolStablecoinDashboard() {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const run = async (key: string, label: string, fn: () => Promise<unknown>) => {
    if (busy) return;
    setBusy(key);
    setError(null);
    setNotice(null);
    try {
      await fn();
      setNotice(`${label} 완료`);
    } catch (e) {
      setError(`${label} 실패: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(null);
    }
  };

  const btn =
    "inline-flex h-8 items-center rounded-md px-3 text-[12px] font-medium transition disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">데모 운영 제어 · KRWSC</span>
          {busy && <span className="text-[11px] text-[var(--ink-2)]">처리 중…</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!!busy}
            onClick={() => run("start", "운영 시작", () => startDemoPipeline(LINE))}
            title="모든 이전 세션을 정지·초기화하고 새 세션으로 운영을 시작합니다"
            className={`${btn} bg-[var(--accent)] text-white hover:opacity-90`}
          >
            운영 시작
          </button>
          <button
            type="button"
            disabled={!!busy}
            onClick={() => run("stop", "운영 정지", () => stopStream(currentDemoToken(LINE)))}
            className={`${btn} border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-[var(--ink)]`}
          >
            운영 정지
          </button>
          <button
            type="button"
            disabled={!!busy}
            onClick={() => run("anomaly", "이상 주입", () => submitAnomalyTransaction(LINE))}
            className={`${btn} border border-[var(--bad)]/40 bg-[var(--bad-soft)] text-[var(--bad)] hover:opacity-90`}
          >
            이상 주입
          </button>
        </div>
        {notice && <div className="mt-2 text-[12px] text-[var(--ok)]">{notice}</div>}
        {error && <div className="mt-2 text-[12px] text-[var(--bad)]">{error}</div>}
        <p className="mt-3 text-[11px] leading-[1.6] text-[var(--muted)]">
          이상 주입 시 오류와 함께 운영이 정지되며, 정지 상태는 화면을 벗어나도 유지됩니다. 운영 시작을 누르면 모든 세션이 초기화되고 새 세션으로 다시 시작합니다.
        </p>
      </section>

      {/* 지급능력(PoR × PoL) — 준비금은 수탁기관 연동 전 데모 값 */}
      <ZkpolSolvencyPanel line={LINE} />

      {/* KRWSC 라이브 콘솔 (거래소와 독립 세션) */}
      <ZkpolCompactConsole focus="console" line={LINE} />
    </div>
  );
}
