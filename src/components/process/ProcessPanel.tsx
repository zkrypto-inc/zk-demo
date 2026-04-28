import type { ProcessView, ScenarioStep } from "@/scenarios/types";
import { ArtifactProcessView } from "./views/ArtifactProcessView";
import { ApprovalProcessView } from "./views/ApprovalProcessView";
import { AuditProcessView } from "./views/AuditProcessView";
import { KeygenProcessView } from "./views/KeygenProcessView";
import { OverviewProcessView } from "./views/OverviewProcessView";
import { SequenceProcessView } from "./views/SequenceProcessView";

function renderView(view: ProcessView, steps: ScenarioStep[] = [], currentStepIndex = 0) {
  switch (view.kind) {
    case "sequence": {
      const pastEdges = steps.slice(0, currentStepIndex).flatMap((step) => (
        step.processView.kind === "sequence" ? [step.processView.activeEdge] : []
      ));
      const filteredPastEdges = pastEdges.filter((edge) => (
        edge.from !== view.activeEdge.from || edge.to !== view.activeEdge.to || edge.label !== view.activeEdge.label
      ));
      return <SequenceProcessView actors={view.actors} edge={view.activeEdge} pastEdges={filteredPastEdges} />;
    }
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
  currentStepIndex?: number;
  processView: ProcessView;
  steps?: ScenarioStep[];
};

export function ProcessPanel({ currentStep, currentStepIndex = 0, processView, steps = [] }: Props) {
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
        {renderView(processView, steps, currentStepIndex)}
      </div>
    </section>
  );
}
