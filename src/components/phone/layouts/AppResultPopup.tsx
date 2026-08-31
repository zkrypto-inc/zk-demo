import { motion } from "framer-motion";
import type { UserScreen } from "@/scenarios/types";
import { toneText } from "@/utils/tone";

// result + popup(screen.popup=true) 연출용 두 조각:
// - PopupBackground: 뒤에 깔리는 '출금 요청' 앱 화면. PhoneContainer가 앱 헤더와 함께
//   통째로 블러 처리한다(팝업이 뜰 때 뒤 전체가 흐려지도록).
// - PopupCard: 중앙에 뜨는 '지급 보류' 알림 카드. 블러 밖 오버레이로 렌더된다.

type CardProps = {
  screen: UserScreen;
  canAdvance: boolean;
  activeActionLabel?: string;
  onAdvance?: () => void;
};

export function PopupBackground({ screen }: { screen: UserScreen }) {
  const requestSection = screen.sections[0];
  if (!requestSection) return null;
  return (
    <div className="flex h-full flex-col px-5 pt-4">
      <div className="text-[20px] font-semibold leading-6 text-[var(--ink)]">{requestSection.title}</div>
      <div className="mt-4 space-y-3 rounded-[16px] border border-[var(--line)] bg-[var(--surface)] p-4">
        {requestSection.fields.map((field) => (
          <div key={field.label} className="flex items-start justify-between gap-3">
            <span className="text-[13px] text-[var(--ink-2)]">{field.label}</span>
            <span className="max-w-[58%] break-all text-right font-mono text-[13px] leading-[1.4] text-[var(--ink)]">
              {field.value}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-auto pb-5">
        <div className="flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[var(--surface-2)] text-[14px] font-semibold text-[var(--ink-2)]">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--ink-2)]" />
          요청 처리 중…
        </div>
      </div>
    </div>
  );
}

export function PopupCard({ screen, canAdvance, activeActionLabel, onAdvance }: CardProps) {
  const blocked = screen.statusTone === "bad" || screen.statusTone === "warn";
  const statusColor = screen.statusTone === "bad" ? "bad" : screen.statusTone === "warn" ? "warn" : "ok";
  const fields = screen.sections.flatMap((s) => s.fields);

  return (
    <motion.div
      key="popup-card"
      className="relative flex max-h-[90%] w-full max-w-[268px] flex-col overflow-hidden rounded-[24px] bg-[var(--surface)] shadow-[0_16px_48px_rgba(0,0,0,0.4)]"
      initial={{ opacity: 0, scale: 0.9, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.32, ease: [0.2, 0, 0, 1] }}
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
  );
}
