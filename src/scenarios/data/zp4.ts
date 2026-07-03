import type { Scenario } from "@/scenarios/types";

// ZP-4 v2.2 — 이상징후 차단, 스텝마다 라이브.
// 스텝 1(폰)에서 잔고를 초과하는 출금을 제출하면 실제로 비정상 원장 이벤트가 주입되고,
// 이후 스텝에서 invariant 위반 감지 → 지급 차단을 실데이터로 관찰한다.
// 시퀀스는 스텝당 최대 3액터(1줄 배치) — 4액터는 컴팩트 뷰에서 2줄로 잘린다.
const pipeActors = ["거래소 원장", "zkPoL 서버", "온체인 게시판"] as const;

export const scenarioZP4: Scenario = {
  id: "ZP-4",
  groupId: "risk",
  planningId: "ZP-4",
  name: "거래소 이상징후 차단",
  shortName: "이상징후 차단",
  actor: "개인 사용자 · 리스크 운영자",
  actorType: "web",
  mode: "incident",
  summary:
    "잔고를 초과하는 비정상 출금이 원장에 유입되면, zkPoL이 증명 과정에서 invariant 위반을 감지해 사고를 기록하고 지급을 차단합니다.",
  screens: [
    {
      id: "ZP4-1",
      layout: "form",
      actorType: "mobile",
      actor: "개인 사용자 / 거래소 앱",
      title: "BTC 출금",
      subtitle: "출금 수량과 주소를 확인하세요",
      status: "입력",
      sections: [
        {
          title: "출금 정보",
          fields: [
            { label: "자산", value: "BTC" },
            { label: "보유 잔고", value: "0.8 BTC" },
            { label: "출금 수량", value: "1.2 BTC", tone: "warn" },
            { label: "받는 주소", value: "bc1q0sender9malicious00000000000000000000" },
          ],
        },
      ],
      actions: [{ id: "zp4-submit", label: "출금 요청", tone: "accent" }],
    },
    // liveView 스텝 placeholder
    { id: "ZP4-2", layout: "dashboard", actor: "리스크 운영자", title: "위반 감지", sections: [] },
    { id: "ZP4-3", layout: "dashboard", actor: "리스크 운영자", title: "지급 차단", sections: [] },
    { id: "ZP4-4", layout: "dashboard", actor: "리스크 운영자", title: "사고 현황", sections: [] },
  ],
  steps: [
    {
      id: "ZP4-step-1",
      kind: "user-action",
      label: "이상 출금 제출",
      trigger: "user",
      ctaLabel: "출금 요청",
      screenId: "ZP4-1",
      description: "잔고(0.8 BTC)를 초과하는 1.2 BTC 출금을 제출합니다. 데모에서는 이런 비정상 이벤트 100건이 실제 원장에 주입됩니다.",
      processView: {
        kind: "overview",
        description: "공격자 관점: 원장 조작·오류·내부 부정으로 잔고 이상의 지급이 시도되는 상황입니다. 사용자 화면에서는 정상 접수처럼 보입니다.",
        cards: [
          { label: "보유 잔고", value: "0.8 BTC" },
          { label: "출금 시도", value: "1.2 BTC", tone: "warn" },
          { label: "주입 이벤트", value: "100건", detail: "비정상 버스트" },
        ],
        sequence: {
          actors: ["개인 사용자", "거래소 원장"],
          activeEdge: { from: "개인 사용자", to: "거래소 원장", label: "잔고 초과 출금 제출", tone: "warn" },
        },
      },
    },
    {
      id: "ZP4-step-2",
      kind: "system-processing",
      label: "위반 감지",
      trigger: "user",
      screenId: "ZP4-2",
      liveView: "detect",
      description: "zkPoL이 배치 증명을 만들다 invariant 위반(잔고 언더플로우)을 감지합니다.",
      processView: {
        kind: "overview",
        description: "탐지 원리: 부채 증명은 sum(old) + delta = sum(new) 등식이 성립해야만 만들어집니다. 잔고를 초과하는 출금은 new 값이 음수가 되어 등식이 깨지고, 증명 생성 자체가 실패합니다 — 숨길 방법이 없습니다.",
        cards: [
          { label: "invariant", value: "sum(old) + Δ = sum(new)" },
          { label: "위반 유형", value: "잔고 언더플로우", tone: "bad" },
        ],
        sequence: {
          actors: [...pipeActors],
          // self-edge(서버→서버)는 시작점=끝점이라 렌더되지 않음 — 유입 엣지에 감지를 함께 표기
          activeEdge: { from: "거래소 원장", to: "zkPoL 서버", label: "비정상 이벤트 유입 → 위반 감지", tone: "bad" },
        },
      },
    },
    {
      id: "ZP4-step-3",
      kind: "system-processing",
      label: "지급 차단",
      trigger: "user",
      screenId: "ZP4-3",
      liveView: "blocked",
      description: "위반이 감지된 세션은 증명이 중단됩니다 — 새 배치가 만들어지지 않아 미반영 대기만 쌓이고, 지급이 차단된 상태가 됩니다.",
      processView: {
        kind: "sequence",
        actors: [...pipeActors],
        activeEdge: { from: "zkPoL 서버", to: "온체인 게시판", label: "증명 제출 중단 (지급 차단)", tone: "bad" },
        pastEdges: [{ from: "거래소 원장", to: "zkPoL 서버", label: "비정상 이벤트 유입" }],
        description: "좌측 미반영 대기가 계속 누적되기만 하는 것이 차단의 증거입니다 — 정상 상태(ZP-1)에서는 배치로 소비되며 출렁였습니다.",
      },
    },
    {
      id: "ZP4-step-4",
      kind: "result",
      label: "사고 현황",
      trigger: "user",
      screenId: "ZP4-4",
      liveView: "console",
      description: "사고가 기록되고 시스템 상태가 '위험'으로 바뀌었습니다. '운영 대시보드' 메뉴에서도 그대로 확인됩니다. 새 시연은 대시보드의 '거래소 운영 시작'으로 — 새 세션으로 즉시 정상 복귀합니다.",
      processView: {
        kind: "overview",
        description: "차단된 세션은 복구되지 않습니다(의도된 동작). '거래소 운영 시작'이 새 세션을 발급해 언제든 처음부터 다시 시연할 수 있습니다 — 상시 대사(ZP-1)와 이상징후 차단(ZP-4)을 무한 반복 가능합니다.",
        sequence: {
          actors: [...pipeActors],
          activeEdge: { from: "zkPoL 서버", to: "온체인 게시판", label: "지급 차단 유지", tone: "bad" },
          pastEdges: [{ from: "거래소 원장", to: "zkPoL 서버", label: "비정상 이벤트 유입" }],
        },
      },
    },
  ],
};
