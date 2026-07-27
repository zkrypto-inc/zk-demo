import { useEffect, useState } from "react";
import type { UserScreen } from "@/scenarios/types";

type Props = {
  screen: UserScreen;
  canAdvance: boolean;
  activeActionLabel?: string;
  onAdvance?: () => void;
};

const STEP_INTERVAL = 900;

type ProcessingField = UserScreen["sections"][0]["fields"][0];
type FieldState = "active" | "done" | "wait";

function StepIcon({ state }: { state: FieldState }) {
  if (state === "done") {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--ok)]">
        <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 16 16" fill="none">
          <path d="M4 8.2 6.7 11 12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }

  return (
    <span
      className="mt-0.5 h-6 w-6 shrink-0 rounded-full border-[3px]"
      style={{ borderColor: state === "active" ? "var(--accent)" : "var(--line)" }}
    />
  );
}

function AnimatedProcessingList({
  fields,
  title,
}: {
  fields: ProcessingField[];
  title?: string;
}) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (fields.length <= 1) return undefined;
    const id = setInterval(() => {
      setActiveIdx((i) => (i + 1) % fields.length);
    }, STEP_INTERVAL);
    return () => clearInterval(id);
  }, [fields.length]);

  const progress = fields.length === 0 ? 0 : Math.round(((activeIdx + 1) / fields.length) * 100);

  return (
    <div className="w-full max-w-[560px] rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-5">
      {title && (
        <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-2)]">
          {title}
        </div>
      )}

      <div className="space-y-3">
        {fields.map((field, i) => {
          const state: FieldState = i < activeIdx ? "done" : i === activeIdx ? "active" : "wait";
          const isCurrent = state === "active";
          const isDone = state === "done";

          return (
            <div key={field.label} className="flex items-start gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
              <StepIcon state={state} />
              <div className="min-w-0">
                <div
                  className="text-[15px] font-semibold"
                  style={{ color: isDone ? "var(--ok)" : isCurrent ? "var(--accent)" : "var(--ink-2)" }}
                >
                  {field.label}
                </div>
                <div className="mt-1 text-[12px] text-[var(--ink-2)]">{field.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-[12px]">
        <span className="text-[var(--ink-2)]">증명 검증 진행 중</span>
        <span className="font-mono text-[var(--accent)]">{progress}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--line)]">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function WebProcessingLayout({ screen, canAdvance, activeActionLabel, onAdvance }: Props) {
  const allFields = screen.sections.flatMap((s) => s.fields);
  const primaryField = allFields.find((f) => f.tone === "warn") ?? allFields[0];
  const restFields = allFields.filter((f) => f !== primaryField);

  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
        {screen.animateProcessing && allFields.length > 0 ? (
          <AnimatedProcessingList fields={allFields} title={screen.sections[0]?.title} />
        ) : (
          <>
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
                    <span className="shrink-0 text-[11px] text-[var(--ink-2)]">{field.label}</span>
                    <span
                      className="min-w-0 break-all text-right font-mono text-[11px]"
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
