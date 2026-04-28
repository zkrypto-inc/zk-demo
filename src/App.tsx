import { AppShell } from "@/components/layout/AppShell";
import { useDemoRoute } from "@/router";
import { ActorScenarioListPage } from "@/pages/ActorScenarioListPage";
import { OverviewPage } from "@/pages/OverviewPage";
import { ScenarioPage } from "@/pages/ScenarioPage";

function App() {
  const route = useDemoRoute();

  return (
    <AppShell route={route}>
      {route.name === "overview" && <OverviewPage />}
      {route.name === "actor" && <ActorScenarioListPage actorId={route.actorId} />}
      {route.name === "mode" && <ActorScenarioListPage actorId={route.mode} />}
      {route.name === "scenario" && (
        <ScenarioPage actorId={route.actorId} scenarioId={route.scenarioId} stepIndex={route.stepIndex} />
      )}
      {route.name === "demo" && <ScenarioPage scenarioId={route.scenarioId} stepIndex={route.stepIndex} />}
    </AppShell>
  );
}

export default App;
