import type { RecapPanel, RecapRow, UserScreen } from "@/scenarios/types";
import { navigateToRoute } from "@/router";
import { actorGroups, scenarioGroupLookup } from "@/scenarios";

type Props = {
  screen: UserScreen;
};

function RecapMiniCard({ row }: { row: RecapRow }) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)]/90 px-4 py-3">
      <div className="text-[11px] text-[var(--ink-2)]">{row.label}</div>
      <div
        className={`mt-1.5 break-all text-[13px] font-semibold ${row.mono ? "font-mono" : ""} ${
          row.ok ? "text-[var(--ok)]" : "text-[var(--ink)]"
        }`}
      >
        {row.value}
      </div>
    </div>
  );
}

function handleCtaClick(target: NonNullable<RecapPanel["cta"]>["target"]) {
  if (target.type === "scenario") {
    const actorId = scenarioGroupLookup[target.scenarioId];
    const productId = actorGroups.find((g) => g.id === actorId)?.productId ?? "zkwallet";
    navigateToRoute({
      name: "scenario",
      productId,
      actorId,
      scenarioId: target.scenarioId,
      stepIndex: target.stepIndex ?? 0,
    });
    return;
  }
  const productId = actorGroups.find((g) => g.id === target.actorId)?.productId ?? "zkwallet";
  navigateToRoute({ name: "actor", productId, actorId: target.actorId });
}

function Panel({ panel }: { panel: RecapPanel }) {
  const isOkCta = panel.cta?.tone === "ok" || panel.cta?.tone === "accent";
  return (
    <section className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-[18px] font-bold text-[var(--ink)]">{panel.title}</h2>
        {panel.subtitle && (
          <p className="mt-1 text-[13px] leading-[1.6] text-[var(--ink-2)]">{panel.subtitle}</p>
        )}
      </div>

      <div className="rounded-xl border border-[var(--ok)] bg-[var(--ok-soft)] p-4">
        <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.05em] text-[var(--ok)]">
          {panel.groupTitle}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {panel.rows.map((row, i) => {
            const fullWidth = row.label === "감사 이벤트" || row.label === "Raw Signature";
            return (
              <div key={i} className={fullWidth ? "sm:col-span-2" : undefined}>
                <RecapMiniCard row={row} />
              </div>
            );
          })}
        </div>
      </div>

      {panel.cta && (
        <button
          type="button"
          onClick={() => handleCtaClick(panel.cta!.target)}
          className={`mt-4 w-full rounded-lg px-4 py-3 text-left text-[13px] font-semibold transition ${
            panel.cta.tone === "accent"
              ? "bg-[var(--accent)] text-white hover:opacity-90"
              : "bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[var(--accent-soft)]/70"
          }`}
        >
          {panel.cta.label} →
        </button>
      )}
    </section>
  );
}

export function WebRecapLayout({ screen }: Props) {
  const recap = screen.recap;
  if (!recap) return null;

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-5">
      <div className="space-y-2">
        {recap.eyebrow && (
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-2)]">
            {recap.eyebrow}
          </div>
        )}
        <h1 className="text-[24px] font-bold leading-tight text-[var(--ink)]">{recap.heading}</h1>
        {recap.description && (
          <p className="max-w-[820px] text-[13px] leading-[1.6] text-[var(--ink-2)]">{recap.description}</p>
        )}
      </div>

      {recap.badges && recap.badges.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3">
          {recap.badges.map((badge, i) => (
            <span
              key={badge}
              className="flex items-center gap-2"
            >
              <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[12px] font-semibold text-[var(--accent)]">
                {badge}
              </span>
              {i < recap.badges!.length - 1 && <span className="text-[var(--muted)]">→</span>}
            </span>
          ))}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {recap.panels.map((panel, i) => (
          <Panel key={i} panel={panel} />
        ))}
      </div>
    </div>
  );
}
