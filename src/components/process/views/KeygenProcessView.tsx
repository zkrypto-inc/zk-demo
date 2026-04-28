import { toneText } from "@/utils/tone";
import type { ProcessView } from "@/scenarios/types";

type Props = { view: Extract<ProcessView, { kind: "keygen" }> };

export function KeygenProcessView({ view }: Props) {
  return (
    <div>
      <p className="mb-5 text-[14px] leading-[1.65] text-[var(--ink-2)]">{view.description}</p>
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[12px] font-medium text-[var(--ink-2)]">진행률</span>
          <span className="font-mono text-[12px] text-[var(--accent)]">{view.progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--line)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
            style={{ width: `${view.progress}%` }}
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {view.nodes.map((node) => (
          <div key={node.label} className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--ink-2)]">{node.label}</div>
            <div className={`mt-2 text-[13px] font-semibold ${toneText(node.tone)}`}>{node.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
