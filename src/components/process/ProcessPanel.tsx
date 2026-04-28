import type { ProcessView, ScenarioStep } from "@/scenarios/types";
import { ArtifactProcessView } from "./views/ArtifactProcessView";
import { ApprovalProcessView } from "./views/ApprovalProcessView";
import { AuditProcessView } from "./views/AuditProcessView";
import { KeygenProcessView } from "./views/KeygenProcessView";
import { OverviewProcessView } from "./views/OverviewProcessView";

function renderView(view: ProcessView) {
  switch (view.kind) {
    case "overview":  return <OverviewProcessView view={view} />;
    case "approval":  return <ApprovalProcessView view={view} />;
    case "keygen":    return <KeygenProcessView view={view} />;
    case "artifact":  return <ArtifactProcessView view={view} />;
    case "audit":     return <AuditProcessView view={view} />;
    default:          return null;
  }
}

type Props = {
  currentStep: ScenarioStep;
  processView: ProcessView;
};

export function ProcessPanel({ currentStep, processView }: Props) {
  return (
    <section className="flex min-h-[650px] flex-col rounded-lg border border-[var(--line)] bg-[var(--surface)]">
      <div className="border-b border-[var(--line)] px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--ink-2)]">
              화면 설명 / 처리 개요
            </div>
            <div className="mt-2 text-[24px] font-semibold leading-tight text-[var(--ink)]">{currentStep.label}</div>
          </div>
          <div className="inline-flex h-6 shrink-0 items-center rounded-full bg-[var(--surface-2)] px-3 font-mono text-[11px] text-[var(--ink-2)]">
            {currentStep.id}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 p-5">
        {renderView(processView)}
      </div>
    </section>
  );
}
