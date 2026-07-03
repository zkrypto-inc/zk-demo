import { useEffect, useMemo, useState } from "react";
import { PhoneContainer } from "@/components/phone/PhoneContainer";
import { WebScreen } from "@/components/web/WebScreen";
import { ProcessPanel } from "@/components/process/ProcessPanel";
import { StepTracker } from "@/components/process/StepTracker";
import { WebContainer } from "@/components/web/WebContainer";
import { useAdapterScenarioRun } from "@/hooks/useAdapterScenarioRun";
import { useScenarioPlayer } from "@/hooks/useScenarioPlayer";
import { navigateToRoute } from "@/router";
import {
  actorGroupById,
  getScenarioDisplayId,
  getScenarioGroup,
  scenarios,
  scenarioGroupLookup,
} from "@/scenarios";
import type { ActorGroupId, ProductId, ScenarioId } from "@/scenarios/types";
import { demoStore, useDemoStore } from "@/store/demoStore";
import { withLiveProcessView, withLiveScreenValues } from "@/utils/liveValues";
import { getFieldHint } from "@/utils/fieldGlossary";
import { ZkpolLiveDashboard, ZKPOL_LIVE_SCENARIOS } from "@/components/zkpol/ZkpolLiveDashboard";
import { ZkpolCompactConsole } from "@/components/zkpol/ZkpolCompactConsole";
import { injectAnomaly, startDemoPipeline } from "@/api/polControlClient";

type Props = {
  actorId?: ActorGroupId;
  productId?: ProductId;
  scenarioId: ScenarioId;
  stepIndex: number;
};

