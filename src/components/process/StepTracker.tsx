import type { ScenarioStep } from "@/scenarios/types";

type Props = {
  steps: ScenarioStep[];
  currentStepIndex: number;
  onStepSelect?: (stepIndex: number) => void;
};

export function StepTracker({ steps, currentStepIndex, onStepSelect }: Props) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--ink-2)]">진행 단계</div>
        <div className="font-mono text-[11px] text-[var(--muted)]">{currentStepIndex + 1} / {steps.length}</div>
      </div>
      <div className="space-y-1">
        {steps.map((step, i) => {
          const isPast = i < currentStepIndex;
          const isCurrent = i === currentStepIndex;
          return (
            <button
              key={step.id}
              className="flex w-full items-center gap-2.5 rounded-md px-1.5 py-1 text-left hover:bg-[var(--surface-2)]"
              onClick={() => onStepSelect?.(i)}
              type="button"
            >
              <div className="relative flex w-4 shrink-0 flex-col items-center">
                {i < steps.length - 1 && (
                  <div
                    className="absolute top-[14px] h-[calc(100%+4px)] w-[1.5px]"
                    style={{
                      background: isPast || isCurrent ? "var(--accent)" : "var(--line)",
                      opacity: isPast ? 0.4 : isCurrent ? 0.6 : 0.3,
                    }}
                  />
                )}
                <div
                  className="relative z-10 h-[8px] w-[8px] rounded-full border transition-all"
                  style={{
                    background: isCurrent || isPast ? "var(--accent)" : "transparent",
                    borderColor: isCurrent || isPast ? "var(--accent)" : "var(--line)",
                    opacity: isPast ? 0.45 : 1,
                    transform: isCurrent ? "scale(1.35)" : "scale(1)",
                    boxShadow: isCurrent ? "0 0 0 3px var(--accent-soft)" : "none",
                  }}
                />
              </div>
              <div
                className="pb-[5px] text-[12px] leading-[1.4] transition-all"
                style={{
                  color: isCurrent ? "var(--ink)" : isPast ? "var(--ink-2)" : "var(--muted)",
                  fontWeight: isCurrent ? 600 : 400,
                  opacity: isPast ? 0.55 : isCurrent ? 1 : 0.6,
                }}
              >
                {step.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
