import { AppShell } from "@/components/layout/AppShell";
import { useDemoRoute } from "@/router";
import { ModePage } from "@/pages/ModePage";
import { OverviewPage } from "@/pages/OverviewPage";
import { scenarios } from "@/scenarios";

function App() {
  const route = useDemoRoute();

  return (
    <AppShell route={route}>
      {route.name === "overview" && <OverviewPage />}
      {route.name === "mode" && <ModePage mode={route.mode} />}
      {route.name === "demo" && <ModePage mode={scenarios[route.scenarioId].mode} />}
    </AppShell>
  );
}

export default App;
