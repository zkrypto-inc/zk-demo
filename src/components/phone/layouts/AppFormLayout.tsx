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

export function AppFormLayout({ screen, canAdvance, activeActionLabel, onAdvance, onFieldChange }: Props) {
  return (
    <div className="flex flex-1 flex-col px-5">
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto py-2">
        {screen.sections.map((section) => (
          <div key={section.title}>
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-2)]">
              {section.title}
            </div>
            <div className="space-y-3">
              {section.fields.map((field) => (
                <div key={`${section.title}-${field.label}`}>
                  <div className="mb-1.5 text-[12px] text-[var(--ink-2)]">{field.label}</div>
                  {isEditableField(field) ? (
                    <input
                      aria-label={field.label}
                      className="w-full rounded-[12px] border border-[var(--line)] bg-[var(--surface)] px-4 py-3 font-mono text-[13px] leading-[1.5] text-[var(--ink)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
                      onChange={(event) => onFieldChange?.(screen.id, field.label, event.target.value)}
                      value={field.value}
                    />
                  ) : (
                    <div
                      className={`w-full rounded-[12px] border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3 font-mono text-[13px] leading-[1.5] ${toneText(field.tone)} ${field.tone === "ok" ? "border-[var(--ok)] bg-[var(--ok-soft)]" : field.tone === "bad" ? "border-[var(--bad)] bg-[var(--bad-soft)]" : ""}`}
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

      <div className="pb-4 space-y-2">
        {screen.footer && (
          <div className="text-center text-[12px] leading-[1.55] text-[var(--ink-2)]">{screen.footer}</div>
        )}
        {screen.actions && screen.actions.length > 0 && (
          <div className="flex gap-2">
            {screen.actions.map((action) => {
              const isActive = canAdvance && action.label === activeActionLabel;
              return (
                <button
                  key={action.id}
                  type="button"
                  disabled={!isActive}
                  onClick={() => isActive && onAdvance?.()}
                  className={`inline-flex h-[52px] flex-1 items-center justify-center rounded-[16px] text-[15px] font-semibold transition-opacity
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
      </div>
    </div>
  );
}
