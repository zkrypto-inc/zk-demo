import { toneText } from "@/utils/tone";
import type { UserScreen } from "@/scenarios/types";
import { isEditableField } from "@/utils/liveValues";

type Props = {
  screen: UserScreen;
  canAdvance: boolean;
  activeActionLabel?: string;
  onAdvance?: () => void;
  onFieldChange?: (screenId: string, label: string, value: string) => void;
};

export function WebFormLayout({ screen, canAdvance, activeActionLabel, onAdvance, onFieldChange }: Props) {
  return (
    <>
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
        {screen.sections.map((section) => (
          <div key={section.title}>
            <div className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-2)]">
              {section.title}
            </div>
            <div className="space-y-2">
              {section.fields.map((field) => (
                <div key={`${section.title}-${field.label}`}>
                  <div className="mb-1 text-[11px] text-[var(--ink-2)]">{field.label}</div>
                  {isEditableField(field) ? (
                    <input
                      aria-label={field.label}
                      className="w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2 font-mono text-[12px] leading-[1.5] text-[var(--ink)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
                      onChange={(event) => onFieldChange?.(screen.id, field.label, event.target.value)}
                      value={field.value}
                    />
                  ) : (
                    <div
                      className={`w-full rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2 font-mono text-[12px] leading-[1.5] ${toneText(field.tone)} ${field.tone === "ok" ? "border-[var(--ok)] bg-[var(--ok-soft)]" : field.tone === "bad" ? "border-[var(--bad)] bg-[var(--bad-soft)]" : ""}`}
                    >
                      {field.value}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
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
