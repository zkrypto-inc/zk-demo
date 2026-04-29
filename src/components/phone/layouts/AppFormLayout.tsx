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
            <div className="overflow-hidden rounded-[14px] border border-[var(--line)] bg-[var(--surface)]">
              {section.fields.map((field, i) => (
                isEditableField(field) ? (
                  <div key={`${section.title}-${field.label}`} className={`px-4 py-3 ${i > 0 ? "border-t border-[var(--line)]" : ""}`}>
                    <div className="mb-1.5 text-[12px] text-[var(--ink-2)]">{field.label}</div>
                    <input
                      aria-label={field.label}
                      className="w-full rounded-[10px] border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2.5 font-mono text-[13px] leading-[1.5] text-[var(--ink)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
                      onChange={(event) => onFieldChange?.(screen.id, field.label, event.target.value)}
                      value={field.value}
                    />
                  </div>
                ) : (
                  <div key={`${section.title}-${field.label}`} className={`flex items-center justify-between gap-3 px-4 py-3 ${i > 0 ? "border-t border-[var(--line)]" : ""}`}>
                    <span className="text-[13px] text-[var(--ink-2)]">{field.label}</span>
                    <span className={`break-all text-right font-mono text-[13px] font-medium leading-[1.4] ${toneText(field.tone)}`}>
                      {field.value}
                    </span>
                  </div>
                )
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
