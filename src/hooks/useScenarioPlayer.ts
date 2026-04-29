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
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setCurrentStepIndex(clampStep(initialStepIndex, steps.length));
    setAutoStopped(false);
  }, [initialStepIndex, scenarioKey, steps.length]);

  const currentStep = useMemo(() => steps[currentStepIndex], [currentStepIndex, steps]);
  const hasNext = currentStepIndex < steps.length - 1;

  const moveTo = (stepIndex: number) => {
    const nextStepIndex = clampStep(stepIndex, steps.length);
    setAutoStopped(false);
    setCurrentStepIndex(nextStepIndex);
    onStepChange?.(nextStepIndex);
  };

  useEffect(() => {
    if (!currentStep || currentStep.trigger !== "auto" || !currentStep.duration || !hasNext || autoStopped) {
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
  }, [autoStopped, currentStep, currentStepIndex, hasNext, steps.length]);

  const canAdvanceByUser = Boolean(currentStep && currentStep.trigger === "user" && hasNext);
  const canStopAuto = Boolean(currentStep && currentStep.trigger === "auto" && currentStep.duration && hasNext && !autoStopped);

  return {
    currentStep,
    currentStepIndex,
    canAdvanceByUser,
    canStopAuto,
    autoStopped,
    nextLabel: currentStep?.ctaLabel,
    advance: () => {
      if (!canAdvanceByUser) return;
      moveTo(currentStepIndex + 1);
    },
    stopAuto: () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setAutoStopped(true);
    },
    goTo: moveTo,
    restart: () => moveTo(0),
  };
}
