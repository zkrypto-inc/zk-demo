import { useRef } from "react";
import type { UserScreen } from "@/scenarios/types";
import { toneText } from "@/utils/tone";

type Props = {
  screen: UserScreen;
  canAdvance: boolean;
  activeActionLabel?: string;
  onAdvance?: () => void;
};

function AccountAbstractionDiagram() {
  return (
    <div className="rounded-[16px] border border-[var(--line)] bg-[var(--surface)] p-4">
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-2)]">
        Account Abstraction
      </div>
      <div className="flex items-center gap-2">
        {["Passkey", "Smart Account", "Blockchain"].map((label, index) => (
          <div className="flex min-w-0 flex-1 items-center gap-2" key={label}>
            <div
              className={`flex min-h-[54px] flex-1 items-center justify-center rounded-[12px] border px-2 text-center text-[11px] font-semibold leading-[1.25] ${
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

export function AppResultLayout({ screen, canAdvance, activeActionLabel, onAdvance }: Props) {
  const allFields = screen.sections.flatMap((s) => s.fields);
  const highlightFields = allFields.filter((f) => f.tone === "accent" || f.tone === "ok");
  const otherFields = allFields.filter((f) => f.tone !== "accent" && f.tone !== "ok");

  const scrollRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const startTop = useRef(0);
  const dragging = useRef(false);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const el = scrollRef.current;
    if (!el) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    startY.current = e.clientY;
    startTop.current = el.scrollTop;
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current || !scrollRef.current) return;
    scrollRef.current.scrollTop = startTop.current + (startY.current - e.clientY);
  }

  function onPointerUp() {
    dragging.current = false;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col px-5">
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto pb-3 pt-4"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ cursor: "grab" }}
      >
        <div className="flex flex-col items-center gap-3 py-2">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: "var(--ok-soft)" }}
          >
            <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8" style={{ color: "var(--ok)" }}>
              <path
                d="M7 16l6 6 12-12"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="text-[17px] font-bold" style={{ color: "var(--ok)" }}>
            {screen.status}
          </div>
        </div>

        {highlightFields.length > 0 && (
          <div
            className="rounded-[16px] border p-4 space-y-3"
            style={{ borderColor: "var(--ok)", backgroundColor: "var(--ok-soft)" }}
          >
            {highlightFields.map((field) => (
              <div key={field.label} className="flex items-start justify-between gap-3">
                <span className="text-[13px]" style={{ color: "var(--ok)" }}>{field.label}</span>
                <span className={`max-w-[58%] break-all text-right font-mono text-[13px] font-semibold leading-[1.4] ${toneText(field.tone)}`}>
                  {field.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {otherFields.length > 0 && (
          <div className="rounded-[16px] border border-[var(--line)] bg-[var(--surface)] p-4 space-y-3">
            {otherFields.map((field) => (
              <div key={field.label} className="flex items-start justify-between gap-3">
                <span className="text-[13px] text-[var(--ink-2)]">{field.label}</span>
                <span className={`max-w-[58%] break-all text-right font-mono text-[13px] leading-[1.4] ${toneText(field.tone)}`}>
                  {field.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {screen.resultDiagram === "account-abstraction" && (
          <div className="mt-3">
            <AccountAbstractionDiagram />
          </div>
        )}
      </div>

      <div className="shrink-0 space-y-2 pb-5 pt-1">
        {screen.footer && (
          <div className="text-center text-[12px] leading-[1.55] text-[var(--ink-2)]">{screen.footer}</div>
        )}
        {screen.actions && screen.actions.length > 0 && (
          <div className="flex gap-2">
            {screen.actions.map((action) => {
              const isActive = canAdvance && action.label === activeActionLabel;
              return (
                <button
                  key={action.id}
                  type="button"
                  disabled={!isActive}
                  onClick={() => isActive && onAdvance?.()}
                  className={`inline-flex h-12 flex-1 items-center justify-center rounded-[16px] text-[15px] font-semibold transition-opacity
                    ${action.tone === "accent" ? "bg-[var(--accent)] text-white"
                    : action.tone === "bad" ? "bg-[var(--bad)] text-white"
                    : "border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)]"}
                    ${!isActive ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
                >
                  {action.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
