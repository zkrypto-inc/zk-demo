import { useSyncExternalStore } from "react";
import { actorGroups, scenarioGroupLookup, scenarioOrder } from "@/scenarios";
import type { ActorGroupId, ScenarioId, ScenarioMode } from "@/scenarios/types";

export type DemoRoute =
  | { name: "overview" }
  | { name: "mode"; mode: ScenarioMode }
  | { name: "actor"; actorId: ActorGroupId }
  | { name: "scenario"; actorId: ActorGroupId; scenarioId: ScenarioId; stepIndex: number }
  | { name: "demo"; scenarioId: ScenarioId; stepIndex: number };

const modes: ScenarioMode[] = ["platform", "custody", "issuer", "personal"];
const scenarioIds = new Set<ScenarioId>(scenarioOrder);
const modeIds = new Set<ScenarioMode>(modes);
const actorIds = new Set<ActorGroupId>(actorGroups.map((group) => group.id));
const routeEvent = "zkdemo-route-change";

function cleanPath(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}

export function pathForRoute(route: DemoRoute) {
  if (route.name === "overview") return "/";
  if (route.name === "actor") return `/${route.actorId}`;
  if (route.name === "scenario") return `/${route.actorId}/${route.scenarioId}/${route.stepIndex}`;
  if (route.name === "mode") return `/${route.mode}`;
  return `/demo/${route.scenarioId}/${route.stepIndex}`;
}

export function parseRoute(pathname: string): DemoRoute {
  const parts = cleanPath(pathname).split("/").filter(Boolean);

  if (parts.length === 0) {
    return { name: "overview" };
  }

  if (parts[0] === "demo" && scenarioIds.has(parts[1] as ScenarioId)) {
    const rawStep = Number.parseInt(parts[2] ?? "0", 10);
    return {
      name: "demo",
      scenarioId: parts[1] as ScenarioId,
      stepIndex: Number.isFinite(rawStep) && rawStep >= 0 ? rawStep : 0,
    };
  }

  if (actorIds.has(parts[0] as ActorGroupId)) {
    const actorId = parts[0] as ActorGroupId;
    const maybeScenarioId = parts[1] as ScenarioId | undefined;

    if (maybeScenarioId && scenarioIds.has(maybeScenarioId)) {
      const rawStep = Number.parseInt(parts[2] ?? "0", 10);
      return {
        name: "scenario",
        actorId,
        scenarioId: maybeScenarioId,
        stepIndex: Number.isFinite(rawStep) && rawStep >= 0 ? rawStep : 0,
      };
    }

    return { name: "actor", actorId };
  }

  if (modeIds.has(parts[0] as ScenarioMode)) {
    return { name: "actor", actorId: parts[0] as ActorGroupId };
  }

  return { name: "overview" };
}

function getSnapshot() {
  return cleanPath(window.location.pathname);
}

function subscribe(listener: () => void) {
  window.addEventListener("popstate", listener);
  window.addEventListener(routeEvent, listener);
  return () => {
    window.removeEventListener("popstate", listener);
    window.removeEventListener(routeEvent, listener);
  };
}

export function useDemoRoute() {
  const pathname = useSyncExternalStore(subscribe, getSnapshot, () => "/");
  return parseRoute(pathname);
}

export function navigateToRoute(route: DemoRoute, replace = false) {
  const nextPath = pathForRoute(route);
  if (cleanPath(window.location.pathname) === nextPath) return;

  const method = replace ? "replaceState" : "pushState";
  window.history[method]({}, "", nextPath);
  window.dispatchEvent(new Event(routeEvent));
}

export function routeForScenario(scenarioId: ScenarioId, stepIndex = 0): DemoRoute {
  return {
    name: "scenario",
    actorId: scenarioGroupLookup[scenarioId],
    scenarioId,
    stepIndex,
  };
}
