import { motion } from "framer-motion";
import { toneText } from "@/utils/tone";
import type { UserScreen } from "@/scenarios/types";

type Props = {
  screen: UserScreen;
  canAdvance: boolean;
  activeActionLabel?: string;
  onAdvance?: () => void;
};

const qrCells = [
  1, 1, 1, 0, 1, 0, 0, 1, 1,
  1, 0, 1, 0, 0, 1, 1, 0, 1,
  1, 1, 1, 1, 0, 1, 0, 0, 1,
  0, 0, 1, 0, 1, 1, 1, 0, 0,
  1, 0, 0, 1, 1, 0, 1, 1, 1,
  0, 1, 1, 0, 0, 1, 0, 1, 0,
  1, 1, 0, 1, 0, 0, 1, 0, 1,
  1, 0, 1, 1, 1, 0, 0, 1, 0,
  0, 1, 1, 0, 1, 1, 1, 0, 1,
];

function ScannerCorner({ className }: { className: string }) {
  return <div className={`absolute h-9 w-9 border-[3px] border-white ${className}`} />;
}

export function AppQrScannerLayout({ screen, canAdvance, activeActionLabel, onAdvance }: Props) {
  const fields = screen.sections.flatMap((section) => section.fields);
  const ctaAction = screen.actions?.[0];
  const isActive = canAdvance && ctaAction?.label === activeActionLabel;
  const complete = screen.status?.includes("완료") || fields.some((field) => field.tone === "ok");

  return (
    <div className="flex min-h-0 flex-1 flex-col px-5">
      <div className="flex min-h-0 flex-1 flex-col gap-4 py-4">
        <div className="relative h-[300px] overflow-hidden rounded-[26px] bg-[#101114] shadow-inner">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.16),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(0,0,0,0.28))]" />
          <div className="absolute inset-6 rounded-[22px] border border-white/15" />

          <div className="absolute left-1/2 top-1/2 h-[188px] w-[188px] -translate-x-1/2 -translate-y-1/2">
            <ScannerCorner className="left-0 top-0 rounded-tl-[18px] border-b-0 border-r-0" />
            <ScannerCorner className="right-0 top-0 rounded-tr-[18px] border-b-0 border-l-0" />
            <ScannerCorner className="bottom-0 left-0 rounded-bl-[18px] border-r-0 border-t-0" />
            <ScannerCorner className="bottom-0 right-0 rounded-br-[18px] border-l-0 border-t-0" />

            <div className="absolute left-1/2 top-1/2 grid h-[118px] w-[118px] -translate-x-1/2 -translate-y-1/2 grid-cols-9 gap-[3px] rounded-[14px] bg-white p-3">
              {qrCells.map((filled, index) => (
                <div
                  className={`rounded-[1px] ${filled ? "bg-[#111827]" : "bg-transparent"}`}
                  key={`${filled}-${index}`}
                />
              ))}
            </div>

            {!complete && (
              <motion.div
                animate={{ y: [18, 164, 18] }}
                className="absolute left-3 right-3 top-0 h-[2px] rounded-full bg-[var(--accent)] shadow-[0_0_18px_var(--accent)]"
                transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity }}
              />
            )}
            {complete && (
              <div className="absolute inset-0 flex items-center justify-center rounded-[22px] bg-[rgba(22,163,74,0.16)]">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--ok)] text-white">
                  <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.6">
                    <path d="M5 12.5l4.2 4.2L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          <div className="absolute bottom-5 left-5 right-5 rounded-[14px] bg-black/54 px-4 py-3 text-center text-[13px] font-semibold text-white backdrop-blur">
            {screen.footer ?? "주소 인식 중..."}
          </div>
        </div>

        <div className="space-y-3">
          {screen.sections.map((section) => (
            <div className="rounded-[16px] border border-[var(--line)] bg-[var(--surface)] p-4" key={section.title}>
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-2)]">
                {section.title}
              </div>
              <div className="space-y-2.5">
                {section.fields.map((field) => (
                  <div className="flex items-start justify-between gap-3" key={field.label}>
                    <span className="text-[13px] text-[var(--ink-2)]">{field.label}</span>
                    <span className={`max-w-[58%] break-all text-right font-mono text-[13px] font-semibold leading-[1.35] ${toneText(field.tone)}`}>
                      {field.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {ctaAction && (
        <div className="pb-4">
          <button
            className={`inline-flex h-[52px] w-full items-center justify-center rounded-[16px] text-[15px] font-semibold transition-opacity
              ${ctaAction.tone === "accent" ? "bg-[var(--accent)] text-white" : "border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)]"}
              ${!isActive ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
            disabled={!isActive}
            onClick={() => isActive && onAdvance?.()}
            type="button"
          >
            {ctaAction.label}
          </button>
        </div>
      )}
    </div>
  );
}
