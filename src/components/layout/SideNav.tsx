import { navigateToRoute } from "@/router";
import type { ScenarioMode } from "@/scenarios/types";

type Props = {
  currentMode?: ScenarioMode;
};

const modeItems: { mode: ScenarioMode; label: string; detail: string }[] = [
  { mode: "personal", label: "개인 지갑", detail: "앱에서 지갑 생성과 송금" },
  { mode: "custody", label: "수탁", detail: "웹 콘솔에서 등록·입출금" },
  { mode: "issuer", label: "발행사", detail: "발행·소각·준비금 요청" },
  { mode: "platform", label: "플랫폼", detail: "tenant·권한·승인 정책" },
];

export function SideNav({ currentMode }: Props) {
  return (
    <aside className="hidden w-[232px] shrink-0 border-r border-[var(--line)] bg-[var(--surface)] lg:block">
      <div className="sticky top-0 h-screen overflow-y-auto px-4 py-5">
        <button
          className="mb-6 w-full rounded-md px-2 py-2 text-left hover:bg-[var(--surface-2)]"
          onClick={() => navigateToRoute({ name: "overview" })}
          type="button"
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-2)]">zkWallet</div>
          <div className="mt-1 text-[20px] font-semibold leading-none text-[var(--ink)]">Demo</div>
        </button>

        <div className="space-y-2">
          {modeItems.map((item) => {
            const active = item.mode === currentMode;
            return (
              <button
                className={`w-full rounded-md px-3 py-3 text-left transition ${
                  active ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--ink-2)] hover:bg-[var(--surface-2)]"
                }`}
                key={item.mode}
                onClick={() => navigateToRoute({ name: "mode", mode: item.mode })}
                type="button"
              >
                <div className="text-[13px] font-semibold">{item.label}</div>
                <div className="mt-1 text-[11px] leading-[1.35] text-[var(--muted)]">{item.detail}</div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
