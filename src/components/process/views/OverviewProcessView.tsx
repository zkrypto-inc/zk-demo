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

// 선거인 명부 머클트리 — 공개키를 해시로 묶어 루트 해시를 만들고 블록체인에 저장(명부 위·변조 방지).
function MerkleRollDiagram() {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-4">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-2)]">
        명부 머클트리
      </div>
      <svg viewBox="0 0 320 196" className="mx-auto block h-auto w-full max-w-[360px]" role="img" aria-label="선거인 명부 머클트리">
        <g stroke="var(--accent)" strokeWidth="1.4">
          <line x1="150" y1="36" x2="74" y2="80" /><line x1="150" y1="36" x2="226" y2="80" />
          <line x1="74" y1="106" x2="36" y2="156" /><line x1="74" y1="106" x2="112" y2="156" />
          <line x1="226" y1="106" x2="188" y2="156" /><line x1="226" y1="106" x2="264" y2="156" />
        </g>
        <g>
          <rect x="113" y="8" width="74" height="28" rx="7" fill="var(--accent)" />
          <text x="150" y="26" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">루트 해시</text>
        </g>
        <g>
          <rect x="41" y="80" width="66" height="26" rx="7" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.4" />
          <text x="74" y="97" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--ink)">H(1·2)</text>
          <rect x="193" y="80" width="66" height="26" rx="7" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.4" />
          <text x="226" y="97" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--ink)">H(3·4)</text>
        </g>
        <g fontSize="9" fill="var(--ink-2)" fontWeight="600">
          <rect x="7" y="156" width="58" height="24" rx="6" fill="var(--surface)" stroke="var(--line)" />
          <text x="36" y="171" textAnchor="middle">공개키1</text>
          <rect x="83" y="156" width="58" height="24" rx="6" fill="var(--surface)" stroke="var(--line)" />
          <text x="112" y="171" textAnchor="middle">공개키2</text>
          <rect x="159" y="156" width="58" height="24" rx="6" fill="var(--surface)" stroke="var(--line)" />
          <text x="188" y="171" textAnchor="middle">공개키3</text>
          <rect x="235" y="156" width="58" height="24" rx="6" fill="var(--surface)" stroke="var(--line)" />
          <text x="264" y="171" textAnchor="middle">공개키4</text>
        </g>
      </svg>
      <div className="mt-2 text-[11.5px] leading-[1.55] text-[var(--ink-2)]">
        선거인 공개키를 해시로 묶어 <b className="text-[var(--ink)]">루트 해시</b>를 만들고 블록체인에 저장합니다(명부 위·변조 방지).
      </div>
    </div>
  );
}

export function OverviewProcessView({ view }: Props) {
  return (
    <div className="space-y-5">
      <p className="text-[14px] leading-[1.65] text-[var(--ink-2)]">{view.description}</p>
      {view.compareTable && <CompareTableView table={view.compareTable} />}
      {view.diagram === "merkle-roll" && <MerkleRollDiagram />}
      <OverviewCards cards={view.cards} />
    </div>
  );
}
