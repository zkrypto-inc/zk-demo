import { navigateToRoute } from "@/router";
import type { ScenarioMode } from "@/scenarios/types";

const entries: { mode: ScenarioMode; title: string; subtitle: string; surface: string }[] = [
  {
    mode: "personal",
    title: "개인 지갑",
    subtitle: "모바일 앱에서 지갑을 만들고 거래 서명을 요청합니다.",
    surface: "모바일 앱",
  },
  {
    mode: "custody",
    title: "수탁",
    subtitle: "웹 콘솔에서 법인 등록, 승인, 입금, 출금을 처리합니다.",
    surface: "웹 콘솔",
  },
  {
    mode: "issuer",
    title: "발행사",
    subtitle: "발행·소각·준비금 요청을 생성하고 승인 상태를 확인합니다.",
    surface: "웹 콘솔",
  },
  {
    mode: "platform",
    title: "플랫폼",
    subtitle: "tenant, 프로그램, 역할, 승인 정책을 설정합니다.",
    surface: "웹 콘솔",
  },
];

export function OverviewPage() {
  return (
    <section className="min-h-[calc(100vh-120px)]">
      <div className="mb-8 max-w-[760px]">
        <div className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--ink-2)]">Demo Home</div>
        <h1 className="mt-3 text-[36px] font-semibold leading-tight text-[var(--ink)]">
          업무 영역을 선택해 데모를 시작하세요
        </h1>
        <p className="mt-4 text-[15px] leading-[1.7] text-[var(--ink-2)]">
          각 영역은 실제 웹 콘솔 또는 모바일 앱 화면으로 열립니다. 폼을 입력하고 버튼을 눌러 상태와 이벤트가 바뀌는 흐름을 직접 확인할 수 있습니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {entries.map((entry) => (
          <button
            className="flex min-h-[220px] flex-col justify-between rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5 text-left transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[0_14px_38px_rgba(15,23,42,0.08)]"
            key={entry.mode}
            onClick={() => navigateToRoute({ name: "mode", mode: entry.mode })}
            type="button"
          >
            <div>
              <div className="inline-flex h-6 items-center rounded bg-[var(--surface-2)] px-2 text-[11px] font-semibold text-[var(--ink-2)]">
                {entry.surface}
              </div>
              <div className="mt-4 text-[22px] font-semibold text-[var(--ink)]">{entry.title}</div>
              <div className="mt-3 text-[13px] leading-[1.6] text-[var(--ink-2)]">{entry.subtitle}</div>
            </div>
            <div className="mt-6 text-[13px] font-semibold text-[var(--accent)]">데모 열기</div>
          </button>
        ))}
      </div>
    </section>
  );
}
