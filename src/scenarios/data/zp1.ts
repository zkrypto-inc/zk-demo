import type { Scenario } from "@/scenarios/types";

// ZP-1 v2.2 — 단계별 시연 + 스텝마다 라이브.
// 스텝 1(폰)에서 사용자가 거래를 제출하면 실제 파이프라인(새 세션)이 기동되고,
// 이후 스텝은 컴팩트 콘솔(liveView)로 유입→증명→현황을 실데이터로 관찰한다.
// 시퀀스는 스텝당 최대 3액터(1줄 배치) — 4액터는 컴팩트 뷰에서 2줄로 잘린다.
const pipeActors = ["거래소 원장", "zkPoL 서버", "온체인 게시판"] as const;

export const scenarioZP1: Scenario = {
  id: "ZP-1",
  groupId: "risk",
  planningId: "ZP-1",
  name: "거래소 상시 대사",
  shortName: "상시 대사",
  actor: "개인 사용자 · 리스크 운영자",
  actorType: "web",
  mode: "risk",
  summary:
    "사용자의 거래가 거래소 원장에 유입되면, zkPoL이 고객 부채(잔고 합계)를 개별 잔고 비공개 상태로 배치 증명하고 온체인에서 검증합니다.",
  screens: [
    {
      id: "ZP1-1",
      layout: "form",
      actorType: "mobile",
      actor: "개인 사용자 / 거래소 앱",
      title: "BTC 이체",
      subtitle: "보낼 수량과 주소를 확인하세요",
      status: "입력",
      sections: [
        {
          title: "거래 정보",
          fields: [
            { label: "자산", value: "BTC" },
            { label: "수량", value: "0.05 BTC" },
            { label: "받는 주소", value: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" },
          ],
        },
      ],
      actions: [{ id: "zp1-submit", label: "거래 제출", tone: "accent" }],
    },
    // 아래 화면들은 liveView 스텝이라 실제로는 컴팩트 콘솔이 렌더된다 (placeholder).
    { id: "ZP1-2", layout: "dashboard", actor: "리스크 운영자", title: "원장 이벤트 유입", sections: [] },
    { id: "ZP1-3", layout: "dashboard", actor: "리스크 운영자", title: "부채증명 생성·검증", sections: [] },
  ],
  steps: [
    {
      id: "ZP1-step-1",
      kind: "user-action",
      label: "거래 제출",
      trigger: "user",
      ctaLabel: "거래 제출",
      screenId: "ZP1-1",
      description: "사용자가 거래를 제출합니다. 이 거래가 거래소 원장 이벤트의 근원이 됩니다 — 제출과 동시에 원장 스트림(초당 50건)이 시작됩니다.",
      processView: {
        kind: "overview",
        description: "개인 사용자의 거래 1건이 거래소 원장에 기록됩니다. 데모에서는 제출 시 새 세션이 발급되고 수많은 다른 사용자의 거래가 함께 흐르기 시작합니다(1,000계정 시뮬레이션).",
        cards: [
          { label: "자산", value: "BTC" },
          { label: "원장 스트림", value: "50건/초", detail: "제출 시 시작" },
          { label: "시뮬레이션 계정", value: "1,000명" },
        ],
        sequence: {
          actors: ["개인 사용자", "거래소 원장"],
          activeEdge: { from: "개인 사용자", to: "거래소 원장", label: "거래 제출", tone: "accent" },
        },
      },
    },
    {
      id: "ZP1-step-2",
      kind: "system-processing",
      label: "원장 이벤트 유입",
      trigger: "user",
      screenId: "ZP1-2",
      liveView: "ingest",
      description: "거래소 원장의 변경 이벤트가 zkPoL 서버로 실시간 유입됩니다. 미반영 대기가 쌓이면 배치로 묶여 증명됩니다.",
      processView: {
        kind: "sequence",
        actors: [...pipeActors],
        activeEdge: { from: "거래소 원장", to: "zkPoL 서버", label: "원장 변경 이벤트 전달", tone: "accent" },
        description: "좌측 카운터가 실제 파이프라인 수치입니다 — 누적 처리 거래가 계속 오릅니다.",
      },
    },
    {
      id: "ZP1-step-3",
      kind: "result",
      label: "부채증명 생성·검증",
      trigger: "user",
      screenId: "ZP1-3",
      liveView: "verify",
      description: "미반영 이벤트가 배치로 묶여 고객 부채 증명이 생성되고, 온체인 게시판에서 검증됩니다. 개별 고객 잔고는 공개되지 않습니다. 전체 운영 현황은 '운영 대시보드' 메뉴에서 상시 확인할 수 있습니다.",
      processView: {
        kind: "liability-proof",
        description: "고객별 이전 커밋먼트에 거래 변동값이 반영되어 새 커밋먼트가 생성되고, 이 값들로 부채 증명이 구성됩니다.",
        formula: "sum(old_values) + delta = sum(new_values)",
        rows: [
          { user: "user1", oldValue: "cm1", delta: "+0.05", newValue: "cm1'" },
          { user: "user2", oldValue: "cm2", delta: "-150", newValue: "cm2'" },
          { user: "…", oldValue: "…", delta: "…", newValue: "…" },
        ],
        footnote: "커밋먼트(cm)는 잔고를 숨긴 암호학적 약속값입니다.",
        sequence: {
          actors: [...pipeActors],
          activeEdge: { from: "zkPoL 서버", to: "온체인 게시판", label: "배치 증명 제출·검증", tone: "ok" },
          pastEdges: [{ from: "거래소 원장", to: "zkPoL 서버", label: "원장 변경 이벤트 전달" }],
        },
      },
    },
  ],
};
