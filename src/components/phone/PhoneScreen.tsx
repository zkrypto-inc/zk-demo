import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { UserScreen } from "@/scenarios/types";
import { AppCtaLayout } from "./layouts/AppCtaLayout";
import { AppFormLayout } from "./layouts/AppFormLayout";
import { AppProcessingLayout } from "./layouts/AppProcessingLayout";
import { AppQrScannerLayout } from "./layouts/AppQrScannerLayout";
import { AppResultLayout } from "./layouts/AppResultLayout";

type Props = {
  screen: UserScreen;
  activeActionLabel?: string;
  canAdvance?: boolean;
  onAdvance?: () => void;
  onFieldChange?: (screenId: string, label: string, value: string) => void;
};

function ProgressBoxes({ progress }: { progress: NonNullable<UserScreen["progressBoxes"]> }) {
  const [cycleIndex, setCycleIndex] = useState(0);
  const cycle = progress.cycle && progress.cycle.length > 0 ? progress.cycle : undefined;
  const completed = cycle ? cycle[cycleIndex] : progress.completed;

  useEffect(() => {
    if (!cycle || cycle.length <= 1) return undefined;

    const id = setInterval(() => {
      setCycleIndex((index) => (index + 1) % cycle.length);
    }, 900);

    return () => clearInterval(id);
  }, [cycle]);

  return (
    <div className="shrink-0 border-b border-[var(--line)] px-5 py-3">
      {progress.label && (
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-2)]">
          {progress.label}
        </div>
      )}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${progress.total}, minmax(0, 1fr))` }}>
        {Array.from({ length: progress.total }).map((_, index) => {
          const filled = index < completed;
          return (
            <div
              key={index}
              className={`h-[18px] rounded-[7px] border transition ${
                filled
                  ? "border-[var(--accent)] bg-[var(--accent)]"
                  : "border-[var(--line)] bg-[var(--surface-2)]"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

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
            {screen.subtitle && (
              <div className="mt-2 text-[14px] leading-[1.55] text-[var(--ink-2)]">{screen.subtitle}</div>
            )}
          </div>
        )}

        {screen.progressBoxes && <ProgressBoxes progress={screen.progressBoxes} />}

        {/* Layout-specific content */}
        {screen.layout === "cta" && <AppCtaLayout {...layoutProps} />}
        {screen.layout === "form" && <AppFormLayout {...layoutProps} />}
        {screen.layout === "processing" && <AppProcessingLayout {...layoutProps} />}
        {screen.layout === "scanner" && <AppQrScannerLayout {...layoutProps} />}
        {screen.layout === "result" && <AppResultLayout {...layoutProps} />}
        {screen.layout === "approval" && <AppFormLayout {...layoutProps} />}
        {screen.layout === "dashboard" && <AppFormLayout {...layoutProps} />}
      </motion.div>
    </AnimatePresence>
  );
}
