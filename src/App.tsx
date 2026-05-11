import { AppShell } from "@/components/layout/AppShell";
import { useDemoRoute } from "@/router";
import { ActorScenarioListPage } from "@/pages/ActorScenarioListPage";
import { ProductLandingPage } from "@/pages/ProductLandingPage";
import { ProductOverviewPage } from "@/pages/ProductOverviewPage";
import { ScenarioPage } from "@/pages/ScenarioPage";

function App() {
  const route = useDemoRoute();

  return (
    <AppShell route={route}>
      {route.name === "landing" && <ProductLandingPage />}
      {route.name === "product" && <ProductOverviewPage productId={route.productId} />}
      {route.name === "actor" && <ActorScenarioListPage actorId={route.actorId} productId={route.productId} />}
      {route.name === "scenario" && (
        <ScenarioPage actorId={route.actorId} productId={route.productId} scenarioId={route.scenarioId} stepIndex={route.stepIndex} />
      )}
      {route.name === "demo" && <ScenarioPage scenarioId={route.scenarioId} stepIndex={route.stepIndex} />}
    </AppShell>
  );
}

export default App;
