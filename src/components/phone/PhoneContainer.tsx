import { motion } from "framer-motion";
import type { UserScreen } from "@/scenarios/types";
import { PhoneStatusBar } from "./PhoneStatusBar";
import { PhoneScreen } from "./PhoneScreen";

type Props = {
  screen: UserScreen;
  actor: string;
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
  shake = false,
  stepIndicator,
  activeActionLabel,
  canAdvance = false,
  onAdvance,
  onFieldChange,
}: Props) {
  return (
    <section className="flex flex-col items-center">
      <div className="mb-5 flex w-full max-w-[352px] items-center justify-between">
        <div>
          <div className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--ink-2)]">사용자 화면</div>
          <div className="mt-1 text-[15px] font-semibold text-[var(--ink)]">{actor}</div>
          {stepIndicator && (
            <div className="mt-1 font-mono text-[11px] text-[var(--muted)]">{stepIndicator}</div>
          )}
        </div>
        <div className="inline-flex h-6 items-center rounded-full bg-[var(--surface-2)] px-3 text-[11px] font-medium text-[var(--ink-2)]">
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
          <PhoneStatusBar />
          <div className="flex h-11 shrink-0 items-center justify-between border-b border-[var(--line)] px-5">
            <button className="text-[18px] font-semibold text-[var(--ink-2)]" type="button">
              &lt;
            </button>
            <div className="text-[14px] font-semibold text-[var(--ink)]">zkWallet</div>
            <div className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-semibold text-[var(--ink-2)]">
              Demo
            </div>
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
      </motion.div>
    </section>
  );
}
