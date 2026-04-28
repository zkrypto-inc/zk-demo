import { useSyncExternalStore } from "react";
import { scenarioOrder } from "@/scenarios";
import type { ScenarioId, ScenarioMode } from "@/scenarios/types";

export type DemoRoute =
  | { name: "overview" }
  | { name: "mode"; mode: ScenarioMode }
  | { name: "demo"; scenarioId: ScenarioId; stepIndex: number };

const modes: ScenarioMode[] = ["platform", "custody", "issuer", "personal"];
const scenarioIds = new Set<ScenarioId>(scenarioOrder);
const modeIds = new Set<ScenarioMode>(modes);
const routeEvent = "zkdemo-route-change";

function cleanPath(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}

export function pathForRoute(route: DemoRoute) {
  if (route.name === "overview") return "/";
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

  if (modeIds.has(parts[0] as ScenarioMode)) {
    return { name: "mode", mode: parts[0] as ScenarioMode };
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
