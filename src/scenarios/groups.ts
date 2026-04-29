import type { ActorGroupId, Scenario, ScenarioId, Surface } from "./types";

export type ActorGroup = {
  id: ActorGroupId;
  label: string;
  shortLabel: string;
  description: string;
  surface: Surface;
  scenarioIds: ScenarioId[];
};

export const actorGroups: ActorGroup[] = [
  {
    id: "personal",
    label: "개인 사용자 거래",
    shortLabel: "개인",
    description: "개인 사용자가 지갑을 만들고 거래 요청과 서명 상태를 확인하는 앱 중심 흐름입니다.",
    surface: "app",
    scenarioIds: ["FU-1", "FU-2"],
  },
  {
    id: "custody",
    label: "수탁 운영",
    shortLabel: "수탁",
    description: "수탁 등록, 입금, 출금 요청을 웹 콘솔에서 처리하는 운영자 흐름입니다.",
    surface: "web",
    scenarioIds: ["CU-1", "CU-2", "CU-3"],
  },
  {
    id: "issuer",
    label: "발행사 운영",
    shortLabel: "발행사",
    description: "발행사 등록, 발행, 소각, 준비금 요청을 생성하고 승인 상태를 확인합니다.",
    surface: "web",
    scenarioIds: ["IS-1", "FS-2", "FS-3"],
  },
];

export const actorGroupById = Object.fromEntries(
  actorGroups.map((group) => [group.id, group]),
) as Record<ActorGroupId, ActorGroup | undefined>;

export const scenarioGroupLookup = actorGroups.reduce((lookup, group) => {
  for (const scenarioId of group.scenarioIds) {
    lookup[scenarioId] = group.id;
  }
  return lookup;
}, {} as Record<ScenarioId, ActorGroupId>);

export function getScenarioGroup(scenario: Scenario) {
  return actorGroupById[scenario.groupId ?? scenarioGroupLookup[scenario.id] ?? scenario.mode];
}

export function getScenarioDisplayId(scenario: Scenario) {
  return scenario.displayId ?? scenario.planningId ?? scenario.id;
}

export function getScenarioSurface(scenario: Scenario): Surface {
  if (scenario.surface) return scenario.surface;
  return scenario.actorType === "mobile" ? "app" : "web";
}
