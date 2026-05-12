import { AnimatePresence, motion } from "framer-motion";
import type { UserScreen } from "@/scenarios/types";
import { WebFormLayout } from "./layouts/WebFormLayout";
import { WebApprovalLayout } from "./layouts/WebApprovalLayout";
import { WebProcessingLayout } from "./layouts/WebProcessingLayout";
import { WebResultLayout } from "./layouts/WebResultLayout";
import { WebDashboardLayout } from "./layouts/WebDashboardLayout";
import { WebLedgerLayout } from "./layouts/WebLedgerLayout";
import { WebAuditTableLayout } from "./layouts/WebAuditTableLayout";

type Props = {
  screen: UserScreen;
  actor: string;
  activeActionLabel?: string;
  canAdvance?: boolean;
  onAdvance?: () => void;
  onFieldChange?: (screenId: string, label: string, value: string) => void;
};

export function WebScreen({ screen, actor, activeActionLabel, canAdvance = false, onAdvance, onFieldChange }: Props) {
  const layoutProps = { screen, canAdvance, activeActionLabel, onAdvance, onFieldChange };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screen.id}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        initial={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.16, ease: [0.2, 0, 0, 1] }}
        className="flex flex-col h-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-3">
          <div>
            <div className="text-[13px] font-semibold text-[var(--ink)]">{screen.title}</div>
            {screen.subtitle && (
              <div className="text-[12px] text-[var(--ink-2)]">{screen.subtitle}</div>
            )}
          </div>
          {screen.status && (
            <div className="inline-flex h-5 items-center rounded-full bg-[var(--surface-2)] px-2.5 text-[11px] font-medium text-[var(--ink-2)]">
              {screen.status}
            </div>
          )}
        </div>

        {/* Layout-specific content */}
        {screen.layout === "form" && <WebFormLayout {...layoutProps} />}
        {screen.layout === "approval" && <WebApprovalLayout {...layoutProps} />}
        {screen.layout === "processing" && <WebProcessingLayout {...layoutProps} />}
        {screen.layout === "result" && <WebResultLayout {...layoutProps} />}
        {screen.layout === "dashboard" && <WebDashboardLayout {...layoutProps} />}
        {screen.layout === "ledger" && <WebLedgerLayout {...layoutProps} />}
        {screen.layout === "audit-table" && <WebAuditTableLayout {...layoutProps} />}
        {screen.layout === "cta" && <WebDashboardLayout {...layoutProps} />}

        {/* Actor badge */}
        <div className="flex items-center gap-2 border-t border-[var(--line)] px-4 py-2">
          <div className="h-1.5 w-1.5 rounded-full bg-[var(--ok)]" />
          <span className="text-[11px] text-[var(--muted)]">{actor}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
