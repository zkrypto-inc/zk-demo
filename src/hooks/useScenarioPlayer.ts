import { useEffect, useMemo, useRef, useState } from "react";
import type { ScenarioStep } from "@/scenarios/types";

type PlayerOptions = {
  steps: ScenarioStep[];
  scenarioKey: string;
};

const jitter = (base: number) => base + Math.floor(Math.random() * 280) - 100;

export function useScenarioPlayer({ steps, scenarioKey }: PlayerOptions) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setCurrentStepIndex(0);
  }, [scenarioKey]);

  const currentStep = useMemo(() => steps[currentStepIndex], [currentStepIndex, steps]);
  const hasNext = currentStepIndex < steps.length - 1;

  useEffect(() => {
    if (!currentStep || currentStep.trigger !== "auto" || !currentStep.duration || !hasNext) {
      return undefined;
    }

    timeoutRef.current = window.setTimeout(() => {
      setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    }, jitter(currentStep.duration));

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [currentStep, hasNext, steps.length]);

  const canAdvanceByUser = Boolean(currentStep && currentStep.trigger === "user" && hasNext);

  return {
    currentStep,
    currentStepIndex,
    canAdvanceByUser,
    nextLabel: currentStep?.ctaLabel,
    advance: () => {
      if (!canAdvanceByUser) return;
      setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    },
    restart: () => setCurrentStepIndex(0),
  };
}
