import { useSyncExternalStore } from "react";
import type { ScenarioId } from "@/scenarios/types";

type ScreenFormValues = Record<string, Record<string, string>>;
type ScenarioFieldValues = Record<ScenarioId, Record<string, string>>;

export type DemoState = {
  stepMap: Partial<Record<ScenarioId, number>>;
  formValues: ScreenFormValues;
  scenarioValues: Partial<ScenarioFieldValues>;
  completedScenarios: ScenarioId[];
};

const initialState: DemoState = {
  stepMap: {},
  formValues: {},
  scenarioValues: {},
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
    const formValues = Object.fromEntries(
      Object.entries(state.formValues).filter(([screenId]) => !screenId.startsWith(scenarioId.replace("-", ""))),
    ) as ScreenFormValues;

    update({
      ...state,
      stepMap,
      scenarioValues,
      formValues,
      completedScenarios: state.completedScenarios.filter((id) => id !== scenarioId),
    });
  },
};
