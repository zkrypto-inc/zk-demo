import { AnimatePresence, motion } from "framer-motion";
import type { ProcessView, ScenarioStep, SequenceContext, SequenceEdge } from "@/scenarios/types";
import { ArtifactProcessView } from "./views/ArtifactProcessView";
import { ApprovalProcessView } from "./views/ApprovalProcessView";
import { AuditProcessView } from "./views/AuditProcessView";
import { FormulaProcessView } from "./views/FormulaProcessView";
import { KeygenProcessView } from "./views/KeygenProcessView";
import { LedgerProcessView } from "./views/LedgerProcessView";
import { LiabilityProofProcessView } from "./views/LiabilityProofProcessView";
import { MerkleProcessView } from "./views/MerkleProcessView";
import { OverviewProcessView } from "./views/OverviewProcessView";
import { SequenceProcessView } from "./views/SequenceProcessView";
import { StepListProcessView } from "./views/StepListProcessView";

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
    const sequence = extractSequence(step.processView);
    return sequence ? [sequence.activeEdge] : [];
  });
}

function extractSequence(view?: ProcessView): SequenceContext | undefined {
  if (!view) return undefined;

  if (view.kind === "sequence") {
    return {
      actors: view.actors,
      activeEdge: view.activeEdge,
      pastEdges: view.pastEdges,
    };
  }

  if (
    (view.kind === "overview" || view.kind === "keygen" || view.kind === "artifact" || view.kind === "audit" || view.kind === "merkle" || view.kind === "formula" || view.kind === "liability-proof" || view.kind === "step-list" || view.kind === "ledger") &&
    view.sequence
  ) {
    return view.sequence;
  }

  return undefined;
}

function resolveTopSequence(processView: ProcessView, steps: ScenarioStep[], currentStepIndex: number) {
  const currentSequence = extractSequence(processView);
  if (currentSequence) return currentSequence;

  for (let i = currentStepIndex - 1; i >= 0; i -= 1) {
    const previousSequence = extractSequence(steps[i]?.processView);
    if (previousSequence) return previousSequence;
  }

  return undefined;
}

function renderView(view: ProcessView) {
  switch (view.kind) {
    case "sequence": {
      return view.description
        ? <p className="text-[14px] leading-[1.65] text-[var(--ink-2)]">{view.description}</p>
        : null;
    }
    case "overview": {
      return <OverviewProcessView view={view} />;
    }
    case "approval":  return <ApprovalProcessView view={view} />;
    case "keygen":    return <KeygenProcessView view={view} />;
    case "artifact":  return <ArtifactProcessView view={view} />;
    case "audit":     return <AuditProcessView view={view} />;
    case "merkle":    return <MerkleProcessView view={view} />;
    case "formula":   return <FormulaProcessView view={view} />;
    case "liability-proof": return <LiabilityProofProcessView view={view} />;
    case "step-list": return <StepListProcessView view={view} />;
    case "ledger":    return <LedgerProcessView view={view} />;
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
  const topSequence = resolveTopSequence(processView, steps, currentStepIndex);
  const topSequencePast = topSequence
    ? dedupeAndFilter(
        [...(topSequence.pastEdges ?? []), ...collectEmbeddedSequencePast(steps, currentStepIndex)],
        topSequence.activeEdge,
      ).filter((e) => topSequence.actors.includes(e.from) && topSequence.actors.includes(e.to))
    : undefined;

  const detailContent = renderView(processView);

  return (
    <section className="flex min-h-[650px] flex-col rounded-lg border border-[var(--line)] bg-[var(--surface)]">
      <div className="border-b border-[var(--line)] px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="text-[24px] font-semibold leading-tight text-[var(--ink)]">{currentStep.label}</div>
          <div className="inline-flex h-6 shrink-0 items-center rounded-full bg-[var(--surface-2)] px-3 font-mono text-[11px] text-[var(--ink-2)]">
            {currentStep.id}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <div className="px-5 py-5">
              <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--ink-2)]">
                처리 개요
              </div>
              {topSequence ? (
                <div className="h-[150px] overflow-hidden rounded-xl bg-[var(--surface-2)]">
                  <SequenceProcessView
                    actors={topSequence.actors}
                    edge={topSequence.activeEdge}
                    pastEdges={topSequencePast}
                    extraActiveEdges={topSequence.extraActiveEdges}
                    compact
                  />
                </div>
              ) : (
                <div className="text-[13px] text-[var(--ink-2)]">시퀀스가 없습니다.</div>
              )}
            </div>

            {detailContent && (
              <div className="border-t border-[var(--line)] px-5 py-5">
                <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--ink-2)]">
                  화면 상세 설정
                </div>
                {detailContent}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
