import { useMemo, useState } from "react";
import type { UserScreen } from "@/scenarios/types";

type Props = {
  screen: UserScreen;
  canAdvance: boolean;
  activeActionLabel?: string;
  onAdvance?: () => void;
};

export function WebAuditTableLayout({ screen, canAdvance, activeActionLabel, onAdvance }: Props) {
  const data = screen.auditTable;
  const initialChecked = useMemo(
    () => new Set<string>(data ? data.rows.map((r) => r.id) : []),
    [data],
  );
  const [checked, setChecked] = useState<Set<string>>(
    data?.mode === "request" ? new Set() : initialChecked,
  );

  if (!data) return null;
  const { mode, rows } = data;
  const hasAnyChecked = checked.size > 0;

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        <div className="overflow-hidden rounded-md border border-[var(--line)]">
          {mode === "request" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead className="bg-[var(--surface-2)]">
                  <tr className="text-[10px] font-semibold uppercase tracking-[0.04em] text-[var(--muted)]">
                    <th className="whitespace-nowrap px-3 py-2 text-center">선택</th>
                    <th className="whitespace-nowrap px-3 py-2 text-left">유형</th>
                    <th className="whitespace-nowrap px-3 py-2 text-left">txHash</th>
                    <th className="whitespace-nowrap px-3 py-2 text-left">From</th>
                    <th className="whitespace-nowrap px-3 py-2 text-left">To</th>
                    <th className="whitespace-nowrap px-3 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const isChecked = checked.has(row.id);
                    return (
                      <tr
                        key={row.id}
                        className={`border-t border-[var(--line)] ${
                          isChecked ? "bg-[var(--accent-soft)]" : ""
                        } cursor-pointer hover:bg-[var(--surface-2)]`}
                        onClick={() => toggle(row.id)}
                      >
                        <td className="px-3 py-2 text-center">
                          <input
                            aria-label={`select ${row.type}`}
                            checked={isChecked}
                            className="h-3.5 w-3.5 cursor-pointer accent-[var(--accent)]"
                            onChange={() => toggle(row.id)}
                            onClick={(e) => e.stopPropagation()}
                            type="checkbox"
                          />
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-[var(--ink-2)]">{row.type}</td>
                        <td className="whitespace-nowrap px-3 py-2 font-mono text-[var(--ink)]">{row.txHash}</td>
                        <td className="whitespace-nowrap px-3 py-2 font-mono text-[var(--muted)]">{row.from}</td>
                        <td className="whitespace-nowrap px-3 py-2 font-mono text-[var(--muted)]">{row.to}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-right font-mono text-[var(--muted)]">
                          {row.amount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead className="bg-[var(--surface-2)]">
                  <tr className="text-[10px] font-semibold uppercase tracking-[0.04em] text-[var(--muted)]">
                    <th className="whitespace-nowrap px-3 py-2 text-left">유형</th>
                    <th className="whitespace-nowrap px-3 py-2 text-left">txHash</th>
                    <th className="whitespace-nowrap px-3 py-2 text-left">From</th>
                    <th className="whitespace-nowrap px-3 py-2 text-left">To</th>
                    <th className="whitespace-nowrap px-3 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const d = row.decrypted;
                    return (
                      <tr key={row.id} className="border-t border-[var(--line)]">
                        <td className="whitespace-nowrap px-3 py-2 text-[var(--ink-2)]">{row.type}</td>
                        <td className="whitespace-nowrap px-3 py-2 font-mono text-[var(--ink)]">{row.txHash}</td>
                        <td className="whitespace-nowrap px-3 py-2 font-mono text-[var(--ok)]">{d?.from ?? "—"}</td>
                        <td className="whitespace-nowrap px-3 py-2 font-mono text-[var(--ok)]">{d?.to ?? "—"}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-right font-mono text-[var(--ok)]">
                          {d?.amount ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {screen.actions && screen.actions.length > 0 && (
        <div className="flex gap-2 border-t border-[var(--line)] px-4 py-3">
          {screen.actions.map((action) => {
            const matchesActive = canAdvance && action.label === activeActionLabel;
            const requireChecked = mode === "request";
            const isActive = matchesActive && (!requireChecked || hasAnyChecked);
            return (
              <button
                key={action.id}
                type="button"
                disabled={!isActive}
                onClick={() => isActive && onAdvance?.()}
                className={`inline-flex h-9 flex-1 items-center justify-center rounded-md text-[13px] font-semibold transition-opacity
                  ${action.tone === "accent" ? "bg-[var(--accent)] text-white"
                  : action.tone === "bad" ? "bg-[var(--bad)] text-white"
                  : "border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)]"}
                  ${!isActive ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
              >
                {action.label}
                {requireChecked && hasAnyChecked && ` (${checked.size}건)`}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
