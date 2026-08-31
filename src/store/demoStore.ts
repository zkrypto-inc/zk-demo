import { useSyncExternalStore } from "react";
import type { ScenarioId } from "@/scenarios/types";

type ScreenFormValues = Record<string, Record<string, string>>;
type ScenarioFieldValues = Record<ScenarioId, Record<string, string>>;

export type AdapterRunStatus = "idle" | "loading" | "success" | "error";

export type AdapterRunMeta = {
  status: AdapterRunStatus;
  runId?: string;
  error?: string;
  updatedAt?: string;
};

export type DemoState = {
  stepMap: Partial<Record<ScenarioId, number>>;
  formValues: ScreenFormValues;
  scenarioValues: Partial<ScenarioFieldValues>;
  adapterRuns: Partial<Record<ScenarioId, AdapterRunMeta>>;
  completedScenarios: ScenarioId[];
};

const initialState: DemoState = {
  stepMap: {},
  formValues: {},
  scenarioValues: {},
  adapterRuns: {},
  completedScenarios: [],
};

let state = initialState;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function update(next: DemoState) {
  state = next;
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useDemoStore<T>(selector: (snapshot: DemoState) => T) {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(initialState),
  );
}

export const demoStore = {
  getState: () => state,

  setStep(scenarioId: ScenarioId, stepIndex: number) {
    if (state.stepMap[scenarioId] === stepIndex) return;
    update({
      ...state,
      stepMap: { ...state.stepMap, [scenarioId]: stepIndex },
    });
  },

  setFormValue(scenarioId: ScenarioId, screenId: string, label: string, value: string) {
    const screenValues = state.formValues[screenId] ?? {};
    const scenarioValues = state.scenarioValues[scenarioId] ?? {};

    update({
      ...state,
      formValues: {
        ...state.formValues,
        [screenId]: { ...screenValues, [label]: value },
      },
      scenarioValues: {
        ...state.scenarioValues,
        [scenarioId]: { ...scenarioValues, [label]: value },
      },
    });
  },

  setScenarioValues(scenarioId: ScenarioId, values: Record<string, string>) {
    const scenarioValues = state.scenarioValues[scenarioId] ?? {};

    update({
      ...state,
      scenarioValues: {
        ...state.scenarioValues,
        [scenarioId]: { ...scenarioValues, ...values },
      },
    });
  },

  setAdapterRun(scenarioId: ScenarioId, run: AdapterRunMeta) {
    update({
      ...state,
      adapterRuns: {
        ...state.adapterRuns,
        [scenarioId]: {
          ...state.adapterRuns[scenarioId],
          ...run,
          updatedAt: run.updatedAt ?? new Date().toISOString(),
        },
      },
    });
  },

  markCompleted(scenarioId: ScenarioId) {
    if (state.completedScenarios.includes(scenarioId)) return;
    update({
      ...state,
      completedScenarios: [...state.completedScenarios, scenarioId],
    });
  },

  resetScenario(scenarioId: ScenarioId) {
    const { [scenarioId]: _removedStep, ...stepMap } = state.stepMap;
    const { [scenarioId]: _removedValues, ...scenarioValues } = state.scenarioValues;
    const { [scenarioId]: _removedAdapterRun, ...adapterRuns } = state.adapterRuns;
    const formValues = Object.fromEntries(
      Object.entries(state.formValues).filter(([screenId]) => !screenId.startsWith(scenarioId.replace("-", ""))),
    ) as ScreenFormValues;

    update({
      ...state,
      stepMap,
      scenarioValues,
      adapterRuns,
      formValues,
      completedScenarios: state.completedScenarios.filter((id) => id !== scenarioId),
    });
  },
};
