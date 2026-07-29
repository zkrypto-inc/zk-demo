import type { Scenario } from "@/scenarios/types";

// ZP-4 v2.5 — 이상징후 차단, 3스텝. 모니터링 시스템이 주체가 되는 순서로 재구성.
// 0) 정상 운영 중인 모니터링 콘솔을 먼저 보여준다(정상 배치 증명이 연속 생성).
// 1) 같은 콘솔에서 이상 거래를 주입해 '정상 → 실패 → 차단' 전환을 본다.
// 2) 그 결과가 개인 사용자에게 어떻게 도달하는지(지급 보류)를 폰 화면으로 확인한다.
// 세션은 통합 운영 모델로 공유되며, 주입이 현재 세션에 비정상 이벤트를 얹는다.
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
    // liveView 스텝이라 실제로는 컴팩트 콘솔이 렌더된다 (placeholder).
    { id: "ZP4-0", layout: "dashboard", actor: "리스크 운영자", title: "거래 모니터링 시스템", sections: [] },
    { id: "ZP4-1", layout: "dashboard", actor: "리스크 운영자", title: "거래 모니터링 시스템", sections: [] },
    {
      id: "ZP4-2",
      layout: "result",
      // scenario.actorType이 "web"이라 이 화면만 모바일로 렌더하려면 명시해야 한다.
      actorType: "mobile",
      actor: "개인 사용자 / 거래소 앱",
      title: "출금이 보류되었습니다",
      status: "지급 보류",
      statusTone: "bad",
      sections: [
        {
          title: "출금 요청",
          fields: [
            { label: "자산", value: "BTC" },
            { label: "수량", value: "1.2 BTC" },
            { label: "요청 시각", value: "방금 전" },
          ],
        },
        {
          title: "처리 상태",
          fields: [
            { label: "상태", value: "지급 보류", tone: "bad" },
            { label: "사유", value: "부채 증명 검증 실패", tone: "bad" },
            { label: "조치", value: "해당 구간 지급 차단", tone: "warn" },
          ],
        },
      ],
      footer:
        "거래소 부채 증명 검증에 실패해 해당 구간의 지급이 일시 보류되었습니다. 검증이 정상화될 때까지 출금이 처리되지 않습니다.",
    },
  ],
  steps: [
    {
      id: "ZP4-step-0",
      kind: "system-processing",
      label: "정상 운영",
      trigger: "user",
      screenId: "ZP4-0",
      liveView: "normal",
      description:
        "거래소 원장의 변경이 실시간으로 배치 증명·검증되는 정상 운영 상태입니다. 아래 콘솔에 검증을 통과한 배치가 실시간으로 쌓입니다. 다음 단계에서 이 세션에 이상 거래를 주입해 검증이 어떻게 반응하는지 확인합니다.",
      processView: {
        kind: "overview",
        description:
          "정상 운영 중에는 배치마다 sum(old) + delta = sum(new) 등식이 성립해 증명이 끊김 없이 생성됩니다. 이 등식이 유지되는 한 지급은 정상 처리됩니다 — 다음 단계에서 이 등식을 깨는 이상 거래를 주입합니다.",
        cards: [
          { label: "운영 상태", value: "정상 운영 중", tone: "ok" },
          { label: "invariant", value: "sum(old) + Δ = sum(new)" },
          { label: "배치 증명", value: "연속 통과", tone: "ok" },
        ],
        sequence: {
          actors: [...pipeActors],
          activeEdge: { from: "zkPoL 서버", to: "온체인 게시판", label: "배치 증명 제출·검증", tone: "ok" },
          pastEdges: [{ from: "거래소 원장", to: "zkPoL 서버", label: "원장 변경 이벤트 전달" }],
        },
      },
    },
    {
      id: "ZP4-step-1",
      kind: "system-processing",
      label: "이상징후 감지",
      trigger: "user",
      screenId: "ZP4-1",
      liveView: "monitor",
      description:
        "거래소 원장의 변경이 실시간으로 배치 증명·검증되는 정상 운영 상태입니다. 아래 콘솔에서 '이상 거래 주입'을 눌러 잔고를 초과하는 비정상 이벤트를 원장에 흘려보내고, 검증이 어떻게 반응하는지 확인하세요.",
      processView: {
        kind: "overview",
        description:
          "정상 운영 중에는 배치마다 sum(old) + delta = sum(new) 등식이 성립해 증명이 계속 생성됩니다. 잔고를 초과하는 이벤트가 섞이는 순간 이 등식이 깨지고, 증명 생성 자체가 실패해 위반이 드러납니다 — 숨길 방법이 없습니다. 배치 조립 단계에서 실패하므로 그 행에는 아직 배치 번호가 없습니다.",
        cards: [
          { label: "운영 상태", value: "상시 검증 중" },
          { label: "invariant", value: "sum(old) + Δ = sum(new)" },
          { label: "주입 이벤트", value: "잔고 초과 차감", tone: "warn" },
        ],
        sequence: {
          actors: [...pipeActors],
          activeEdge: { from: "zkPoL 서버", to: "온체인 게시판", label: "배치 증명 제출·검증", tone: "ok" },
          pastEdges: [{ from: "거래소 원장", to: "zkPoL 서버", label: "원장 변경 이벤트 전달" }],
        },
      },
    },
    {
      id: "ZP4-step-2",
      kind: "result",
      label: "지급 차단",
      trigger: "user",
      screenId: "ZP4-2",
      description:
        "위반이 기록된 뒤의 사용자 화면입니다. 증명이 멈춘 구간은 지급이 보류되어, 정상 사용자의 출금도 함께 대기 상태가 됩니다.",
      processView: {
        kind: "overview",
        description:
          "탐지 원리: 부채 증명은 sum(old) + delta = sum(new) 등식이 성립해야만 만들어집니다. 잔고를 초과하는 출금은 new 값이 음수가 되어 등식이 깨지고, 증명 생성 자체가 실패합니다 — 위반을 숨길 방법이 없습니다. 이때 지급이 멈추는 것은 결함이 아니라 안전 원칙입니다: 부채가 정확하다고 확신할 수 없는 구간은 지급하지 않습니다. 그래서 비정상 거래 1건만이 아니라 해당 구간의 지급 전체가 보류되고, 검증이 정상화되어야 재개됩니다. 재시연은 운영 대시보드의 '초기화(새 세션)'로 새 세션을 발급하면 됩니다.",
        cards: [
          { label: "invariant", value: "sum(old) + Δ = sum(new)" },
          { label: "위반 유형", value: "잔고 언더플로우", tone: "bad" },
          { label: "사용자 영향", value: "해당 구간 지급 보류", tone: "warn" },
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
