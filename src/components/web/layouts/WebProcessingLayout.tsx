import type { UserScreen } from "@/scenarios/types";

type Props = {
  screen: UserScreen;
  canAdvance: boolean;
  activeActionLabel?: string;
  onAdvance?: () => void;
};

export function WebProcessingLayout({ screen, canAdvance, activeActionLabel, onAdvance }: Props) {
  const allFields = screen.sections.flatMap((s) => s.fields);
  const primaryField = allFields.find((f) => f.tone === "warn") ?? allFields[0];
  const restFields = allFields.filter((f) => f !== primaryField);

  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <svg
            className="absolute inset-0 h-full w-full animate-spin"
            viewBox="0 0 56 56"
            fill="none"
          >
            <circle cx="28" cy="28" r="24" stroke="var(--line)" strokeWidth="3" />
            <path
              d="M28 4a24 24 0 0 1 24 24"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
        </div>

        {primaryField && (
          <div className="text-center">
            <div className="text-[13px] font-semibold" style={{ color: "var(--warn)" }}>
              {primaryField.value}
            </div>
            <div className="mt-0.5 text-[11px]" style={{ color: "var(--ink-2)" }}>
              {primaryField.label}
            </div>
          </div>
        )}

        {restFields.length > 0 && (
          <div className="w-full space-y-1.5 rounded-lg border border-[var(--line)] p-3">
            {restFields.map((field) => (
              <div key={field.label} className="flex items-start justify-between gap-3">
                <span className="text-[11px] text-[var(--ink-2)]">{field.label}</span>
                <span
                  className="font-mono text-[11px]"
                  style={{
                    color: field.tone === "ok" ? "var(--ok)"
                      : field.tone === "warn" ? "var(--warn)"
                      : field.tone === "accent" ? "var(--accent)"
                      : "var(--ink)",
                  }}
                >
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
