import type { ActorGroupId, ProductId, Scenario, ScenarioId, Surface } from "./types";

export const productLabels: Record<ProductId, string> = {
  zkwallet: "zkWallet",
  zktransfer: "zkTransfer",
  zkpasskey: "zkPasskey",
  zkpol: "zkPoL",
  zkvoting: "zkVoting",
};

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
    scenarioIds: ["FU-1", "FU-2", "FU-3"],
  },
  {
    id: "custody",
    productId: "zkwallet",
    label: "디지털 자산 수탁사",
    shortLabel: "수탁",
    description: "수탁 등록, 입금, 출금 요청을 웹 콘솔에서 처리하는 운영자 흐름입니다.",
    surface: "web",
    scenarioIds: ["CU-1", "CU-2", "CU-3"],
  },
  {
    id: "issuer",
    productId: "zkwallet",
    label: "스테이블코인 발행사",
    shortLabel: "발행사",
    description: "발행사 등록, 발행, 소각, 준비금 요청을 생성하고 승인 상태를 확인합니다.",
    surface: "web",
    scenarioIds: ["IS-1", "FS-2", "FS-3"],
  },
  // zktransfer — actor split (개인 사용자 / CBDC 사용자 / 감사자)
  {
    id: "zt-user",
    productId: "zktransfer",
    label: "개인 사용자",
    shortLabel: "개인",
    description: "개인 사용자가 스테이블코인을 비공개로 전송하는 흐름입니다.",
    surface: "app",
    scenarioIds: ["ZT-1"],
  },
  {
    id: "zt-cbdc-user",
    productId: "zktransfer",
    label: "CBDC 사용자",
    shortLabel: "CBDC",
    description: "CBDC·지역 바우처 사용자가 QR로 정책형 비공개 결제를 수행하는 흐름입니다.",
    surface: "app",
    scenarioIds: ["ZT-5"],
  },
  {
    id: "zt-auditor",
    productId: "zktransfer",
    label: "감사자",
    shortLabel: "감사",
    description: "프라이버시 전송과 CBDC·바우처 결제 모두를 감사 키로 복호화하는 통합 감사 흐름입니다.",
    surface: "web",
    scenarioIds: ["ZT-A"],
  },
  // zkpasskey
  {
    id: "passkey-user",
    productId: "zkpasskey",
    label: "개인 사용자용",
    shortLabel: "개인 사용자",
    description: "개인 사용자가 ZKPasskey 앱에서 지갑을 개설하고, 등록된 Web2 신원으로 지갑을 복구하는 흐름입니다.",
    surface: "app",
    scenarioIds: ["ZK-1", "ZK-2"],
  },
  // zkpol
  {
    id: "risk",
    productId: "zkpol",
    label: "거래소용",
    shortLabel: "거래소",
    description: "거래소 고객 부채 정합성을 상시 증명하고, 이상징후를 탐지·차단하는 흐름을 포함합니다.",
    surface: "web",
    scenarioIds: ["ZP-1", "ZP-4", "ZP-D"],
  },
  {
    id: "stablecoin-risk",
    productId: "zkpol",
    label: "스테이블코인용",
    shortLabel: "스테이블코인",
    description: "스테이블코인 발행 잔액과 고객 잔액 정합성을 상시 증명하고, 이상징후를 탐지·차단하는 흐름을 포함합니다.",
    surface: "web",
    scenarioIds: ["ZPS-1", "ZPS-4"],
  },
  // zkvoting
  {
    id: "zv-voter",
    productId: "zkvoting",
    label: "유권자 (온라인)",
    shortLabel: "유권자",
    description: "유권자가 스마트폰 웹에서 본인확인 후 비밀투표하고, 투표값 암호화·영지식증명 생성까지 단말에서 수행하는 흐름입니다.",
    surface: "app",
    scenarioIds: ["ZV-1"],
  },
  {
    id: "zv-operator",
    productId: "zkvoting",
    label: "운영자 (주최측)",
    shortLabel: "운영자",
    description: "운영자가 웹 콘솔에서 투표를 개설하고 명부를 머클트리로 고정한 뒤, 종료 후 개표·개표 무결성 검증을 수행하는 흐름입니다.",
    surface: "web",
    scenarioIds: ["ZO-1"],
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

export function getProductLabelByScenarioId(scenarioId: ScenarioId): string {
  const groupId = scenarioGroupLookup[scenarioId];
  const group = groupId ? actorGroupById[groupId] : undefined;
  return group ? productLabels[group.productId] : "zkWallet";
}

export function getScenarioDisplayId(scenario: Scenario) {
  return scenario.displayId ?? scenario.planningId ?? scenario.id;
}

export function getScenarioSurface(scenario: Scenario): Surface {
  if (scenario.surface) return scenario.surface;
  return scenario.actorType === "mobile" ? "app" : "web";
}
