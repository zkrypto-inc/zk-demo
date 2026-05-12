import { useEffect, useState } from "react";
import type { ProcessStep, ProcessView } from "@/scenarios/types";

type Props = {
  view: Extract<ProcessView, { kind: "step-list" }>;
};

const STEP_INTERVAL = 900;

function StepIcon({ state }: { state: ProcessStep["state"] }) {
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

function stepColor(state: ProcessStep["state"]) {
  if (state === "done") return "var(--ok)";
  if (state === "active") return "var(--accent)";
  return "var(--ink-2)";
}

export function StepListProcessView({ view }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (view.steps.length <= 1) return undefined;

    const id = setInterval(() => {
      setActiveIdx((i) => (i + 1) % view.steps.length);
    }, STEP_INTERVAL);

    return () => clearInterval(id);
  }, [view.steps.length]);

  const progress = view.steps.length === 0
    ? view.progress
    : Math.round(((activeIdx + 1) / view.steps.length) * 100);

  return (
    <div className="space-y-5">
      {view.description && (
        <p className="text-[14px] leading-[1.65] text-[var(--ink-2)]">{view.description}</p>
      )}

      <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-5">
        <div className="mb-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-2)]">
          {view.title}
        </div>

        <div className="space-y-3">
          {view.steps.map((step, i) => {
            const state: ProcessStep["state"] = i <= activeIdx ? "done" : "wait";

            return (
              <div
                key={step.label}
                className="flex items-start gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-3"
              >
                <StepIcon state={state} />
                <div className="min-w-0">
                  <div className="text-[15px] font-semibold" style={{ color: stepColor(state) }}>
                    {step.label}
                  </div>
                  <div className="mt-1 font-mono text-[12px] text-[var(--ink-2)]">{step.value}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between text-[12px]">
          <span className="text-[var(--ink-2)]">{view.progressLabel ?? "검증 진행률"}</span>
          <span className="font-mono text-[var(--accent)]">{progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--line)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
