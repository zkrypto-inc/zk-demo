import { toneText } from "@/utils/tone";
import type { ProcessView } from "@/scenarios/types";

type Props = { view: Extract<ProcessView, { kind: "audit" }> };

export function AuditProcessView({ view }: Props) {
  return (
    <div>
      <p className="mb-5 text-[14px] leading-[1.65] text-[var(--ink-2)]">{view.description}</p>
      <div className="mb-4 rounded-lg border border-[var(--line)] bg-[var(--bezel)] p-4">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--muted)]">Audit Log</div>
        <div className="space-y-1.5">
          {view.logs.map((line, i) => (
            <div key={`${line}-${i}`} className="break-all font-mono text-[12px] leading-[1.5] text-[#E4E4E7]">
              {line}
            </div>
          ))}
        </div>
      </div>
      {view.summary && view.summary.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {view.summary.map((item) => (
            <div key={item.label} className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
              <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--ink-2)]">{item.label}</div>
              <div className={`mt-2 break-all font-mono text-[13px] font-semibold leading-[1.4] ${toneText(item.tone)}`}>{item.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
