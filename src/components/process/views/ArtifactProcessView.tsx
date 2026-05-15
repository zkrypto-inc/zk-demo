import { toneText } from "@/utils/tone";
import type { ProcessView } from "@/scenarios/types";

type Props = {
  view: Extract<ProcessView, { kind: "artifact" }>;
};

function AccountAbstractionDiagram() {
  return (
    <div className="mt-4 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-2)]">
        Account Abstraction
      </div>
      <div className="flex items-center gap-2">
        {["Passkey", "Smart Account", "Blockchain"].map((label, index) => (
          <div className="flex min-w-0 flex-1 items-center gap-2" key={label}>
            <div
              className={`flex min-h-[56px] flex-1 items-center justify-center rounded-lg border px-2 text-center text-[12px] font-semibold leading-[1.3] ${
                index === 1
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-2)]"
              }`}
            >
              {label}
            </div>
            {index < 2 && (
              <svg className="h-4 w-4 shrink-0 text-[var(--ink-2)]" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h9M9 5l3 3-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

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
      {view.diagram === "account-abstraction" && <AccountAbstractionDiagram />}
    </div>
  );
}
