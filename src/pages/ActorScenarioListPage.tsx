import { actorGroupById, getScenarioDisplayId, getScenarioSurface, scenarios } from "@/scenarios";
import { navigateToRoute } from "@/router";
import type { ActorGroupId, Scenario } from "@/scenarios/types";
import { useDemoStore } from "@/store/demoStore";

type Props = {
  actorId: ActorGroupId;
};

const surfaceLabels = {
  app: "모바일 앱",
  web: "웹 콘솔",
  mixed: "혼합 화면",
};

function ScenarioCard({ scenario, completed, currentStep }: { scenario: Scenario; completed: boolean; currentStep: number }) {
  const displayId = getScenarioDisplayId(scenario);
  const surface = getScenarioSurface(scenario);
  const status = completed ? "완료" : currentStep > 0 ? `진행 중 Step ${currentStep + 1}` : "시작 전";

  return (
    <button
      className="group grid w-full gap-4 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 text-left transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[0_12px_28px_rgba(15,23,42,0.07)] md:grid-cols-[minmax(0,1fr)_160px]"
      onClick={() => navigateToRoute({ name: "scenario", actorId: scenario.groupId ?? scenario.mode, scenarioId: scenario.id, stepIndex: currentStep })}
      type="button"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] font-semibold text-[var(--accent)]">{displayId}</span>
          <span className="inline-flex h-5 items-center rounded bg-[var(--surface-2)] px-2 text-[10px] font-semibold text-[var(--ink-2)]">
            {surfaceLabels[surface]}
          </span>
        </div>
        <div className="mt-2 text-[17px] font-semibold text-[var(--ink)]">{scenario.shortName}</div>
        <div className="mt-2 text-[13px] leading-[1.55] text-[var(--ink-2)]">{scenario.summary}</div>
      </div>
      <div className="flex flex-col items-start justify-between gap-3 md:items-end">
        <div className="inline-flex h-6 items-center rounded bg-[var(--surface-2)] px-2 font-mono text-[11px] text-[var(--muted)]">
          {scenario.steps.length} steps
        </div>
        <div className={`text-[12px] font-semibold ${completed ? "text-[var(--ok)]" : currentStep > 0 ? "text-[var(--accent)]" : "text-[var(--ink-2)]"}`}>
          {status}
        </div>
        <div className="text-[13px] font-semibold text-[var(--accent)] group-hover:underline">시나리오 열기</div>
      </div>
    </button>
  );
}

export function ActorScenarioListPage({ actorId }: Props) {
  const group = actorGroupById[actorId];
  const stepMap = useDemoStore((state) => state.stepMap);
  const completedScenarios = useDemoStore((state) => state.completedScenarios);

  if (!group) {
    return null;
  }

  const groupScenarios = group.scenarioIds.map((scenarioId) => scenarios[scenarioId]).filter(Boolean);
  const completedCount = groupScenarios.filter((scenario) => completedScenarios.includes(scenario.id)).length;

  return (
    <section>
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[var(--line)] pb-5 xl:flex-row xl:items-end">
        <div className="max-w-[760px]">
          <div className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--ink-2)]">Scenario Group</div>
          <h1 className="mt-2 text-[30px] font-semibold leading-tight text-[var(--ink)]">{group.label}</h1>
          <p className="mt-3 text-[14px] leading-[1.7] text-[var(--ink-2)]">{group.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.06em] text-[var(--muted)]">scenarios</div>
            <div className="mt-1 font-mono text-[14px] font-semibold">{groupScenarios.length}</div>
          </div>
          <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.06em] text-[var(--muted)]">completed</div>
            <div className="mt-1 font-mono text-[14px] font-semibold">{completedCount}</div>
          </div>
          <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.06em] text-[var(--muted)]">surface</div>
            <div className="mt-1 text-[13px] font-semibold">{surfaceLabels[group.surface]}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {groupScenarios.map((scenario) => (
          <ScenarioCard
            completed={completedScenarios.includes(scenario.id)}
            currentStep={stepMap[scenario.id] ?? 0}
            key={scenario.id}
            scenario={{ ...scenario, groupId: scenario.groupId ?? group.id }}
          />
        ))}
      </div>
    </section>
  );
}
