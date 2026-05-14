import { useRef } from "react";
import { toneText } from "@/utils/tone";
import type { UserScreen } from "@/scenarios/types";
import { isEditableField } from "@/utils/liveValues";

type Props = {
  screen: UserScreen;
  canAdvance: boolean;
  activeActionLabel?: string;
  onAdvance?: () => void;
  onFieldChange?: (screenId: string, label: string, value: string) => void;
};

export function AppFormLayout({ screen, canAdvance, activeActionLabel, onAdvance, onFieldChange }: Props) {
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
        className="min-h-0 flex-1 overflow-y-auto py-2"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ cursor: dragging.current ? "grabbing" : "grab" }}
      >
        <div className="flex flex-col gap-5">
          {screen.sections.map((section) => (
            <div key={section.title}>
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-2)]">
                {section.title}
              </div>
              {section.variant === "cards" ? (
                <div className="grid gap-2">
                  {section.fields.map((field) => (
                    <div
                      key={`${section.title}-${field.label}`}
                      className="rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 py-3"
                      style={
                        field.tone === "ok"
                          ? { borderColor: "var(--ok)", backgroundColor: "var(--ok-soft)" }
                          : field.tone === "accent"
                          ? { borderColor: "var(--accent)", backgroundColor: "var(--accent-soft)" }
                          : {}
                      }
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[14px] font-semibold text-[var(--ink)]">{field.label}</span>
                        <span className={`font-mono text-[12px] font-semibold ${toneText(field.tone)}`}>
                          {field.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
              <div className="overflow-hidden rounded-[14px] border border-[var(--line)] bg-[var(--surface)]">
                {section.fields.map((field, i) => (
                  field.picker ? (
                    <div key={`${section.title}-${field.label}`} className={`px-4 py-3 ${i > 0 ? "border-t border-[var(--line)]" : ""}`}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-[12px] text-[var(--ink-2)]">{field.label}</span>
                        <button
                          type="button"
                          className="flex items-center gap-1 rounded-[8px] bg-[var(--accent-soft)] px-2 py-1 text-[11px] font-semibold text-[var(--accent)]"
                        >
                          <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 4h12M2 8h8M2 12h10" />
                          </svg>
                          {field.picker}
                        </button>
                      </div>
                      <div className="rounded-[10px] border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2.5 font-mono text-[13px] leading-[1.5] text-[var(--ink)]">
                        {field.value}
                      </div>
                    </div>
                  ) : isEditableField(field) ? (
                    <div key={`${section.title}-${field.label}`} className={`px-4 py-3 ${i > 0 ? "border-t border-[var(--line)]" : ""}`}>
                      <div className="mb-1.5 text-[12px] text-[var(--ink-2)]">{field.label}</div>
                      <input
                        aria-label={field.label}
                        className="w-full rounded-[10px] border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2.5 font-mono text-[13px] leading-[1.5] text-[var(--ink)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
                        onChange={(event) => onFieldChange?.(screen.id, field.label, event.target.value)}
                        value={field.value}
                      />
                    </div>
                  ) : (
                    <div key={`${section.title}-${field.label}`} className={`flex items-center justify-between gap-3 px-4 py-3 ${i > 0 ? "border-t border-[var(--line)]" : ""}`}>
                      <span className="text-[13px] text-[var(--ink-2)]">{field.label}</span>
                      <span className={`break-all text-right font-mono text-[13px] font-medium leading-[1.4] ${toneText(field.tone)}`}>
                        {field.value}
                      </span>
                    </div>
                  )
                ))}
              </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="shrink-0 pb-4 space-y-2">
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
                  className={`inline-flex h-[52px] flex-1 items-center justify-center rounded-[16px] text-[15px] font-semibold transition-opacity
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
