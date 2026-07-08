import type { Scenario } from "@/scenarios/types";

// ZP-4 v2.3 — 이상징후 차단, 2스텝.
// 1) 운영 중 거래소에 비정상 출금 제출  2) 위반 감지 + 지급 차단을 배치 로그·사고로 함께 확인.
// 세션은 통합 운영 모델로 공유되며, 제출이 현재 세션에 비정상 거래를 얹는다.
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
    { id: "ZP4-2", layout: "dashboard", actor: "리스크 운영자", title: "위반 감지 · 지급 차단", sections: [] },
  ],
  steps: [
    {
      id: "ZP4-step-1",
      kind: "user-action",
      label: "이상 출금 제출",
      trigger: "user",
      ctaLabel: "출금 요청",
      screenId: "ZP4-1",
      description: "잔고(0.8 BTC)를 초과하는 1.2 BTC 출금을 제출합니다. 데모에서는 이런 비정상 이벤트가 실제 원장에 주입됩니다.",
      processView: {
        kind: "overview",
        description: "공격자 관점: 원장 조작·오류·내부 부정으로 잔고 이상의 지급이 시도되는 상황입니다. 사용자 화면에서는 정상 접수처럼 보입니다.",
        cards: [
          { label: "보유 잔고", value: "0.8 BTC" },
          { label: "출금 시도", value: "1.2 BTC", tone: "warn" },
        ],
        sequence: {
          actors: ["개인 사용자", "거래소 원장"],
          activeEdge: { from: "개인 사용자", to: "거래소 원장", label: "잔고 초과 출금 제출", tone: "warn" },
        },
      },
    },
    {
      id: "ZP4-step-2",
      kind: "result",
      label: "위반 감지 · 지급 차단",
      trigger: "user",
      screenId: "ZP4-2",
      liveView: "incident",
      description: "zkPoL이 배치 증명을 만들다 invariant 위반(잔고 언더플로우)을 감지해 사고를 기록하고, 증명이 중단되어 지급이 차단됩니다. 아래에서 배치·사고·미반영 대기를 함께 확인하세요.",
      processView: {
        kind: "overview",
        description: "탐지 원리: 부채 증명은 sum(old) + delta = sum(new) 등식이 성립해야만 만들어집니다. 잔고를 초과하는 출금은 new 값이 음수가 되어 등식이 깨지고, 증명 생성 자체가 실패합니다 — 위반을 숨길 방법이 없습니다. 위반이 감지된 세션은 증명이 멈춰 미반영 대기가 누적되고, 지급이 차단됩니다. 재시연은 운영 대시보드의 '거래소 운영 시작'으로 새 세션을 발급하면 됩니다.",
        cards: [
          { label: "invariant", value: "sum(old) + Δ = sum(new)" },
          { label: "위반 유형", value: "잔고 언더플로우", tone: "bad" },
        ],
        sequence: {
          actors: [...pipeActors],
          activeEdge: { from: "zkPoL 서버", to: "온체인 게시판", label: "증명 제출 중단 (지급 차단)", tone: "bad" },
          pastEdges: [{ from: "거래소 원장", to: "zkPoL 서버", label: "비정상 이벤트 유입 → 위반 감지" }],
        },
      },
    },
  ],
};
