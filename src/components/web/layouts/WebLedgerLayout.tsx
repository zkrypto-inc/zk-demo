import type { LedgerRow, Tone, UserScreen } from "@/scenarios/types";

type Props = {
  screen: UserScreen;
  canAdvance: boolean;
  activeActionLabel?: string;
  onAdvance?: () => void;
};

function bannerStyle(tone: Tone) {
  switch (tone) {
    case "bad":  return { border: "border-[var(--bad)]",    bg: "bg-[var(--bad-soft)]",    text: "text-[var(--bad)]" };
    case "warn": return { border: "border-[var(--warn)]",   bg: "bg-[var(--warn-soft)]",   text: "text-[var(--warn)]" };
    case "ok":   return { border: "border-[var(--ok)]",     bg: "bg-[var(--ok-soft)]",     text: "text-[var(--ok)]" };
    default:     return { border: "border-[var(--accent)]", bg: "bg-[var(--accent-soft)]", text: "text-[var(--accent)]" };
  }
}

function callBadge(call: LedgerRow["call"]) {
  if (call === "DELEGATECALL") return { label: "DELEGATECALL", color: "text-[var(--ink-2)]" };
  if (call === "STATICCALL")   return { label: "STATICCALL",   color: "text-[var(--muted)]" };
  return { label: "CALL", color: "text-[var(--ink)]" };
}

function Row({ row, canAdvance, onAdvance }: { row: LedgerRow; canAdvance: boolean; onAdvance?: () => void }) {
  const badge = callBadge(row.call);
  const indent = row.indent ?? 0;
  const blocked = row.status === "blocked";
  const rowBg = row.duplicate ? "bg-[var(--bad-soft)]/30" : "";
  const clickable = row.blockable && canAdvance;

  return (
    <div
      className={`grid grid-cols-[130px_minmax(0,1fr)_110px_100px] items-center gap-3 border-b border-[var(--line)] px-4 py-2.5 text-[12px] last:border-b-0 ${rowBg}`}
    >
      <div className={`flex items-center gap-1 ${badge.color}`} style={{ paddingLeft: `${indent * 14}px` }}>
        {indent > 0 && <span className="text-[var(--muted)]">└</span>}
        <span className="font-mono text-[11px] font-semibold">{badge.label}</span>
      </div>

      <div className="min-w-0 truncate font-mono text-[11px] text-[var(--ink-2)]">
        <span className="text-[var(--ink)]">{row.from}</span>
        <span className="mx-1 text-[var(--muted)]">→</span>
        <span className="text-[var(--ink)]">{row.to}</span>
        <span className="ml-2 text-[var(--muted)]">·</span>
        <span className="ml-1">{row.method}</span>
      </div>

      <div className="text-right font-mono text-[11px] text-[var(--ink-2)]">
        {row.amount ?? "0"}
      </div>

      <div className="text-right">
        {row.blockable && !blocked && (
          <button
            type="button"
            disabled={!clickable}
            onClick={() => clickable && onAdvance?.()}
            className={`rounded-md bg-[var(--bad)] px-2.5 py-1 text-[11px] font-semibold text-white transition-opacity ${
              clickable ? "cursor-pointer hover:opacity-90" : "cursor-not-allowed opacity-50"
            }`}
          >
            지급 차단
          </button>
        )}
        {blocked && (
          <span className="rounded-md bg-[var(--bad-soft)] px-2.5 py-1 font-mono text-[11px] font-semibold text-[var(--bad)]">
            차단됨
          </span>
        )}
      </div>
    </div>
  );
}

export function WebLedgerLayout({ screen, canAdvance, onAdvance }: Props) {
  const ledger = screen.ledger;
  if (!ledger) return null;
  const { banner, caseId, rows, actionLog } = ledger;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
      {banner && (
        <div className={`rounded-xl border ${bannerStyle(banner.tone).border} ${bannerStyle(banner.tone).bg} px-4 py-3`}>
          <div className={`text-[11px] font-semibold uppercase tracking-[0.06em] ${bannerStyle(banner.tone).text}`}>
            {banner.title}
          </div>
          {banner.subtitle && (
            <div className="mt-1 text-[12px] leading-[1.5] text-[var(--ink-2)]">{banner.subtitle}</div>
          )}
          {caseId && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded bg-[var(--surface)] px-2 py-0.5 font-mono text-[10px] text-[var(--ink-2)]">
              <span className="text-[var(--muted)]">case</span>
              <span className="font-semibold text-[var(--ink)]">{caseId}</span>
            </div>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)]">
        <div className="grid grid-cols-[130px_minmax(0,1fr)_110px_100px] items-center gap-3 border-b border-[var(--line)] bg-[var(--surface-2)] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-[var(--muted)]">
          <div>내부 트랜잭션</div>
          <div>전송자 → 수신자 / 메서드</div>
          <div className="text-right">수량 (BTC)</div>
          <div className="text-right">조치</div>
        </div>
        {rows.map((row, i) => (
          <Row key={i} row={row} canAdvance={canAdvance} onAdvance={onAdvance} />
        ))}
      </div>

      {actionLog && actionLog.length > 0 && (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-2)]">
            조치 이력
          </div>
          <div className="space-y-1 font-mono text-[11px] text-[var(--ink-2)]">
            {actionLog.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
