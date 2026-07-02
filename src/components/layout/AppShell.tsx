import type { ReactNode } from "react";
import type { DemoRoute } from "@/router";
import { actorGroups, scenarioGroupLookup } from "@/scenarios";
import type { ProductId } from "@/scenarios/types";
import { SideNav } from "./SideNav";

type Props = {
  children: ReactNode;
  route: DemoRoute;
};

export function AppShell({ children, route }: Props) {
  let productId: ProductId | undefined;
  let currentActorId: string | undefined;
  let currentScenarioId: string | undefined;

  if (route.name === "product") {
    productId = route.productId;
  } else if (route.name === "actor") {
    productId = route.productId;
    currentActorId = route.actorId;
  } else if (route.name === "scenario") {
    productId = route.productId;
    currentActorId = route.actorId;
    currentScenarioId = route.scenarioId;
  } else if (route.name === "demo") {
    const actorId = scenarioGroupLookup[route.scenarioId];
    productId = actorGroups.find((g) => g.id === actorId)?.productId;
    currentActorId = actorId;
    currentScenarioId = route.scenarioId;
  }

  // 랜딩은 사이드바 없는 풀 에디토리얼 페이지로.
  if (route.name === "landing") {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
        <main className="px-6 md:px-10">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <div className="flex min-h-screen">
        <SideNav
          currentActorId={currentActorId as Parameters<typeof SideNav>[0]["currentActorId"]}
          currentScenarioId={currentScenarioId as Parameters<typeof SideNav>[0]["currentScenarioId"]}
          productId={productId}
        />
        <div className="min-w-0 flex-1">
          <main className="px-5 pb-14 pt-6 xl:px-8 2xl:px-10">
            <div className="mx-auto max-w-[1760px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
