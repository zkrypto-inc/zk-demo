import { toneText } from "@/utils/tone";
import type { ProcessView } from "@/scenarios/types";

type Props = { view: Extract<ProcessView, { kind: "artifact" }> };

export function ArtifactProcessView({ view }: Props) {
  return (
    <div>
      <p className="mb-5 text-[14px] leading-[1.65] text-[var(--ink-2)]">{view.description}</p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {view.items.map((item) => (
          <div key={item.label} className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--ink-2)]">{item.label}</div>
            <div className={`mt-2 break-all font-mono text-[13px] font-semibold leading-[1.4] ${toneText(item.tone)}`}>{item.value}</div>
            {item.detail && <div className="mt-1 text-[12px] text-[var(--muted)]">{item.detail}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
