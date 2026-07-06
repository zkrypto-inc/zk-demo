import { useEffect, useSyncExternalStore } from "react";
import { actorGroups, scenarioGroupLookup, scenarioOrder } from "@/scenarios";
import type { ActorGroupId, ProductId, ScenarioId, ScenarioMode } from "@/scenarios/types";

export type DemoRoute =
  | { name: "landing" }
  | { name: "product"; productId: ProductId }
  | { name: "actor"; productId: ProductId; actorId: ActorGroupId }
  | { name: "scenario"; productId: ProductId; actorId: ActorGroupId; scenarioId: ScenarioId; stepIndex: number }
  | { name: "demo"; scenarioId: ScenarioId; stepIndex: number };

const products: ProductId[] = ["zkwallet", "zktransfer", "zkpasskey", "zkpol", "zkvoting"];
const modes: ScenarioMode[] = ["custody", "issuer", "personal"];
const scenarioIds = new Set<ScenarioId>(scenarioOrder);
const modeIds = new Set<ScenarioMode>(modes);
const productIds = new Set<ProductId>(products);
const actorIds = new Set<ActorGroupId>(actorGroups.map((group) => group.id));
const routeEvent = "zkdemo-route-change";
const productAliases: Record<string, ProductId> = {
  zkporl: "zkpol",
};
const appBase = cleanPath(import.meta.env.BASE_URL ?? "/");

const modeToProduct: Record<string, ProductId> = {
  custody: "zkwallet",
  issuer: "zkwallet",
  personal: "zkwallet",
  platform: "zkwallet",
};

function cleanPath(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}

function stripBase(pathname: string) {
  const cleaned = cleanPath(pathname);
  if (appBase === "/") return cleaned;
  if (cleaned === appBase) return "/";
  if (cleaned.startsWith(`${appBase}/`)) {
    return cleanPath(cleaned.slice(appBase.length));
  }
  return cleaned;
}

function withBase(pathname: string) {
  const cleaned = cleanPath(pathname);
  if (appBase === "/") return cleaned;
  return cleaned === "/" ? `${appBase}/` : `${appBase}${cleaned}`;
}

function normalizeProductAliasPath(pathname: string) {
  const parts = cleanPath(pathname).split("/").filter(Boolean);
  if (parts.length === 0) return "/";

  const canonicalProductId = productAliases[parts[0]];
  if (!canonicalProductId) return cleanPath(pathname);

  return `/${[canonicalProductId, ...parts.slice(1)].join("/")}`;
}

export function pathForRoute(route: DemoRoute) {
  if (route.name === "landing") return "/";
  if (route.name === "product") return `/${route.productId}`;
  if (route.name === "actor") return `/${route.productId}/${route.actorId}`;
  if (route.name === "scenario") return `/${route.productId}/${route.actorId}/${route.scenarioId}/${route.stepIndex}`;
  return `/demo/${route.scenarioId}/${route.stepIndex}`;
}

export function parseRoute(pathname: string): DemoRoute {
  const parts = cleanPath(pathname).split("/").filter(Boolean);

  if (parts.length === 0) {
    return { name: "landing" };
  }

  // /demo/:scenarioId/:step (legacy direct-link)
  if (parts[0] === "demo" && scenarioIds.has(parts[1] as ScenarioId)) {
    const rawStep = Number.parseInt(parts[2] ?? "0", 10);
    return {
      name: "demo",
      scenarioId: parts[1] as ScenarioId,
      stepIndex: Number.isFinite(rawStep) && rawStep >= 0 ? rawStep : 0,
    };
  }

  // /:productId/... (legacy /zkporl/... is accepted as /zkpol/...)
  const productId = productAliases[parts[0]] ?? (productIds.has(parts[0] as ProductId) ? parts[0] as ProductId : undefined);
  if (productId) {
    const maybeActorId = parts[1] as ActorGroupId | undefined;

    if (maybeActorId && actorIds.has(maybeActorId)) {
      const actorId = maybeActorId;
      const maybeScenarioId = parts[2] as ScenarioId | undefined;
      if (maybeScenarioId && scenarioIds.has(maybeScenarioId)) {
        const rawStep = Number.parseInt(parts[3] ?? "0", 10);
        return {
          name: "scenario",
          productId,
          actorId,
          scenarioId: maybeScenarioId,
          stepIndex: Number.isFinite(rawStep) && rawStep >= 0 ? rawStep : 0,
        };
      }

      return { name: "actor", productId, actorId };
    }

    return { name: "product", productId };
  }

  // legacy mode shortcuts (/custody, /personal) → /zkwallet/:actorId
  if (modeIds.has(parts[0] as ScenarioMode)) {
    const actorId = parts[0] as ActorGroupId;
    return { name: "actor", productId: modeToProduct[parts[0]] ?? "zkwallet", actorId };
  }

  // legacy /:actorId/:scenarioId/:step without product prefix
  if (actorIds.has(parts[0] as ActorGroupId)) {
    const actorId = parts[0] as ActorGroupId;
    const productId: ProductId = actorGroups.find((g) => g.id === actorId)?.productId ?? "zkwallet";
    const maybeScenarioId = parts[1] as ScenarioId | undefined;

    if (maybeScenarioId && scenarioIds.has(maybeScenarioId)) {
      const rawStep = Number.parseInt(parts[2] ?? "0", 10);
      return {
        name: "scenario",
        productId,
        actorId,
        scenarioId: maybeScenarioId,
        stepIndex: Number.isFinite(rawStep) && rawStep >= 0 ? rawStep : 0,
      };
    }

    return { name: "actor", productId, actorId };
  }

  return { name: "landing" };
}

function getSnapshot() {
  return stripBase(window.location.pathname);
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

  useEffect(() => {
    const canonicalPath = normalizeProductAliasPath(pathname);
    if (canonicalPath === pathname) return;

    window.history.replaceState({}, "", withBase(canonicalPath));
    window.dispatchEvent(new Event(routeEvent));
  }, [pathname]);

  return parseRoute(pathname);
}

export function navigateToRoute(route: DemoRoute, replace = false) {
  const nextPath = pathForRoute(route);
  if (stripBase(window.location.pathname) === nextPath) return;

  const method = replace ? "replaceState" : "pushState";
  window.history[method]({}, "", withBase(nextPath));
  window.dispatchEvent(new Event(routeEvent));
}

export function routeForScenario(scenarioId: ScenarioId, stepIndex = 0): DemoRoute {
  const actorId = scenarioGroupLookup[scenarioId];
  const productId: ProductId = actorGroups.find((g) => g.id === actorId)?.productId ?? "zkwallet";
  return {
    name: "scenario",
    productId,
    actorId,
    scenarioId,
    stepIndex,
  };
}