export function ScenarioPage({ actorId, productId, scenarioId, stepIndex }: Props) {
  const scenario = scenarios[scenarioId];
  const storeState = useDemoStore((state) => state);
  const resolvedActorId = actorId ?? scenarioGroupLookup[scenarioId] ?? scenario.mode;
  const group = actorGroupById[resolvedActorId] ?? getScenarioGroup(scenario);
  const resolvedProductId = productId ?? group?.productId ?? "zkwallet";
  const adapter = useAdapterScenarioRun(scenario);

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
          productId: resolvedProductId,
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
  const screenActor = screen.actor ?? scenario.actor;

  // 현재 화면에 노출되는 기술 값(Tx Hash·Raw Signature·Wallet ID 등)의 해설 —
  // "현재 단계" 카드에 붙여 파트너가 값의 의미를 화면에서 바로 읽게 한다.
  const screenFieldHints = useMemo(() => {
    const seen = new Set<string>();
    const hints: [string, string][] = [];
    for (const section of screen.sections ?? []) {
      for (const field of section.fields ?? []) {
        const hint = getFieldHint(field.label);
        if (hint && !seen.has(field.label)) {
          seen.add(field.label);
          hints.push([field.label, hint]);
        }
      }
    }
    return hints;
  }, [screen]);

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

  // zkPoL 트리거 스텝: 폰 제출이 실제 백엔드를 기동(ZP-1: 새 세션 파이프라인)하거나
  // 주입(ZP-4: 비정상 버스트)한 뒤 다음 스텝으로 넘어간다.
  const [zkpolTriggerBusy, setZkpolTriggerBusy] = useState(false);
  const [zkpolTriggerError, setZkpolTriggerError] = useState<string | null>(null);
  const zkpolTrigger =
    currentStep.id === "ZP1-step-1" ? startDemoPipeline :
    currentStep.id === "ZP4-step-1" ? () => injectAnomaly() :
    null;
  const runZkpolTriggerAndAdvance = async () => {
    if (!zkpolTrigger || zkpolTriggerBusy) return;
    setZkpolTriggerBusy(true);
    setZkpolTriggerError(null);
    try {
      await zkpolTrigger();
      player.advance();
    } catch (error) {
      setZkpolTriggerError(error instanceof Error ? error.message : String(error));
    } finally {
      setZkpolTriggerBusy(false);
    }
  };

  const recapAction = !player.hasNext && screen.actions?.find((a) => a.id === "recap");
  const advanceOrRecap = recapAction
    ? () =>
        navigateToRoute({
          name: "scenario",
          productId: "zkwallet",
          actorId: "personal",
          scenarioId: "FU-3",
          stepIndex: 0,
        })
    : zkpolTrigger
      ? runZkpolTriggerAndAdvance
      : player.advance;
  const canAdvanceWithRecap = Boolean(recapAction) || player.canAdvanceByUser;
  const activeActionLabel = recapAction ? recapAction.label : player.nextLabel;

  // zkPoL 라이브 시나리오(ZP-1/ZP-4)는 스크립트 화면 대신 실데이터 대시보드를 렌더한다.
  if (ZKPOL_LIVE_SCENARIOS.has(scenario.id)) {
    return (
      <section className="mx-auto max-w-[1100px] space-y-12 pt-2">
        <header>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
            <button className="hover:text-[var(--ink)]" onClick={() => navigateToRoute({ name: "landing" })} type="button">Demo</button>
            <span>/</span>
            <button className="hover:text-[var(--ink)]" onClick={() => navigateToRoute({ name: "product", productId: resolvedProductId })} type="button">{resolvedProductId}</button>
            <span>/</span>
            <span className="text-[var(--ink-2)]">{displayId}</span>
          </div>
          <h1 className="mt-2.5 text-[26px] font-semibold tracking-[-0.01em] text-[var(--ink)]">{scenario.name}</h1>
          <p className="mt-2.5 max-w-[600px] text-[13.5px] leading-[1.6] text-[var(--ink-2)]">{scenario.summary}</p>
        </header>
        <ZkpolLiveDashboard scenarioId={scenario.id} />
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-4 border-b border-[var(--ink)]/15 pb-5 xl:flex-row xl:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">
            <button className="hover:text-[var(--ink)]" onClick={() => navigateToRoute({ name: "landing" })} type="button">
              Demo
            </button>
            <span>/</span>
            <button className="hover:text-[var(--ink)]" onClick={() => navigateToRoute({ name: "product", productId: resolvedProductId })} type="button">
              {resolvedProductId}
            </button>
            <span>/</span>
            {group && (
              <button className="hover:text-[var(--ink)]" onClick={() => navigateToRoute({ name: "actor", productId: resolvedProductId, actorId: group.id })} type="button">
                {group.label}
              </button>
            )}
            <span>/</span>
            <span className="text-[var(--ink-2)]">{displayId}</span>
          </div>
          <h1 className="mt-2.5 text-[26px] font-semibold tracking-[-0.01em] text-[var(--ink)]">{scenario.name}</h1>
          <p className="mt-2.5 max-w-[640px] text-[13.5px] leading-[1.6] text-[var(--ink-2)]">{scenario.summary}</p>
        </div>
        <div className="flex items-center gap-2">
          {adapter.supported && (
            <button
              type="button"
              onClick={adapter.rerun}
              disabled={adapter.status === "loading"}
              title={adapter.error ?? adapter.runId ?? "Adapter"}
              className={`inline-flex h-7 max-w-[170px] items-center gap-2 rounded border px-3 text-[11px] font-medium transition ${adapterStatusClass(adapter.status)}`}
            >
              <span className="h-2 w-2 shrink-0 rounded-full bg-current" />
              <span className="truncate">{adapterStatusLabel(adapter.status)}</span>
            </button>
          )}
          {adapter.supported && (
            <button
              type="button"
              onClick={() => {
                player.restart();
                void adapter.reset();
              }}
              disabled={adapter.status === "loading"}
              title="이 시나리오의 실행 상태를 비우고 처음부터 (새 지갑·새 서명)"
              className="inline-flex h-7 items-center rounded border border-[var(--line)] bg-[var(--surface)] px-3 text-[11px] font-medium text-[var(--ink-2)] transition hover:border-[var(--ink-2)] hover:text-[var(--ink)] disabled:opacity-50"
            >
              리셋
            </button>
          )}
          <div className="inline-flex h-7 items-center rounded bg-[var(--surface-2)] px-3 font-mono text-[11px] text-[var(--ink-2)]">
            step {player.currentStepIndex + 1} / {scenario.steps.length}
          </div>
          <button
            type="button"
            onClick={player.toggleManualMode}
            className={`inline-flex h-7 items-center gap-1.5 rounded px-3 text-[11px] font-medium transition ${
              player.manualMode
                ? "bg-[var(--accent)] text-white"
                : "border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-[var(--ink)]"
            }`}
          >
            {player.manualMode ? (
              <>
                <span className="inline-block h-2 w-2 shrink-0 rounded-[2px] bg-current" />
                수동
              </>
            ) : (
              <>
                <svg width="8" height="9" viewBox="0 0 8 9" fill="currentColor"><polygon points="0,0 8,4.5 0,9" /></svg>
                자동
              </>
            )}
          </button>
        </div>
      </div>

      {screen.layout !== "recap" && (
      <div className="flex items-start justify-between gap-4 border-l-2 border-[var(--ink)] bg-[var(--surface-2)] px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">현재 단계</div>
          <div className="mt-2 text-[19px] font-semibold leading-[1.45] text-[var(--ink)]">{currentStep.description}</div>
          {zkpolTriggerBusy && <div className="mt-2 text-[12px] text-[var(--ink-2)]">백엔드 기동 중… (세션 준비에 수 초 걸립니다)</div>}
          {zkpolTriggerError && <div className="mt-2 text-[12px] text-[var(--bad)]">실행 실패: {zkpolTriggerError}</div>}
        </div>
        {player.canStopAuto && (
          <button
            aria-label="자동 진행 정지"
            className="mt-1 inline-flex shrink-0 items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2 text-[12px] font-medium text-[var(--ink-2)] transition hover:border-[var(--ink-2)] hover:text-[var(--ink)]"
            onClick={player.stopAuto}
            type="button"
          >
            <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-[2px] bg-current" />
            멈춤
          </button>
        )}
        {(player.manualMode || player.autoStopped) && player.hasNext && (
          <button
            aria-label="다음 단계로 진행"
            className="mt-1 inline-flex shrink-0 items-center gap-2 rounded-md bg-[var(--accent)] px-3 py-2 text-[12px] font-medium text-white transition hover:opacity-90"
            onClick={player.advanceManual}
            type="button"
          >
            다음 단계 →
          </button>
        )}
      </div>
      )}

      {screen.layout === "recap" ? (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)]">
          <WebScreen
            activeActionLabel={activeActionLabel}
            actor={screenActor}
            canAdvance={canAdvanceWithRecap}
            onAdvance={advanceOrRecap}
            onFieldChange={handleFieldChange}
            screen={screen}
          />
        </div>
      ) : (
      <div className="grid items-start gap-5 2xl:grid-cols-[minmax(330px,0.95fr)_minmax(520px,1.25fr)_300px]">
        <div className="min-w-0">
          {currentStep.liveView ? (
            <ZkpolCompactConsole
              focus={currentStep.liveView}
              onAdvance={player.hasNext ? player.advance : undefined}
              advanceLabel={player.hasNext ? "다음 단계 →" : undefined}
            />
          ) : (screen.actorType ?? scenario.actorType) === "mobile" ? (
            <PhoneContainer
              activeActionLabel={activeActionLabel}
              actor={screenActor}
              canAdvance={canAdvanceWithRecap && !zkpolTriggerBusy}
              onAdvance={advanceOrRecap}
              onFieldChange={handleFieldChange}
              scenarioId={scenario.id}
              screen={screen}
              stepIndicator={`step ${player.currentStepIndex + 1} / ${scenario.steps.length}`}
            />
          ) : (
            <WebContainer
              activeActionLabel={activeActionLabel}
              actor={screenActor}
              canAdvance={canAdvanceWithRecap}
              onAdvance={advanceOrRecap}
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
          screenFieldHints={screenFieldHints}
        />

        <aside className="space-y-4">
          <StepTracker currentStepIndex={player.currentStepIndex} onStepSelect={handleStepSelect} steps={scenario.steps} />
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
                      onClick={() => navigateToRoute({ name: "scenario", productId: resolvedProductId, actorId: group.id, scenarioId: peerId, stepIndex: storeState.stepMap[peerId] ?? 0 })}
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
      )}
    </section>
  );
}

function adapterStatusLabel(status: ReturnType<typeof useAdapterScenarioRun>["status"]) {
  switch (status) {
    case "loading":
      return "adapter 연결 중";
    case "success":
      return "adapter OK";
    case "error":
      return "adapter 오류";
    default:
      return "adapter 대기";
  }
}

function adapterStatusClass(status: ReturnType<typeof useAdapterScenarioRun>["status"]) {
  switch (status) {
    case "loading":
      return "border-[var(--warn-soft)] bg-[var(--warn-soft)] text-[var(--warn)]";
    case "success":
      return "border-[var(--ok-soft)] bg-[var(--ok-soft)] text-[var(--ok)]";
    case "error":
      return "border-[var(--bad-soft)] bg-[var(--bad-soft)] text-[var(--bad)] hover:opacity-80";
    default:
      return "border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-[var(--ink)]";
  }
}
