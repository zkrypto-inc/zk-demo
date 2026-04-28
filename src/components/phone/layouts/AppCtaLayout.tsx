import type { UserScreen } from "@/scenarios/types";

type Props = {
  screen: UserScreen;
  canAdvance: boolean;
  activeActionLabel?: string;
  onAdvance?: () => void;
};

export function AppCtaLayout({ screen, canAdvance, activeActionLabel, onAdvance }: Props) {
  const allFields = screen.sections.flatMap((s) => s.fields);
  const ctaAction = screen.actions?.[0];
  const isActive = canAdvance && ctaAction?.label === activeActionLabel;

  return (
    <div className="flex flex-1 flex-col px-5">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-8">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-[28px]"
          style={{ backgroundColor: "var(--accent-soft)" }}
        >
          <svg viewBox="0 0 40 40" fill="none" className="h-10 w-10" style={{ color: "var(--accent)" }}>
            <rect x="8" y="14" width="24" height="18" rx="3" stroke="currentColor" strokeWidth="2.5" />
            <path d="M14 14v-2a6 6 0 0 1 12 0v2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="20" cy="23" r="2.5" fill="currentColor" />
          </svg>
        </div>

        <div className="text-center">
          <div className="text-[22px] font-bold leading-tight text-[var(--ink)]">{screen.title}</div>
          <div className="mt-2 text-[14px] leading-[1.55] text-[var(--ink-2)]">{screen.subtitle}</div>
        </div>

        {allFields.length > 0 && (
          <div className="w-full space-y-2.5 rounded-[16px] border border-[var(--line)] bg-[var(--surface)] p-4">
            {allFields.map((field) => (
              <div key={field.label} className="flex items-start justify-between gap-3">
                <span className="text-[13px] text-[var(--ink-2)]">{field.label}</span>
                <span className="text-right text-[13px] font-medium text-[var(--ink)]">{field.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pb-4">
        {ctaAction && (
          <button
            type="button"
            disabled={!isActive}
            onClick={() => isActive && onAdvance?.()}
            className={`w-full inline-flex h-[56px] items-center justify-center rounded-[18px] text-[16px] font-bold transition-opacity
              ${ctaAction.tone === "accent" ? "bg-[var(--accent)] text-white"
              : ctaAction.tone === "bad" ? "bg-[var(--bad)] text-white"
              : "border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)]"}
              ${!isActive ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
          >
            {ctaAction.label}
          </button>
        )}
      </div>
    </div>
  );
}
