import { useCallback, useEffect } from "react";
import { AdapterClientError, isAdapterCase, runAdapterCase } from "@/api/adapterClient";
import type { Scenario } from "@/scenarios/types";
import { demoStore, useDemoStore } from "@/store/demoStore";
import {
  buildAdapterCaseInputs,
  collectScenarioDefaults,
  mapAdapterStateToScenarioValues,
} from "@/utils/adapterScenarioValues";

const adapterAutorun = import.meta.env.VITE_ZKWALLET_ADAPTER_AUTORUN !== "false";

export function useAdapterScenarioRun(scenario: Scenario) {
  const adapterRun = useDemoStore((state) => state.adapterRuns[scenario.id]);
  const supported = isAdapterCase(scenario.id);

  const run = useCallback(async () => {
    if (!isAdapterCase(scenario.id)) return;

    const snapshot = demoStore.getState();
    if (snapshot.adapterRuns[scenario.id]?.status === "loading") return;

    const defaultValues = collectScenarioDefaults(scenario);
    const scenarioValues = snapshot.scenarioValues[scenario.id] ?? {};
    const inputs = buildAdapterCaseInputs(scenario.id, { ...defaultValues, ...scenarioValues });

    demoStore.setAdapterRun(scenario.id, { status: "loading", error: undefined });

    try {
      const response = await runAdapterCase(scenario.id, inputs);
      demoStore.setScenarioValues(scenario.id, mapAdapterStateToScenarioValues(response.state));
      demoStore.setAdapterRun(scenario.id, {
        status: "success",
        runId: response.state.runId,
        error: undefined,
      });
    } catch (error) {
      demoStore.setAdapterRun(scenario.id, {
        status: "error",
        error: getErrorMessage(error),
      });
    }
  }, [scenario]);

  useEffect(() => {
    if (!supported || !adapterAutorun) return;
    if (adapterRun?.status === "loading" || adapterRun?.status === "success" || adapterRun?.status === "error") return;
    void run();
  }, [adapterRun?.status, run, supported]);

  return {
    supported,
    status: adapterRun?.status ?? "idle",
    runId: adapterRun?.runId,
    error: adapterRun?.error,
    rerun: run,
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof AdapterClientError) {
    return error.errorCode ? `${error.errorCode}: ${error.message}` : error.message;
  }
  if (error instanceof Error) return error.message;
  return "Adapter request failed.";
}
