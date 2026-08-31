import type { Tone, UserScreen } from "@/scenarios/types";

type Props = {
  screen: UserScreen;
  canAdvance: boolean;
  activeActionLabel?: string;
  onAdvance?: () => void;
};

const badgeStyle: Record<NonNullable<Tone>, { border: string; bg: string; color: string }> = {
  ok: { border: "var(--ok)", bg: "var(--ok-soft)", color: "var(--ok)" },
  accent: { border: "var(--accent)", bg: "var(--accent-soft)", color: "var(--accent)" },
  warn: { border: "var(--warn)", bg: "var(--warn-soft)", color: "var(--warn)" },
  bad: { border: "var(--bad)", bg: "var(--bad-soft)", color: "var(--bad)" },
  neutral: { border: "var(--line)", bg: "var(--surface-2)", color: "var(--ink-2)" },
};

// zkVoting 개표 화면 — 후보별 득표 막대 + (선택) 개표 무결성 검증 카드.
export function WebTallyLayout({ screen, canAdvance, activeActionLabel, onAdvance }: Props) {
  const tally = screen.tally;

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        {tally?.caption && (
          <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--ink-2)]">
            {tally.caption}
          </div>
        )}

        <div className="space-y-3">
          {tally?.rows.map((row) => (
            <div key={row.mark} className="flex items-center gap-3">
              <span className="w-[52px] shrink-0 text-[12px] font-semibold text-[var(--ink)]">{row.mark}</span>
              <span className="h-[13px] flex-1 overflow-hidden rounded-full border border-[var(--line)] bg-[var(--surface-2)]">
                <span
                  className="block h-full rounded-full bg-[var(--accent)] transition-[width] duration-500"
                  style={{ width: `${Math.max(0, Math.min(100, row.pct))}%` }}
                />
              </span>
              <span className="w-[64px] shrink-0 text-right font-mono text-[11px] text-[var(--ink-2)]">{row.votes}</span>
            </div>
          ))}
        </div>

        {tally?.verification && (
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--ok)", backgroundColor: "var(--ok-soft)" }}>
            <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: "var(--ok)" }}>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--ok)] text-[12px] font-bold text-white">✓</span>
              {tally.verification.title}
            </div>
            <div className="mt-2 space-y-1 font-mono text-[12px] leading-[1.7] text-[var(--ink-2)]">
              {tally.verification.lines.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
          </div>
        )}

        {tally?.badges && tally.badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tally.badges.map((badge) => {
              const s = badgeStyle[badge.tone ?? "neutral"];
              return (
                <span
                  key={badge.label}
                  className="inline-flex h-6 items-center rounded-full border px-3 text-[11px] font-semibold"
                  style={{ borderColor: s.border, backgroundColor: s.bg, color: s.color }}
                >
                  {badge.label}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {screen.actions && screen.actions.length > 0 && (
        <div className="flex gap-2 border-t border-[var(--line)] px-4 py-3">
          {screen.actions.map((action) => {
            const isActive = canAdvance && action.label === activeActionLabel;
            return (
              <button
                key={action.id}
                type="button"
                disabled={!isActive}
                onClick={() => isActive && onAdvance?.()}
                className={`inline-flex h-9 flex-1 items-center justify-center rounded-md text-[13px] font-semibold transition-opacity
                  ${action.tone === "accent" ? "bg-[var(--accent)] text-white"
                  : action.tone === "bad" ? "bg-[var(--bad)] text-white"
                  : "border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)]"}
                  ${!isActive ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
              >
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
