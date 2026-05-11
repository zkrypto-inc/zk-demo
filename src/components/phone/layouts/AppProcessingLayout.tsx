import { useEffect, useState } from "react";
import type { UserScreen } from "@/scenarios/types";

type Props = {
  screen: UserScreen;
  canAdvance: boolean;
  activeActionLabel?: string;
  onAdvance?: () => void;
};

const STEP_INTERVAL = 900;

type FieldState = "active" | "done" | "wait";

function fieldColor(state: FieldState) {
  if (state === "done")   return "var(--ok)";
  if (state === "active") return "var(--accent)";
  return "var(--ink-2)";
}

function fieldValue(original: string, state: FieldState) {
  if (state === "done")   return "완료";
  if (state === "active") return "진행 중...";
  return original;
}

function AnimatedProcessingList({ fields }: { fields: UserScreen["sections"][0]["fields"] }) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIdx((i) => (i + 1) % fields.length);
    }, STEP_INTERVAL);
    return () => clearInterval(id);
  }, [fields.length]);

  const activeField = fields[activeIdx];

  return (
    <>
      <div className="text-center">
        <div className="text-[17px] font-semibold" style={{ color: "var(--accent)" }}>
          {activeField.label}
        </div>
        <div className="mt-1 text-[13px]" style={{ color: "var(--ink-2)" }}>
          진행 중...
        </div>
      </div>

      <div className="w-full space-y-2.5 rounded-[16px] border border-[var(--line)] bg-[var(--surface)] p-4">
        {fields.map((field, i) => {
          const state: FieldState = i < activeIdx ? "done" : i === activeIdx ? "active" : "wait";
          return (
            <div key={field.label} className="flex items-start justify-between gap-3">
              <span className="text-[13px] text-[var(--ink-2)]">{field.label}</span>
              <span className="font-mono text-[13px] transition-colors duration-300"
                style={{ color: fieldColor(state) }}
              >
                {fieldValue(field.value, state)}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function AppProcessingLayout({ screen, canAdvance, activeActionLabel, onAdvance }: Props) {
  const allFields = screen.sections.flatMap((s) => s.fields);
  const primaryField = allFields.find((f) => f.tone === "warn") ?? allFields[0];
  const restFields = allFields.filter((f) => f !== primaryField);

  return (
    <div className="flex flex-1 flex-col px-5">
      <div className="flex flex-1 flex-col items-center justify-center gap-7">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <svg
            className="absolute inset-0 h-full w-full animate-spin"
            viewBox="0 0 80 80"
            fill="none"
          >
            <circle cx="40" cy="40" r="34" stroke="var(--line)" strokeWidth="4" />
            <path
              d="M40 6a34 34 0 0 1 34 34"
              stroke="var(--accent)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
        </div>

        {screen.animateProcessing ? (
          <AnimatedProcessingList fields={allFields} />
        ) : (
          <>
            {primaryField && (
              <div className="text-center">
                <div className="text-[17px] font-semibold" style={{ color: "var(--ink)" }}>
                  {primaryField.value}
                </div>
                <div className="mt-1 text-[13px]" style={{ color: "var(--ink-2)" }}>
                  {primaryField.label}
                </div>
              </div>
            )}

            {restFields.length > 0 && (
              <div className="w-full space-y-2.5 rounded-[16px] border border-[var(--line)] bg-[var(--surface)] p-4">
                {restFields.map((field) => (
                  <div key={field.label} className="flex items-start justify-between gap-3">
                    <span className="text-[13px] text-[var(--ink-2)]">{field.label}</span>
                    <span
                      className="font-mono text-[13px]"
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
          </>
        )}
      </div>

      {screen.actions && screen.actions.length > 0 && (
        <div className="pb-4 space-y-2">
          {screen.actions.map((action) => {
            const isActive = canAdvance && action.label === activeActionLabel;
            return (
              <button
                key={action.id}
                type="button"
                disabled={!isActive}
                onClick={() => isActive && onAdvance?.()}
                className={`w-full inline-flex h-[52px] items-center justify-center rounded-[16px] text-[15px] font-semibold transition-opacity
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
  );
}
