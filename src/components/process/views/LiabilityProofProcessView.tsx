import type { ProcessView } from "@/scenarios/types";

type Props = {
  view: Extract<ProcessView, { kind: "liability-proof" }>;
};

export function LiabilityProofProcessView({ view }: Props) {
  return (
    <div className="space-y-4">
      {view.description && (
        <p className="text-[13px] leading-[1.6] text-[var(--ink-2)]">{view.description}</p>
      )}

      <div className="rounded-xl border border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-4 text-center">
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
          Liability invariant
        </div>
        <div className="font-mono text-[14px] font-semibold leading-[1.4] text-[var(--accent)]">
          {view.formula}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)]">
        <div className="grid grid-cols-4 border-b border-[var(--line)] bg-[var(--surface-2)] text-[10px] font-semibold uppercase tracking-[0.05em] text-[var(--muted)]">
          <div className="px-3 py-2">user</div>
          <div className="px-3 py-2">old_values</div>
          <div className="px-3 py-2">delta</div>
          <div className="px-3 py-2">new_values</div>
        </div>

        {view.rows.map((row) => (
          <div
            className="grid grid-cols-4 items-center border-b border-[var(--line)] text-[12px] last:border-b-0"
            key={row.user}
          >
            <div className="px-3 py-2.5 font-mono text-[11px] font-semibold text-[var(--ink)]">{row.user}</div>
            <div className="px-3 py-2.5 font-mono text-[11px] text-[var(--ink-2)]">{row.oldValue}</div>
            <div className="px-3 py-2.5 font-mono text-[11px] text-[var(--accent)]">{row.delta}</div>
            <div className="px-3 py-2.5 font-mono text-[11px] text-[var(--ok)]">{row.newValue}</div>
          </div>
        ))}
      </div>

      {view.footnote && (
        <div className="rounded-lg bg-[var(--surface-2)] px-3 py-2 text-[12px] leading-[1.5] text-[var(--ink-2)]">
          {view.footnote}
        </div>
      )}
    </div>
  );
}
