import type { Scenario } from "@/scenarios/types";

// ZP-D — 상시 확인용 운영 대시보드 (시나리오 아님, 네이티브 대시보드 임베드).
// ZP-1/ZP-4 시나리오와 같은 세션을 공유하므로 두 시연의 결과가 여기서 그대로 보인다.
// ScenarioPage가 이 id를 감지해 스텝 UI 대신 ZkpolLiveDashboard(임베드)를 렌더한다.
export const scenarioZPD: Scenario = {
  id: "ZP-D",
  groupId: "risk",
  planningId: "ZP-D",
  displayId: "대시보드",
  name: "운영 대시보드",
  shortName: "운영 대시보드",
  actor: "리스크 운영자",
  actorType: "web",
  mode: "risk",
  summary:
    "거래소 지급의무 검증 파이프라인의 상시 운영 화면입니다. 상시 대사(ZP-1)·이상징후 차단(ZP-4) 시연의 결과가 같은 세션으로 반영되며, 여기서 직접 운영 시작·정지·이상 주입도 가능합니다.",
  screens: [{ id: "ZPD-1", layout: "dashboard", actor: "리스크 운영자", title: "운영 대시보드", sections: [] }],
  steps: [
    {
      id: "ZPD-step-1",
      kind: "result",
      label: "운영 대시보드",
      trigger: "user",
      screenId: "ZPD-1",
      description: "운영 대시보드",
      processView: { kind: "overview", description: "운영 대시보드" },
    },
  ],
};
