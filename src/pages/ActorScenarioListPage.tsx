import { actorGroupById, getScenarioDisplayId, scenarios } from "@/scenarios";
import { navigateToRoute } from "@/router";
import type { ActorGroupId, ProductId } from "@/scenarios/types";
import { productLabels } from "@/scenarios/groups";
import { useDemoStore } from "@/store/demoStore";

type Props = {
  actorId: ActorGroupId;
  productId?: ProductId;
};

const cardClass =
  "group flex min-h-[152px] flex-col justify-between rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6 text-left transition-colors hover:border-[var(--ink)]";

export function ActorScenarioListPage({ actorId, productId }: Props) {
  const group = actorGroupById[actorId];
  const resolvedProductId = productId ?? group?.productId ?? "zkwallet";
  const stepMap = useDemoStore((state) => state.stepMap);
  const completedScenarios = useDemoStore((state) => state.completedScenarios);

  if (!group) return null;

  const groupScenarios = [...new Set(group.scenarioIds)].map((id) => scenarios[id]).filter(Boolean);
  const completedCount = groupScenarios.filter((s) => completedScenarios.includes(s.id)).length;

  return (
    <section className="mx-auto max-w-[1100px] pt-2 pb-20">
      <header className="mb-8 border-b border-[var(--ink)]/15 pb-8">
        <div className="font-mono text-[11px] tracking-[0.18em] text-[var(--muted)]">{productLabels[resolvedProductId]}</div>
        <h1 className="mt-2.5 text-[26px] font-semibold tracking-[-0.01em] text-[var(--ink)]">{group.label}</h1>
        <p className="mt-2.5 font-mono text-[12px] text-[var(--ink-2)]">
          시나리오 {groupScenarios.length} · 완료 {completedCount}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {groupScenarios.map((scenario) => {
          const completed = completedScenarios.includes(scenario.id);
          const step = stepMap[scenario.id] ?? 0;
          const status = completed ? "완료" : step > 0 ? `Step ${step + 1}` : "";
          return (
            <button
              key={scenario.id}
              type="button"
              className={cardClass}
              onClick={() =>
                navigateToRoute({ name: "scenario", productId: resolvedProductId, actorId: group.id, scenarioId: scenario.id, stepIndex: step })
              }
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[11px] text-[var(--muted)]">{getScenarioDisplayId(scenario)}</span>
                  <span className="font-mono text-[11px] text-[var(--muted)]">{scenario.steps.length} steps</span>
                </div>
                <div className="mt-3 text-[20px] font-semibold text-[var(--ink)]">{scenario.shortName}</div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--ink)]">
                  시나리오 열기
                  <span className="text-[var(--muted)] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[var(--accent)]" aria-hidden>→</span>
                </span>
                {status && <span className="font-mono text-[11px] text-[var(--ink-2)]">{status}</span>}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
