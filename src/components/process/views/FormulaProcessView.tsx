import type { ProcessView } from "@/scenarios/types";
import { toneText } from "@/utils/tone";

type Props = { view: Extract<ProcessView, { kind: "formula" }> };

const roleStyles: Record<string, { ring: string; badge: string; text: string }> = {
  old:   { ring: "border-[var(--line)]",    badge: "구간 시작",  text: "var(--ink-2)" },
  delta: { ring: "border-[var(--accent)]",  badge: "변동 합",   text: "var(--accent)" },
  new:   { ring: "border-[var(--ok)]",      badge: "구간 종료",  text: "var(--ok)" },
  proof: { ring: "border-[var(--accent)]",  badge: "ZK 증명",   text: "var(--accent)" },
};

export function FormulaProcessView({ view }: Props) {
  const { description, formula, cards } = view;

  return (
    <div className="space-y-4">
      {description && (
        <p className="text-[13px] leading-[1.6] text-[var(--ink-2)]">{description}</p>
      )}

      <div className="rounded-xl border border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-4 text-center">
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
          증명 공식
        </div>
        <div className="font-mono text-[14px] font-semibold leading-[1.4] text-[var(--accent)]">
          {formula}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => {
          const style = card.role ? roleStyles[card.role] : roleStyles.old;
          return (
            <div
              key={card.label}
              className={`rounded-xl border ${style.ring} bg-[var(--surface)] px-3 py-3`}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.06em]" style={{ color: style.text }}>
                  {style.badge}
                </span>
                {card.sublabel && (
                  <span className="font-mono text-[9px] text-[var(--muted)]">{card.sublabel}</span>
                )}
              </div>
              <div className="text-[11px] text-[var(--ink-2)]">{card.label}</div>
              <div className={`mt-1 break-all text-[14px] font-semibold leading-[1.3] ${toneText(card.tone)}`}>
                {card.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
