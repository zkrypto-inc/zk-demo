import { useEffect, useState } from "react";
import { currentDemoToken, startDemoPipeline } from "@/api/polControlClient";

type Props = { scenarioId: string };

// zkpol 네이티브 운영자 대시보드를 그대로 임베드한다.
// 조작(거래소 운영 시작/정지, 이상징후 주입)은 대시보드 안의 데모 제어부가 담당하고,
// 세션 토큰 회전은 postMessage로 받아 localStorage에 동기화한다(재방문 시 최신 세션 유지).
// 초기화(새 세션)는 여기(래퍼)에서 새 BTC 세션을 만들고 iframe을 리로드한다.
const DASH_BASE = "/pol/dash";
const SESSION_KEY = "zkpol-demo-token";
const operatorUrl = (t: string) => `${DASH_BASE}/operator?token=${encodeURIComponent(t)}`;

export function ZkpolLiveDashboard({ scenarioId }: Props) {
  const [token, setToken] = useState(currentDemoToken());
  // iframe src는 초기화 시 새 토큰으로 강제 리로드한다(key 증가). 그 외엔 최초 src 유지.
  const [iframeSrc, setIframeSrc] = useState(() => operatorUrl(currentDemoToken()));
  const [iframeKey, setIframeKey] = useState(0);
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    if (resetting) return;
    setResetting(true);
    try {
      await startDemoPipeline("exchange"); // 새 BTC 세션: 배포·부트스트랩·스케줄러·정상 스트림
      const fresh = currentDemoToken("exchange");
      setToken(fresh);
      setIframeSrc(operatorUrl(fresh));
      setIframeKey((k) => k + 1); // iframe 강제 리로드 → 새 세션 화면
    } finally {
      setResetting(false);
    }
  };

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; token?: string } | null;
      if (data?.type === "zkpol-demo-token" && data.token) {
        try {
          localStorage.setItem(SESSION_KEY, data.token);
        } catch {
          /* 저장 실패해도 iframe 내부 상태는 유지된다 */
        }
        setToken(data.token);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const dashSrc = `${DASH_BASE}/operator?token=${encodeURIComponent(token)}`;

  return (
    <div className="space-y-5">
      <section className="border-t border-[var(--ink)]/12 pt-5">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">운영 대시보드 콘솔</h3>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleReset}
              disabled={resetting}
              title="차단된 세션을 버리고 새 BTC 세션으로 깨끗이 다시 시작"
              className="inline-flex h-7 items-center rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-3 text-[11px] font-medium text-[var(--ink-2)] transition hover:text-[var(--ink)] disabled:opacity-40"
            >
              {resetting ? "초기화 중…" : "초기화(새 세션)"}
            </button>
            <a
              href={`${DASH_BASE}/public?token=${encodeURIComponent(token)}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[11px] text-[var(--muted)] hover:text-[var(--ink)]"
            >
              공개 대시보드 ↗
            </a>
            <a href={dashSrc} target="_blank" rel="noreferrer" className="font-mono text-[11px] text-[var(--muted)] hover:text-[var(--ink)]">
              새 창에서 열기 ↗
            </a>
          </div>
        </div>
        <iframe
          key={iframeKey}
          src={iframeSrc}
          title={`zkPoL operator dashboard (${scenarioId})`}
          className="h-[920px] w-full rounded-md border border-[var(--line)] bg-white"
        />
      </section>
    </div>
  );
}

export const ZKPOL_LIVE_SCENARIOS = new Set(["ZP-D"]);
