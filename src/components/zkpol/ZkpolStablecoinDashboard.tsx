import { useState } from "react";
import { ZkpolCompactConsole } from "./ZkpolCompactConsole";
import {
  currentDemoToken,
  ensureRunning,
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
            onClick={() => run("start", "운영 시작", () => ensureRunning(LINE))}
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
          <button
            type="button"
            disabled={!!busy}
            onClick={() => run("reset", "초기화(새 세션)", () => startDemoPipeline(LINE))}
            className={`${btn} border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-[var(--ink)]`}
          >
            초기화(새 세션)
          </button>
        </div>
        {notice && <div className="mt-2 text-[12px] text-[var(--ok)]">{notice}</div>}
        {error && <div className="mt-2 text-[12px] text-[var(--bad)]">{error}</div>}
        <p className="mt-3 text-[11px] leading-[1.6] text-[var(--muted)]">
          운영 정지를 누르면 KRWSC 원장 스트림이 멈춥니다. zkPoL을 벗어나도 자동 정지되지만, 여기서 직접 멈춰 좀비 스트림을 막을 수 있습니다.
        </p>
      </section>

      {/* KRWSC 라이브 콘솔 (거래소와 독립 세션) */}
      <ZkpolCompactConsole focus="console" line={LINE} />
    </div>
  );
}
