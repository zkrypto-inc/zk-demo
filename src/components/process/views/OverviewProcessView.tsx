import { toneText } from "@/utils/tone";
import type { CompareTable, ProcessView } from "@/scenarios/types";

type Props = {
  view: Extract<ProcessView, { kind: "overview" }>;
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

function CompareTableView({ table }: { table: CompareTable }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)]">
      {table.title && (
        <div className="border-b border-[var(--line)] bg-[var(--surface-2)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-2)]">
          {table.title}
        </div>
      )}
      <table className="w-full text-[12px]">
        <thead className="bg-[var(--surface-2)]">
          <tr className="text-[10px] font-semibold uppercase tracking-[0.04em] text-[var(--muted)]">
            {table.columns.map((col, i) => (
              <th key={i} className={`px-3 py-2 ${i === 0 ? "text-left" : "text-left"}`}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, ri) => (
            <tr key={ri} className="border-t border-[var(--line)]">
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={`px-3 py-2 leading-[1.5] ${
                    ci === 0 ? "font-semibold text-[var(--ink-2)]" : "text-[var(--ink)]"
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function OverviewProcessView({ view }: Props) {
  return (
    <div className="space-y-5">
      <p className="text-[14px] leading-[1.65] text-[var(--ink-2)]">{view.description}</p>
      {view.compareTable && <CompareTableView table={view.compareTable} />}
      <OverviewCards cards={view.cards} />
    </div>
  );
}
