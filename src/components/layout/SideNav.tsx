import { actorGroups, getGroupsByProduct, getScenarioDisplayId, scenarios } from "@/scenarios";
import { navigateToRoute } from "@/router";
import type { ActorGroupId, ProductId, ScenarioId } from "@/scenarios/types";
import { productLabels } from "@/scenarios/groups";
import { useDemoStore } from "@/store/demoStore";

type Props = {
  productId?: ProductId;
  currentActorId?: ActorGroupId;
  currentScenarioId?: ScenarioId;
};

export function SideNav({ productId, currentActorId, currentScenarioId }: Props) {
  const completedScenarios = useDemoStore((state) => state.completedScenarios);
  const stepMap = useDemoStore((state) => state.stepMap);

  const groups = productId ? getGroupsByProduct(productId) : actorGroups;

  return (
    <aside className="hidden w-[272px] shrink-0 border-r border-[var(--line)] bg-[var(--surface)] lg:block">
      <div className="sticky top-0 h-screen overflow-y-auto px-4 py-5">
        <button
          className="mb-6 w-full rounded-md px-2 py-2 text-left hover:bg-[var(--surface-2)]"
          onClick={() => navigateToRoute({ name: "landing" })}
          type="button"
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-2)]">zkrypto</div>
          <div className="mt-1 text-[20px] font-semibold leading-none text-[var(--ink)]">Demo</div>
        </button>

        {productId && (
          <button
            className="mb-4 flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left hover:bg-[var(--surface-2)]"
            onClick={() => navigateToRoute({ name: "product", productId })}
            type="button"
          >
            <span className="font-mono text-[11px] font-semibold text-[var(--accent)]">
              {productLabels[productId]}
            </span>
            <span className="text-[11px] text-[var(--muted)]">/ 시나리오 목록</span>
          </button>
        )}

        <div className="space-y-4">
          {groups.map((group) => {
            const expanded = group.id === currentActorId || group.scenarioIds.includes(currentScenarioId as ScenarioId);
            const uniqueScenarioIds = [...new Set(group.scenarioIds)];
            return (
              <div key={group.id}>
                <button
                  className={`w-full rounded-md px-3 py-2.5 text-left transition ${
                    group.id === currentActorId && !currentScenarioId
                      ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "text-[var(--ink-2)] hover:bg-[var(--surface-2)]"
                  }`}
                  onClick={() => navigateToRoute({ name: "actor", productId: group.productId, actorId: group.id })}
                  type="button"
                >
                  <div className="text-[13px] font-semibold">{group.label}</div>
                  <div className="mt-1 font-mono text-[10px] text-[var(--muted)]">{uniqueScenarioIds.length} scenarios</div>
                </button>

                {expanded && (
                  <div className="mt-1 space-y-1 border-l border-[var(--line)] pl-3">
                    {uniqueScenarioIds.map((scenarioId) => {
                      const scenario = scenarios[scenarioId];
                      const active = scenarioId === currentScenarioId;
                      const completed = completedScenarios.includes(scenarioId);
                      return (
                        <button
                          className={`flex w-full items-start gap-2 rounded-md px-2 py-2 text-left transition ${
                            active ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--ink-2)] hover:bg-[var(--surface-2)]"
                          }`}
                          key={scenarioId}
                          onClick={() =>
                            navigateToRoute({
                              name: "scenario",
                              productId: group.productId,
                              actorId: group.id,
                              scenarioId,
                              stepIndex: stepMap[scenarioId] ?? 0,
                            })
                          }
                          type="button"
                        >
                          <span className={`mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full ${completed ? "bg-[var(--ok)]" : active ? "bg-[var(--accent)]" : "bg-[var(--line)]"}`} />
                          <span className="min-w-0">
                            <span className="block truncate font-mono text-[10px]">{getScenarioDisplayId(scenario)}</span>
                            <span className="mt-0.5 block truncate text-[12px] font-semibold">{scenario.shortName}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
