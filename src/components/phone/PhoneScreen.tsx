import { AnimatePresence, motion } from "framer-motion";
import type { UserScreen } from "@/scenarios/types";
import { AppCtaLayout } from "./layouts/AppCtaLayout";
import { AppFormLayout } from "./layouts/AppFormLayout";
import { AppProcessingLayout } from "./layouts/AppProcessingLayout";
import { AppResultLayout } from "./layouts/AppResultLayout";

type Props = {
  screen: UserScreen;
  activeActionLabel?: string;
  canAdvance?: boolean;
  onAdvance?: () => void;
  onFieldChange?: (screenId: string, label: string, value: string) => void;
};

export function PhoneScreen({ screen, activeActionLabel, canAdvance = false, onAdvance, onFieldChange }: Props) {
  const layoutProps = { screen, canAdvance, activeActionLabel, onAdvance, onFieldChange };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screen.id}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.16, ease: [0.2, 0, 0, 1] }}
        className="flex flex-1 flex-col overflow-hidden"
      >
        {/* Header — hidden for CTA layout (it handles its own title) */}
        {screen.layout !== "cta" && (
          <div className="shrink-0 border-b border-[var(--line)] px-5 pt-4 pb-4">
            <div className="text-[20px] font-semibold leading-6 text-[var(--ink)]">{screen.title}</div>
            <div className="mt-2 text-[14px] leading-[1.55] text-[var(--ink-2)]">{screen.subtitle}</div>
          </div>
        )}

        {/* Layout-specific content */}
        {screen.layout === "cta" && <AppCtaLayout {...layoutProps} />}
        {screen.layout === "form" && <AppFormLayout {...layoutProps} />}
        {screen.layout === "processing" && <AppProcessingLayout {...layoutProps} />}
        {screen.layout === "result" && <AppResultLayout {...layoutProps} />}
        {screen.layout === "approval" && <AppFormLayout {...layoutProps} />}
        {screen.layout === "dashboard" && <AppFormLayout {...layoutProps} />}
      </motion.div>
    </AnimatePresence>
  );
}
