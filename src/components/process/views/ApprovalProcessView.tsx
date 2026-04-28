import { toneBg } from "@/utils/tone";
import type { ApproverCard, ProcessView } from "@/scenarios/types";

const STATUS_LABEL: Record<ApproverCard["status"], string> = {
  approved: "승인 완료",
  pending: "검토 중",
  waiting: "대기 중",
};

const STATUS_TONE: Record<ApproverCard["status"], Parameters<typeof toneBg>[0]> = {
  approved: "ok",
  pending: "warn",
  waiting: "neutral",
};

type Props = { view: Extract<ProcessView, { kind: "approval" }> };

export function ApprovalProcessView({ view }: Props) {
  return (
    <div>
      <p className="mb-5 text-[14px] leading-[1.65] text-[var(--ink-2)]">{view.description}</p>
      <div className="space-y-3">
        {view.approvers.map((approver, i) => (
          <div key={`${approver.name}-${i}`} className="flex items-start gap-4 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-[13px] font-semibold text-[var(--ink-2)]">
              {i + 1}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[14px] font-semibold text-[var(--ink)]">{approver.name}</div>
                <span className={`inline-flex h-5 items-center rounded-full px-2 text-[11px] font-semibold ${toneBg(STATUS_TONE[approver.status])}`}>
                  {STATUS_LABEL[approver.status]}
                </span>
              </div>
              <div className="mt-1 text-[12px] text-[var(--ink-2)]">{approver.role}</div>
              {approver.note && <div className="mt-1 text-[12px] text-[var(--muted)]">{approver.note}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
