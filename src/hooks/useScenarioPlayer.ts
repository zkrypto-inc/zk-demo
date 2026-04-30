import { useEffect, useMemo, useRef, useState } from "react";
import type { ScenarioStep } from "@/scenarios/types";

type PlayerOptions = {
  steps: ScenarioStep[];
  scenarioKey: string;
  initialStepIndex?: number;
  onStepChange?: (stepIndex: number) => void;
};

const clampStep = (stepIndex: number, length: number) => Math.max(0, Math.min(stepIndex, Math.max(0, length - 1)));

export function useScenarioPlayer({ steps, scenarioKey, initialStepIndex = 0, onStepChange }: PlayerOptions) {
  const [currentStepIndex, setCurrentStepIndex] = useState(() => clampStep(initialStepIndex, steps.length));
  const [autoStopped, setAutoStopped] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setCurrentStepIndex(clampStep(initialStepIndex, steps.length));
    setAutoStopped(false);
  }, [initialStepIndex, scenarioKey, steps.length]);

  useEffect(() => {
    setManualMode(false);
  }, [scenarioKey]);

  const currentStep = useMemo(() => steps[currentStepIndex], [currentStepIndex, steps]);
  const hasNext = currentStepIndex < steps.length - 1;

  const moveTo = (stepIndex: number) => {
    const nextStepIndex = clampStep(stepIndex, steps.length);
    setAutoStopped(false);
    setCurrentStepIndex(nextStepIndex);
    onStepChange?.(nextStepIndex);
  };

  useEffect(() => {
    if (!currentStep || currentStep.trigger !== "auto" || !currentStep.duration || !hasNext || autoStopped || manualMode) {
      return undefined;
    }

    timeoutRef.current = window.setTimeout(() => {
      moveTo(currentStepIndex + 1);
    }, currentStep.duration);

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [autoStopped, manualMode, currentStep, currentStepIndex, hasNext, steps.length]);

  const canAdvanceByUser = Boolean(currentStep && currentStep.trigger === "user" && hasNext);
  const canStopAuto = !manualMode && Boolean(currentStep && currentStep.trigger === "auto" && currentStep.duration && hasNext && !autoStopped);
  const canAdvanceManual = hasNext;

  return {
    currentStep,
    currentStepIndex,
    hasNext,
    canAdvanceByUser,
    canStopAuto,
    autoStopped,
    manualMode,
    canAdvanceManual,
    nextLabel: currentStep?.ctaLabel,
    advance: () => {
      if (!canAdvanceByUser) return;
      moveTo(currentStepIndex + 1);
    },
    advanceManual: () => {
      if (!hasNext) return;
      moveTo(currentStepIndex + 1);
    },
    stopAuto: () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setAutoStopped(false);
      setManualMode(true);
    },
    toggleManualMode: () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setAutoStopped(false);
      setManualMode(m => !m);
    },
    goTo: moveTo,
    restart: () => moveTo(0),
  };
}
