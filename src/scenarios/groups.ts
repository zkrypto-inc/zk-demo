import type { ActorGroupId, ProductId, Scenario, ScenarioId, Surface } from "./types";

export type ActorGroup = {
  id: ActorGroupId;
  productId: ProductId;
  label: string;
  shortLabel: string;
  description: string;
  surface: Surface;
  scenarioIds: ScenarioId[];
};

export const actorGroups: ActorGroup[] = [
  // zkwallet
  {
    id: "personal",
    productId: "zkwallet",
    label: "개인 사용자 거래",
    shortLabel: "개인",
    description: "개인 사용자가 지갑을 만들고 거래 요청과 서명 상태를 확인하는 앱 중심 흐름입니다.",
    surface: "app",
    scenarioIds: ["FU-1", "FU-2"],
  },
  {
    id: "custody",
    productId: "zkwallet",
    label: "수탁 운영",
    shortLabel: "수탁",
    description: "수탁 등록, 입금, 출금 요청을 웹 콘솔에서 처리하는 운영자 흐름입니다.",
    surface: "web",
    scenarioIds: ["CU-1", "CU-2", "CU-3"],
  },
  {
    id: "issuer",
    productId: "zkwallet",
    label: "발행사 운영",
    shortLabel: "발행사",
    description: "발행사 등록, 발행, 소각, 준비금 요청을 생성하고 승인 상태를 확인합니다.",
    surface: "web",
    scenarioIds: ["IS-1", "FS-2", "FS-3"],
  },
  // zktransfer
  {
    id: "zt-user",
    productId: "zktransfer",
    label: "zkTransfer 시나리오",
    shortLabel: "전송",
    description: "스테이블코인 프라이버시 전송과 CBDC·바우처 QR 결제 두 가지 시나리오를 포함합니다.",
    surface: "mixed",
    scenarioIds: ["ZT-1", "ZT-5"],
  },
  // zkporl
  {
    id: "risk",
    productId: "zkporl",
    label: "리스크 운영자",
    shortLabel: "리스크",
    description: "거래소 준비금·부채 증명 생성과 검증 결과를 모니터링하는 운영자 흐름입니다.",
    surface: "web",
    scenarioIds: ["ZP-1", "ZP-4"],
  },
  {
    id: "incident",
    productId: "zkporl",
    label: "보안관제·사고대응",
    shortLabel: "사고대응",
    description: "이상징후 탐지, 증명 실패 케이스를 확인하고 차단 조치를 실행하는 흐름입니다.",
    surface: "web",
    scenarioIds: ["ZP-4"],
  },
];

export const actorGroupById = Object.fromEntries(
  actorGroups.map((group) => [group.id, group]),
) as Record<ActorGroupId, ActorGroup | undefined>;

export function getGroupsByProduct(productId: ProductId): ActorGroup[] {
  return actorGroups.filter((g) => g.productId === productId);
}

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
