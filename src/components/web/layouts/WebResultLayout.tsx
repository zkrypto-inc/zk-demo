import type { UserScreen } from "@/scenarios/types";
import { toneText } from "@/utils/tone";

type Props = {
  screen: UserScreen;
  canAdvance: boolean;
  activeActionLabel?: string;
  onAdvance?: () => void;
};

export function WebResultLayout({ screen, canAdvance, activeActionLabel, onAdvance }: Props) {
  const allFields = screen.sections.flatMap((s) => s.fields);
  const highlightFields = allFields.filter((f) => f.tone === "accent" || f.tone === "ok");
  const otherFields = allFields.filter((f) => f.tone !== "accent" && f.tone !== "ok" && f.tone !== "bad");
  const badFields = allFields.filter((f) => f.tone === "bad");

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        <div className="flex flex-col items-center gap-2 py-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: "var(--ok-soft)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" style={{ color: "var(--ok)" }}>
              <path
                d="M5 12l4.5 4.5L19 7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="text-[13px] font-semibold" style={{ color: "var(--ok)" }}>
            {screen.status}
          </div>
        </div>

        {highlightFields.length > 0 && (
          <div
            className="rounded-lg border p-3 space-y-2"
            style={{ borderColor: "var(--ok)", backgroundColor: "var(--ok-soft)" }}
          >
            {highlightFields.map((field) => (
              <div key={field.label} className="flex items-start justify-between gap-3">
                <span className="text-[11px]" style={{ color: "var(--ok)" }}>{field.label}</span>
                <span className={`max-w-[60%] break-all text-right font-mono text-[12px] leading-[1.4] font-semibold ${toneText(field.tone)}`}>
                  {field.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {otherFields.length > 0 && (
          <div className="rounded-lg border border-[var(--line)] p-3 space-y-2">
            {otherFields.map((field) => (
              <div key={field.label} className="flex items-start justify-between gap-3">
                <span className="text-[11px] text-[var(--ink-2)]">{field.label}</span>
                <span className="max-w-[60%] break-all text-right font-mono text-[12px] leading-[1.4] text-[var(--ink)]">
                  {field.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {badFields.length > 0 && (
          <div
            className="rounded-lg border p-3 space-y-2"
            style={{ borderColor: "var(--bad)", backgroundColor: "var(--bad-soft)" }}
          >
            {badFields.map((field) => (
              <div key={field.label} className="flex items-start justify-between gap-3">
                <span className="text-[11px]" style={{ color: "var(--bad)" }}>{field.label}</span>
                <span className="max-w-[60%] break-all text-right font-mono text-[12px] font-semibold leading-[1.4]" style={{ color: "var(--bad)" }}>
                  {field.value}
                </span>
              </div>
            ))}
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
