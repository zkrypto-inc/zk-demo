import { toneText } from "@/utils/tone";
import type { UserScreen } from "@/scenarios/types";

type Props = {
  screen: UserScreen;
  canAdvance: boolean;
  activeActionLabel?: string;
  onAdvance?: () => void;
};

export function WebDashboardLayout({ screen, canAdvance, activeActionLabel, onAdvance }: Props) {
  const allFields = screen.sections.flatMap((s) => s.fields);

  return (
    <>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {screen.sections.map((section) => (
          <div key={section.title}>
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-2)]">
              {section.title}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {section.fields.map((field) => (
                <div
                  key={`${section.title}-${field.label}`}
                  className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3"
                  style={
                    field.tone === "ok"
                      ? { borderColor: "var(--ok)", backgroundColor: "var(--ok-soft)" }
                      : field.tone === "bad"
                      ? { borderColor: "var(--bad)", backgroundColor: "var(--bad-soft)" }
                      : field.tone === "accent"
                      ? { borderColor: "var(--accent)", backgroundColor: "var(--accent-soft)" }
                      : {}
                  }
                >
                  <div className="mb-1 text-[10px] text-[var(--ink-2)]">{field.label}</div>
                  <div className={`break-all font-mono text-[12px] font-semibold leading-[1.3] ${toneText(field.tone)}`}>
                    {field.value}
                  </div>
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
