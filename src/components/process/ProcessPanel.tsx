import { AnimatePresence, motion } from "framer-motion";
import type { ProcessView, ScenarioStep, SequenceEdge } from "@/scenarios/types";
import { ArtifactProcessView } from "./views/ArtifactProcessView";
import { ApprovalProcessView } from "./views/ApprovalProcessView";
import { AuditProcessView } from "./views/AuditProcessView";
import { KeygenProcessView } from "./views/KeygenProcessView";
import { OverviewProcessView } from "./views/OverviewProcessView";
import { SequenceProcessView } from "./views/SequenceProcessView";

function dedupeAndFilter(edges: SequenceEdge[], activeEdge: SequenceEdge): SequenceEdge[] {
  const unique = edges.filter((e, i, arr) =>
    i === arr.findIndex(x => x.from === e.from && x.to === e.to && x.label === e.label)
  );
  return unique.filter(e =>
    e.from !== activeEdge.from || e.to !== activeEdge.to || e.label !== activeEdge.label
  );
}

function collectEmbeddedSequencePast(steps: ScenarioStep[], currentStepIndex: number): SequenceEdge[] {
  return steps.slice(0, currentStepIndex).flatMap((step) => {
    const pv = step.processView;
    if (pv.kind === "sequence") return [pv.activeEdge];
    if ((pv.kind === "keygen" || pv.kind === "artifact" || pv.kind === "overview") && pv.sequence) return [pv.sequence.activeEdge];
    return [];
  });
}

function renderView(view: ProcessView, steps: ScenarioStep[] = [], currentStepIndex = 0) {
  switch (view.kind) {
    case "sequence": {
      const computedPast = steps.slice(0, currentStepIndex).flatMap((step) => (
        step.processView.kind === "sequence" ? [step.processView.activeEdge] : []
      ));
      const filteredPast = dedupeAndFilter([...(view.pastEdges ?? []), ...computedPast], view.activeEdge);
      return <SequenceProcessView actors={view.actors} edge={view.activeEdge} pastEdges={filteredPast} />;
    }
    case "overview": {
      const seqPast = view.sequence
        ? dedupeAndFilter(
            [...(view.sequence.pastEdges ?? []), ...collectEmbeddedSequencePast(steps, currentStepIndex)],
            view.sequence.activeEdge,
          )
        : undefined;
      return <OverviewProcessView view={view} seqPastEdges={seqPast} />;
    }
    case "approval":  return <ApprovalProcessView view={view} />;
    case "keygen": {
      const seqPast = view.sequence
        ? dedupeAndFilter(
            [...(view.sequence.pastEdges ?? []), ...collectEmbeddedSequencePast(steps, currentStepIndex)],
            view.sequence.activeEdge,
          )
        : undefined;
      return <KeygenProcessView view={view} seqPastEdges={seqPast} />;
    }
    case "artifact": {
      const seqPast = view.sequence
        ? dedupeAndFilter(
            [...(view.sequence.pastEdges ?? []), ...collectEmbeddedSequencePast(steps, currentStepIndex)],
            view.sequence.activeEdge,
          )
        : undefined;
      return <ArtifactProcessView view={view} seqPastEdges={seqPast} />;
    }
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
              처리 개요
            </div>
            <div className="mt-2 text-[24px] font-semibold leading-tight text-[var(--ink)]">{currentStep.label}</div>
          </div>
          <div className="inline-flex h-6 shrink-0 items-center rounded-full bg-[var(--surface-2)] px-3 font-mono text-[11px] text-[var(--ink-2)]">
            {currentStep.id}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            {renderView(processView, steps, currentStepIndex)}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
