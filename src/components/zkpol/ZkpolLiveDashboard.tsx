import { useEffect, useState } from "react";
import { currentDemoToken } from "@/api/polControlClient";

type Props = { scenarioId: string };

// zkpol 네이티브 운영자 대시보드를 그대로 임베드한다.
// 조작(거래소 운영 시작/정지, 이상징후 주입)은 대시보드 안의 데모 제어부가 담당하고,
// 세션 토큰 회전은 postMessage로 받아 localStorage에 동기화한다(재방문 시 최신 세션 유지).
const DASH_BASE = "/pol/dash";
const SESSION_KEY = "zkpol-demo-token";

export function ZkpolLiveDashboard({ scenarioId }: Props) {
  const [token, setToken] = useState(currentDemoToken());
  // iframe은 최초 src로만 로드한다 — 세션 회전 시 대시보드가 스스로 새 토큰으로 이동하므로
  // 여기서 src를 갱신하면 이중 리로드가 된다. (토큰 state는 외부 링크 갱신용)
  const [initialSrc] = useState(() => `${DASH_BASE}/operator?token=${encodeURIComponent(currentDemoToken())}`);

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
          src={initialSrc}
          title={`zkPoL operator dashboard (${scenarioId})`}
          className="h-[920px] w-full rounded-md border border-[var(--line)] bg-white"
        />
      </section>
    </div>
  );
}

export const ZKPOL_LIVE_SCENARIOS = new Set(["ZP-D"]);
