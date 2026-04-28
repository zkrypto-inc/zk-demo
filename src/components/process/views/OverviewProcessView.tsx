import { toneText } from "@/utils/tone";
import type { ProcessView } from "@/scenarios/types";

type Props = { view: Extract<ProcessView, { kind: "overview" }> };

export function OverviewProcessView({ view }: Props) {
  return (
    <div>
      <p className="mb-5 text-[14px] leading-[1.65] text-[var(--ink-2)]">{view.description}</p>
      {view.cards && view.cards.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {view.cards.map((card) => (
            <div key={card.label} className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
              <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--ink-2)]">{card.label}</div>
              <div className={`mt-2 break-all font-mono text-[13px] font-semibold leading-[1.4] ${toneText(card.tone)}`}>{card.value}</div>
              {card.detail && <div className="mt-1 text-[12px] text-[var(--muted)]">{card.detail}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
