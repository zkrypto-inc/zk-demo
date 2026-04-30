import type { DemoState } from "@/store/demoStore";
import type { Field, ProcessView, ScenarioId, UserScreen } from "@/scenarios/types";

const generatedLabelFragments = [
  "id",
  "hash",
  "상태",
  "결과",
  "진행률",
  "완료",
  "승인",
  "검증",
  "이력",
  "audit",
  "wallet",
  "key",
  "sign",
  "tx",
  "program",
  "tenant",
];

const aliases: Record<string, string[]> = {
  "Request ID": ["요청 ID"],
  "요청 ID": ["Request ID"],
  "금액": ["금액", "입출금 금액", "처리 금액", "입금 수량", "출금 수량", "발행 수량", "소각 수량"],
  "처리 금액": ["입출금 금액", "금액"],
  "목적지": ["목적지 주소", "받는 주소"],
  "목적지 주소": ["목적지", "받는 주소"],
  "받는 주소": ["목적지 주소", "목적지"],
  "자산": ["자산", "자산 유형"],
  "발행사": ["발행사명"],
  "사유": ["사유", "요청 사유", "소각 사유", "노트"],
  "증빙": ["증빙 파일", "첨부 증빙"],
};

function normalize(label: string) {
  return label
    .toLowerCase()
    .replace(/[()\[\]{}·:/_.\-\s]/g, "")
    .replace(/request/g, "요청")
    .replace(/amount/g, "금액");
}

export function isEditableField(field: Field) {
  if (field.tone === "ok" || field.tone === "bad" || field.tone === "warn") return false;

  const normalized = normalize(field.label);
  return !generatedLabelFragments.some((fragment) => normalized.includes(fragment));
}

export function resolveLiveValue(
  state: DemoState,
  scenarioId: ScenarioId,
  label: string,
  fallback: string,
) {
  const scenarioValues = state.scenarioValues[scenarioId] ?? {};
  const candidates = [label, ...(aliases[label] ?? [])];

  for (const candidate of candidates) {
    const exact = scenarioValues[candidate];
    if (exact !== undefined && exact.trim() !== "") return exact;
  }

  const normalizedLabel = normalize(label);
  for (const [storedLabel, value] of Object.entries(scenarioValues)) {
    const normalizedStored = normalize(storedLabel);
    if (
      normalizedLabel.includes(normalizedStored) ||
      normalizedStored.includes(normalizedLabel)
    ) {
      if (value.trim() !== "") return value;
    }
  }

  return fallback;
}

export function withLiveScreenValues(
  screen: UserScreen,
  state: DemoState,
  scenarioId: ScenarioId,
): UserScreen {
  const screenValues = state.formValues[screen.id] ?? {};

  return {
    ...screen,
    sections: screen.sections.map((section) => ({
      ...section,
      fields: section.fields.map((field) => ({
        ...field,
        value: screenValues[field.label] ?? resolveLiveValue(state, scenarioId, field.label, field.value),
      })),
    })),
  };
}

export function withLiveProcessView(
  view: ProcessView,
  state: DemoState,
  scenarioId: ScenarioId,
): ProcessView {
  const resolveField = <T extends { label: string; value: string }>(field: T): T => ({
    ...field,
    value: resolveLiveValue(state, scenarioId, field.label, field.value),
  });

  switch (view.kind) {
    case "sequence":
      return view;
    case "overview":
      return {
        ...view,
        cards: view.cards?.map(resolveField),
      };
    case "keygen":
      return {
        ...view,
        nodes: view.nodes.map(resolveField),
      };
    case "artifact":
      return {
        ...view,
        items: view.items.map(resolveField),
      };
    case "audit":
      return {
        ...view,
        summary: view.summary?.map(resolveField),
      };
    case "approval":
      return view;
    default:
      return view;
  }
}
