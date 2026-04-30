import { toneText } from "@/utils/tone";
import type { ProcessView, SequenceEdge } from "@/scenarios/types";
import { SequenceProcessView } from "./SequenceProcessView";

type Props = {
  view: Extract<ProcessView, { kind: "overview" }>;
  seqPastEdges?: SequenceEdge[];
};

function OverviewCards({ cards }: { cards?: Extract<ProcessView, { kind: "overview" }>["cards"] }) {
  if (!cards || cards.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--ink-2)]">{card.label}</div>
          <div className={`mt-2 break-all font-mono text-[13px] font-semibold leading-[1.4] ${toneText(card.tone)}`}>{card.value}</div>
          {card.detail && <div className="mt-1 text-[12px] text-[var(--muted)]">{card.detail}</div>}
        </div>
      ))}
    </div>
  );
}

function OverviewSequence({ view, seqPastEdges }: Props) {
  if (!view.sequence) return null;

  return (
    <div className="h-[150px] overflow-hidden rounded-xl bg-[var(--surface-2)]">
      <SequenceProcessView
        actors={view.sequence.actors}
        edge={view.sequence.activeEdge}
        pastEdges={seqPastEdges}
        compact
      />
    </div>
  );
}

export function OverviewProcessView({ view, seqPastEdges }: Props) {
  const cardsAboveSequence = view.cardsPosition === "aboveSequence";

  if (cardsAboveSequence) {
    return (
      <div className="space-y-5">
        <p className="text-[14px] leading-[1.65] text-[var(--ink-2)]">{view.description}</p>
        <OverviewCards cards={view.cards} />
        <OverviewSequence view={view} seqPastEdges={seqPastEdges} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <OverviewSequence view={view} seqPastEdges={seqPastEdges} />
      <p className="text-[14px] leading-[1.65] text-[var(--ink-2)]">{view.description}</p>
      <OverviewCards cards={view.cards} />
    </div>
  );
}
