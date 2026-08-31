import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { ScenarioId, UserScreen } from "@/scenarios/types";
import { getProductLabelByScenarioId } from "@/scenarios/groups";
import { PhoneStatusBar } from "./PhoneStatusBar";
import { PhoneScreen } from "./PhoneScreen";
import { PopupCard } from "./layouts/AppResultPopup";

type Props = {
  screen: UserScreen;
  actor: string;
  scenarioId?: ScenarioId;
  shake?: boolean;
  stepIndicator?: string;
  activeActionLabel?: string;
  canAdvance?: boolean;
  onAdvance?: () => void;
  onFieldChange?: (screenId: string, label: string, value: string) => void;
};

export function PhoneContainer({
  screen,
  actor,
  scenarioId,
  shake = false,
  stepIndicator,
  activeActionLabel,
  canAdvance = false,
  onAdvance,
  onFieldChange,
}: Props) {
  const productLabel = scenarioId ? getProductLabelByScenarioId(scenarioId) : "zkWallet";

  // result + popup: 앱 헤더와 배경(출금 요청 화면)을 통째로 블러하고 그 위에 알림 팝업을 얹는다.
  // 진입 직후엔 배경이 선명하게 보이다가(revealed=false), 잠시 뒤 배경이 블러되며 팝업이 등장한다.
  const isPopup = screen.layout === "result" && screen.popup === true;
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (!isPopup) {
      setRevealed(false);
      return;
    }
    const t = setTimeout(() => setRevealed(true), 480);
    return () => clearTimeout(t);
  }, [isPopup, screen.id]);

  return (
    <section className="flex flex-col items-center">
      <div className="mb-5 flex w-full max-w-[352px] items-center justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">사용자 화면</div>
          <div className="mt-1.5 text-[15px] font-semibold text-[var(--ink)]">{actor}</div>
          {stepIndicator && (
            <div className="mt-1 font-mono text-[11px] text-[var(--muted)]">{stepIndicator}</div>
          )}
        </div>
        <div className="inline-flex h-6 items-center border border-[var(--line)] px-2.5 font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--ink-2)]">
          {screen.status}
        </div>
      </div>

      <motion.div
        animate={shake ? { x: [-2, 2, -2, 0] } : { x: 0 }}
        transition={{ duration: 0.6 }}
        className="relative h-[680px] w-[320px] rounded-[56px] bg-[var(--bezel)] p-[11px] shadow-[0_2px_8px_rgba(0,0,0,0.08),0_20px_56px_rgba(0,0,0,0.18),inset_0_0_0_0.5px_rgba(255,255,255,0.06)]"
      >
        <div className="absolute -left-[3.5px] top-[118px] h-[32px] w-[3.5px] rounded-l-[2px] bg-[var(--bezel)] brightness-75" />
        <div className="absolute -left-[3.5px] top-[171px] h-[60px] w-[3.5px] rounded-l-[2px] bg-[var(--bezel)] brightness-75" />
        <div className="absolute -left-[3.5px] top-[250px] h-[60px] w-[3.5px] rounded-l-[2px] bg-[var(--bezel)] brightness-75" />
        <div className="absolute -right-[3.5px] top-[188px] h-[80px] w-[3.5px] rounded-r-[2px] bg-[var(--bezel)] brightness-75" />

        <div className="relative flex h-full flex-col overflow-hidden rounded-[50px] bg-[var(--surface)]">
          <div className="absolute left-1/2 top-[10px] z-20 h-[28px] w-[92px] -translate-x-1/2 rounded-[20px] bg-black" />
          <div className="relative z-20">
            <PhoneStatusBar />
          </div>
          {/* 앱 헤더 + 콘텐츠 — popup이면 통째로 블러 대상 */}
          <div
            className={`flex min-h-0 flex-1 flex-col transition-[filter] duration-[600ms] ease-[cubic-bezier(0.2,0,0,1)] ${
              isPopup && revealed ? "blur-[3px]" : ""
            }`}
          >
            <div className="relative flex h-11 shrink-0 items-center justify-center border-b border-[var(--line)] px-5">
              <button className="absolute left-4 flex h-7 w-7 items-center justify-center text-[var(--ink-2)]" type="button">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <div className="text-[14px] font-semibold text-[var(--ink)]">{productLabel}</div>
            </div>
            <PhoneScreen
              screen={screen}
              activeActionLabel={activeActionLabel}
              canAdvance={canAdvance}
              onAdvance={onAdvance}
              onFieldChange={onFieldChange}
            />
            <div className="shrink-0 py-[8px]">
              <div className="mx-auto h-[5px] w-[148px] rounded-full bg-[rgba(82,82,91,0.4)]" />
            </div>
          </div>

          {/* 팝업 오버레이 — 상태바 아래 폰 화면 전체(앱 헤더 포함)를 덮는다(딤 + 중앙 카드) */}
          {isPopup && (
            <div className="absolute inset-0 z-10">
              <motion.div
                className="absolute inset-0 bg-black/25"
                initial={{ opacity: 0 }}
                animate={{ opacity: revealed ? 1 : 0 }}
                transition={{ duration: 0.5 }}
              />
              <div className="absolute inset-0 flex items-center justify-center px-4">
                <AnimatePresence>
                  {revealed && (
                    <PopupCard
                      screen={screen}
                      canAdvance={canAdvance}
                      activeActionLabel={activeActionLabel}
                      onAdvance={onAdvance}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
