import type { ReactNode } from "react";
import type { DemoRoute } from "@/router";
import { scenarios } from "@/scenarios";
import { TopBar } from "./TopBar";
import { SideNav } from "./SideNav";

type Props = {
  children: ReactNode;
  route: DemoRoute;
};

export function AppShell({ children, route }: Props) {
  const currentMode = route.name === "mode" ? route.mode : route.name === "demo" ? scenarios[route.scenarioId].mode : undefined;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <div className="flex min-h-screen">
        <SideNav currentMode={currentMode} />
        <div className="min-w-0 flex-1">
          <TopBar />
          <main className="px-5 pb-14 pt-6 xl:px-8 2xl:px-10">
            <div className="mx-auto max-w-[1760px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
