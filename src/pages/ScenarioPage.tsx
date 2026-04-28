import { useEffect, useMemo } from "react";
import { PhoneContainer } from "@/components/phone/PhoneContainer";
import { ProcessPanel } from "@/components/process/ProcessPanel";
import { StepTracker } from "@/components/process/StepTracker";
import { WebContainer } from "@/components/web/WebContainer";
import { useScenarioPlayer } from "@/hooks/useScenarioPlayer";
import { navigateToRoute } from "@/router";
import {
  actorGroupById,
  getScenarioDisplayId,
  getScenarioGroup,
  scenarios,
  scenarioGroupLookup,
} from "@/scenarios";
import type { ActorGroupId, ScenarioId } from "@/scenarios/types";
import { demoStore, useDemoStore } from "@/store/demoStore";
import { withLiveProcessView, withLiveScreenValues } from "@/utils/liveValues";

type Props = {
  actorId?: ActorGroupId;
  scenarioId: ScenarioId;
  stepIndex: number;
};

export function ScenarioPage({ actorId, scenarioId, stepIndex }: Props) {
  const scenario = scenarios[scenarioId];
  const storeState = useDemoStore((state) => state);
  const resolvedActorId = actorId ?? scenarioGroupLookup[scenarioId] ?? scenario.mode;
  const group = actorGroupById[resolvedActorId] ?? getScenarioGroup(scenario);

  const player = useScenarioPlayer({
    steps: scenario.steps,
    scenarioKey: scenario.id,
    initialStepIndex: stepIndex,
    onStepChange: (nextStepIndex) => {
      demoStore.setStep(scenario.id, nextStepIndex);
      if (nextStepIndex === scenario.steps.length - 1) {
        demoStore.markCompleted(scenario.id);
      }
      navigateToRoute(
        {
          name: "scenario",
          actorId: resolvedActorId,
          scenarioId: scenario.id,
          stepIndex: nextStepIndex,
        },
        true,
      );
    },
  });

  const currentStep = player.currentStep ?? scenario.steps[0];
  const baseScreen = useMemo(
    () => scenario.screens.find((screen) => screen.id === currentStep.screenId) ?? scenario.screens[0],
    [currentStep.screenId, scenario.screens],
  );
  const screen = withLiveScreenValues(baseScreen, storeState, scenario.id);
  const processView = withLiveProcessView(currentStep.processView, storeState, scenario.id);
  const displayId = getScenarioDisplayId(scenario);

  useEffect(() => {
    demoStore.setStep(scenario.id, player.currentStepIndex);
    if (player.currentStepIndex === scenario.steps.length - 1) {
      demoStore.markCompleted(scenario.id);
    }
  }, [player.currentStepIndex, scenario.id, scenario.steps.length]);

  const handleStepSelect = (nextStepIndex: number) => {
    player.goTo(nextStepIndex);
  };

  const handleFieldChange = (screenId: string, label: string, value: string) => {
    demoStore.setFormValue(scenario.id, screenId, label, value);
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-4 border-b border-[var(--line)] pb-4 xl:flex-row xl:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-[12px] text-[var(--ink-2)]">
            <button className="hover:text-[var(--accent)]" onClick={() => navigateToRoute({ name: "overview" })} type="button">
              Demo Home
            </button>
            <span>/</span>
            {group && (
              <button className="hover:text-[var(--accent)]" onClick={() => navigateToRoute({ name: "actor", actorId: group.id })} type="button">
                {group.label}
              </button>
            )}
            <span>/</span>
            <span className="font-semibold text-[var(--ink)]">{displayId} · {scenario.shortName}</span>
          </div>
          <h1 className="mt-2 text-[26px] font-semibold leading-tight text-[var(--ink)]">{scenario.name}</h1>
          <p className="mt-2 max-w-[820px] text-[14px] leading-[1.65] text-[var(--ink-2)]">{scenario.summary}</p>
        </div>
        <div className="inline-flex h-7 items-center rounded bg-[var(--surface-2)] px-3 font-mono text-[11px] text-[var(--ink-2)]">
          step {player.currentStepIndex + 1} / {scenario.steps.length}
        </div>
      </div>

      <div className="grid items-start gap-5 2xl:grid-cols-[minmax(330px,0.95fr)_minmax(520px,1.25fr)_300px]">
        <div className="min-w-0">
          {scenario.actorType === "mobile" ? (
            <PhoneContainer
              activeActionLabel={player.nextLabel}
              actor={scenario.actor}
              canAdvance={player.canAdvanceByUser}
              onAdvance={player.advance}
              onFieldChange={handleFieldChange}
              screen={screen}
              stepIndicator={`step ${player.currentStepIndex + 1} / ${scenario.steps.length}`}
            />
          ) : (
            <WebContainer
              activeActionLabel={player.nextLabel}
              actor={scenario.actor}
              canAdvance={player.canAdvanceByUser}
              onAdvance={player.advance}
              onFieldChange={handleFieldChange}
              scenarioId={scenario.id}
              screen={screen}
              stepIndicator={`step ${player.currentStepIndex + 1} / ${scenario.steps.length}`}
            />
          )}
        </div>

        <ProcessPanel
          currentStep={currentStep}
          currentStepIndex={player.currentStepIndex}
          processView={processView}
          steps={scenario.steps}
        />

        <aside className="space-y-4">
          <StepTracker currentStepIndex={player.currentStepIndex} onStepSelect={handleStepSelect} steps={scenario.steps} />
          <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--ink-2)]">설명</div>
            <div className="mt-3 text-[13px] leading-[1.65] text-[var(--ink)]">{currentStep.description}</div>
          </div>
          {group && group.scenarioIds.length > 1 && (
            <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
              <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--ink-2)]">같은 사용자 유형</div>
              <div className="space-y-1">
                {group.scenarioIds.map((peerId) => {
                  const peer = scenarios[peerId];
                  const active = peerId === scenario.id;
                  return (
                    <button
                      className={`block w-full rounded-md px-2 py-2 text-left text-[12px] transition ${
                        active ? "bg-[var(--accent-soft)] font-semibold text-[var(--accent)]" : "text-[var(--ink-2)] hover:bg-[var(--surface-2)]"
                      }`}
                      disabled={active}
                      key={peerId}
                      onClick={() => navigateToRoute({ name: "scenario", actorId: group.id, scenarioId: peerId, stepIndex: storeState.stepMap[peerId] ?? 0 })}
                      type="button"
                    >
                      <span className="font-mono">{getScenarioDisplayId(peer)}</span> · {peer.shortName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
