import type { UserScreen, Field } from "@/scenarios/types";

type Props = {
  screen: UserScreen;
  canAdvance: boolean;
  activeActionLabel?: string;
  onAdvance?: () => void;
};

function ApprovalRow({ field }: { field: Field }) {
  const isOk = field.tone === "ok";
  const isWarn = field.tone === "warn";
  const isBad = field.tone === "bad";

  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2
        border-[var(--line)]"
        style={{
          borderColor: isOk ? "var(--ok)" : isWarn ? "var(--warn)" : "var(--line)",
          backgroundColor: isOk ? "var(--ok-soft)" : isWarn ? "var(--warn-soft)" : "var(--surface-2)",
        }}
      >
        {isOk && (
          <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" style={{ color: "var(--ok)" }}>
            <path d="M3 8l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {isWarn && (
          <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: "var(--warn)" }} />
        )}
        {isBad && (
          <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" style={{ color: "var(--bad)" }}>
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
        {!isOk && !isWarn && !isBad && (
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--muted)" }} />
        )}
      </div>
      <div className="flex flex-1 items-center justify-between gap-3">
        <span className="text-[12px] text-[var(--ink-2)]">{field.label}</span>
        <span
          className="text-[12px] font-medium"
          style={{
            color: isOk ? "var(--ok)" : isWarn ? "var(--warn)" : isBad ? "var(--bad)" : "var(--ink-2)",
          }}
        >
          {field.value}
        </span>
      </div>
    </div>
  );
}

export function WebApprovalLayout({ screen, canAdvance, activeActionLabel, onAdvance }: Props) {
  const allFields = screen.sections.flatMap((s) => s.fields);
  const approvalFields = allFields.filter((f) => f.tone === "ok" || f.tone === "warn" || !f.tone);
  const infoFields = allFields.filter((f) => f.tone !== "ok" && f.tone !== "warn" && f.tone);

  return (
    <>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        <div className="mb-1 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--warn)" }} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--warn)" }}>
            승인 대기 중
          </span>
        </div>

        <div className="space-y-2">
          {approvalFields.map((field) => (
            <ApprovalRow key={field.label} field={field} />
          ))}
        </div>

        {infoFields.length > 0 && (
          <div className="mt-2 space-y-1.5 rounded-lg border border-[var(--line)] p-3">
            {infoFields.map((field) => (
              <div key={field.label} className="flex items-start justify-between gap-3">
                <span className="text-[11px] text-[var(--ink-2)]">{field.label}</span>
                <span className="font-mono text-[11px] text-[var(--ink)]">{field.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {screen.actions && screen.actions.length > 0 && (
        <div className="flex gap-2 border-t border-[var(--line)] px-4 py-3">
          {screen.actions.map((action) => {
            const isActive = canAdvance && action.label === activeActionLabel;
            const isStaticAction = action.tone === "bad";
            return (
              <button
                key={action.id}
                type="button"
                disabled={!isActive && !isStaticAction}
                onClick={() => isActive && onAdvance?.()}
                className={`inline-flex h-9 flex-1 items-center justify-center rounded-md text-[13px] font-semibold transition-opacity
                  ${action.tone === "accent" ? "bg-[var(--accent)] text-white"
                  : action.tone === "bad" ? "bg-[var(--bad)] text-white"
                  : "border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)]"}
                  ${!isActive && !isStaticAction ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
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
