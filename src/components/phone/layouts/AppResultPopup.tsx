import { motion } from "framer-motion";
import type { UserScreen } from "@/scenarios/types";
import { toneText } from "@/utils/tone";

type Props = {
  screen: UserScreen;
  canAdvance: boolean;
  activeActionLabel?: string;
  onAdvance?: () => void;
};

// result 화면을 폰 화면 전체 대신 중앙 모달 팝업으로 렌더한다 (screen.popup=true).
// 앱을 쓰던 중 알림 다이얼로그가 뜨는 연출 — ZP-4 지급 보류.
export function AppResultPopup({ screen, canAdvance, activeActionLabel, onAdvance }: Props) {
  const blocked = screen.statusTone === "bad" || screen.statusTone === "warn";
  const statusColor = screen.statusTone === "bad" ? "bad" : screen.statusTone === "warn" ? "warn" : "ok";
  const fields = screen.sections.flatMap((s) => s.fields);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center px-4">
      {/* 딤 배경 */}
      <motion.div
        className="absolute inset-0 bg-black/45"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
      {/* 중앙 카드 */}
      <motion.div
        className="relative z-10 flex max-h-[90%] w-full max-w-[268px] flex-col overflow-hidden rounded-[24px] bg-[var(--surface)] shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
        initial={{ opacity: 0, scale: 0.92, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-6">
          {/* 아이콘 + 제목 + 상태 */}
          <div className="flex flex-col items-center gap-2.5">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: `var(--${statusColor}-soft)` }}
            >
              <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7" style={{ color: `var(--${statusColor})` }}>
                <path
                  d={blocked ? "M16 8v10M16 23.5v.5" : "M7 16l6 6 12-12"}
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {blocked && <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2.5" />}
              </svg>
            </div>
            <div className="text-center text-[16px] font-bold leading-[1.35] text-[var(--ink)]">{screen.title}</div>
            <div
              className="inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold"
              style={{ backgroundColor: `var(--${statusColor}-soft)`, color: `var(--${statusColor})` }}
            >
              {screen.status}
            </div>
          </div>

          {/* 필드 */}
          {fields.length > 0 && (
            <div className="mt-4 space-y-2.5 rounded-[16px] border border-[var(--line)] bg-[var(--surface-2)] p-3.5">
              {fields.map((field) => (
                <div key={field.label} className="flex items-start justify-between gap-3">
                  <span className="shrink-0 text-[12px] text-[var(--ink-2)]">{field.label}</span>
                  <span className={`break-all text-right font-mono text-[12px] font-medium leading-[1.4] ${toneText(field.tone)}`}>
                    {field.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* 사유 안내 */}
          {screen.footer && (
            <div className="mt-3 text-center text-[11.5px] leading-[1.55] text-[var(--ink-2)]">{screen.footer}</div>
          )}
        </div>

        {/* 액션 버튼 (있을 때만) */}
        {screen.actions && screen.actions.length > 0 && (
          <div className="flex shrink-0 gap-2 border-t border-[var(--line)] p-3.5">
            {screen.actions.map((action) => {
              const isActive = canAdvance && action.label === activeActionLabel;
              return (
                <button
                  key={action.id}
                  type="button"
                  disabled={!isActive}
                  onClick={() => isActive && onAdvance?.()}
                  className={`inline-flex h-11 flex-1 items-center justify-center rounded-[14px] text-[14px] font-semibold transition-opacity
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
      </motion.div>
    </div>
  );
}
