import type { Scenario, SequenceContext } from "@/scenarios/types";

const seqActors = ["거래소 원장", "zkPoRL 서버", "온체인 게시판"] as const;

const batchSeq = (phase: "generate" | "verify" | "done"): SequenceContext => {
  const base = [{ from: "거래소 원장", to: "zkPoRL 서버", label: "원장 변경 이벤트 전달" }];
  if (phase === "generate") {
    return {
      actors: [...seqActors],
      activeEdge: { from: "zkPoRL 서버", to: "zkPoRL 서버", label: "배치 증명 생성 중", tone: "accent" },
      pastEdges: base,
    };
  }
  if (phase === "verify") {
    return {
      actors: [...seqActors],
      activeEdge: { from: "zkPoRL 서버", to: "온체인 게시판", label: "증명 제출·검증", tone: "accent" },
      pastEdges: [...base, { from: "zkPoRL 서버", to: "zkPoRL 서버", label: "배치 증명 생성" }],
    };
  }
  return {
    actors: [...seqActors],
    activeEdge: { from: "온체인 게시판", to: "zkPoRL 서버", label: "검증 완료 반환", tone: "ok" },
    pastEdges: [
      ...base,
      { from: "zkPoRL 서버", to: "zkPoRL 서버", label: "배치 증명 생성" },
      { from: "zkPoRL 서버", to: "온체인 게시판", label: "증명 제출·검증" },
    ],
  };
};

export const scenarioZP1: Scenario = {
  id: "ZP-1",
  groupId: "risk",
  planningId: "ZP-1",
  name: "거래소 상시 대사",
  shortName: "상시 대사",
  actor: "리스크 운영자",
  actorType: "web",
  mode: "risk",
  summary: "거래소 고객 부채(오프체인 잔고 합계)를 개별 잔고 비공개 상태로 ZK Proof로 지속 증명하고, 대시보드로 준비금·부채 정합성을 상시 확인합니다.",
  screens: [
    {
      id: "ZP1-1",
      layout: "result",
      actorType: "mobile",
      actor: "개인 사용자 / 거래소 앱",
      title: "거래 체결 완료",
      subtitle: "특정 자산의 체결 내역을 확인합니다",
      status: "체결 완료",
      sections: [
        {
          title: "체결 내역",
          fields: [
            { label: "거래 유형", value: "BTC 매수" },
            { label: "자산", value: "BTC" },
            { label: "수량", value: "0.5 BTC" },
          ],
        },
      ],
      actions: [{ id: "confirm-trade", label: "확인", tone: "accent" }],
    },
    {
      id: "ZP1-2",
      layout: "dashboard",
      webContext: { menuItem: "원장 이벤트", pageTitle: "PoR/L 대사", host: "ops.zkporl.io" },
      actor: "리스크 운영자 / 운영자 웹 대시보드",
      title: "원장 이벤트 유입 현황",
      subtitle: "거래소 원장에서 PoRL 서버로 전달된 이벤트를 확인합니다",
      status: "정상",
      sections: [
        {
          title: "이벤트 유입 현황",
          fields: [
            { label: "이벤트 유입 상태", value: "정상", tone: "ok" },
            { label: "자산", value: "BTC" },
            { label: "포함 이벤트 수", value: "1,248" },
            { label: "마지막 수신", value: "2026-05-11 10:05" },
          ],
        },
        {
          title: "이벤트 목록 (최근 3건)",
          fields: [],
          table: {
            columns: [
              { key: "eventId", label: "event_id" },
              { key: "asset", label: "자산 이름" },
              { key: "delta", label: "delta" },
              { key: "eventType", label: "이벤트 종류" },
            ],
            rows: [
              { eventId: "evt_001", asset: "BTC", delta: "+0.5", eventType: "체결" },
              { eventId: "evt_002", asset: "USDC", delta: "-150", eventType: "출금" },
              { eventId: "evt_003", asset: "ETH", delta: "+1.2", eventType: "입금" },
            ],
          },
        },
      ],
    },
    {
      id: "ZP1-3",
      layout: "processing",
      webContext: { menuItem: "증명 배치", pageTitle: "PoR/L 대사", host: "ops.zkporl.io" },
      actor: "리스크 운영자 / 데모 페이지",
      title: "고객 부채 증명 생성",
      subtitle: "고객 부채 정합성 증명을 생성하는 중입니다",
      status: "생성 중",
      sections: [
        {
          title: "증명 생성 진행",
          fields: [
            { label: "생성 상태", value: "증명 생성 중...", tone: "accent" },
          ],
        },
      ],
    },
    {
      id: "ZP1-4",
      layout: "processing",
      webContext: { menuItem: "온체인 검증", pageTitle: "PoR/L 대사", host: "ops.zkporl.io" },
      actor: "리스크 운영자 / 데모 페이지",
      title: "증명 검증",
      subtitle: "증명 검증 진행 중입니다",
      status: "검증 중",
      sections: [
        {
          title: "검증 진행",
          fields: [
            { label: "검증 상태", value: "증명 검증 진행 중...", tone: "accent" },
          ],
        },
      ],
    },
    {
      id: "ZP1-5",
      layout: "dashboard",
      webContext: { menuItem: "검증 내역", pageTitle: "PoR/L 대사", host: "ops.zkporl.io" },
      actor: "리스크 운영자 / 공개 대시보드",
      title: "증명 결과 확인",
      subtitle: "온체인에 제출된 배치 검증 내역을 조회합니다",
      status: "조회 전용",
      sections: [
        {
          title: "검증 내역",
          fields: [],
          table: {
            columns: [
              { key: "batchId", label: "배치 id", width: "minmax(180px, 1.6fr)" },
              { key: "coin", label: "코인", width: "minmax(72px, 0.7fr)" },
              { key: "status", label: "상태", width: "minmax(96px, 0.9fr)" },
              { key: "txHash", label: "온체인 제출 Hash", width: "minmax(150px, 1.3fr)" },
              { key: "blockTime", label: "블록 생성 시간", width: "minmax(150px, 1.3fr)" },
            ],
            rows: [
              {
                batchId: "batch_20260511_1005_BTC",
                coin: "BTC",
                status: "검증 완료",
                txHash: "0x3a7f...c8d2",
                blockTime: "2026-05-11 10:05",
              },
              {
                batchId: "batch_20260511_1010_ETH",
                coin: "ETH",
                status: "검증 완료",
                txHash: "0x9c14...4e21",
                blockTime: "2026-05-11 10:10",
              },
              {
                batchId: "batch_20260511_1015_USDC",
                coin: "USDC",
                status: "검증 완료",
                txHash: "0x61bd...7a09",
                blockTime: "2026-05-11 10:15",
              },
            ],
          },
        },
      ],
    },
  ],
  steps: [
    {
      id: "ZP1-step-1",
      kind: "user-action",
      label: "거래 체결",
      trigger: "user",
      ctaLabel: "확인",
      screenId: "ZP1-1",
      description: "사용자가 특정 자산에 대한 거래 체결 내역을 확인합니다",
      processView: {
        kind: "overview",
        description: "개인 사용자 앱에서 거래 체결 내역을 확인합니다. 이 레이어에서는 부채 증명(PoL)이나 원장 이벤트 세부 정보가 노출되지 않습니다.",
        cards: [
          { label: "거래 유형", value: "BTC 매수" },
          { label: "자산", value: "BTC" },
          { label: "수량", value: "0.5 BTC" },
        ],
        sequence: {
          actors: ["개인 사용자 App", "거래소"],
          activeEdge: { from: "개인 사용자 App", to: "거래소", label: "거래 체결 내역 확인", tone: "accent" },
        },
      },
    },
    {
      id: "ZP1-step-2",
      kind: "system-processing",
      label: "원장 이벤트 전달",
      trigger: "auto",
      duration: 2000,
      screenId: "ZP1-2",
      description: "거래소 원장이 원장 변경 이벤트를 zkPoRL 서버로 전달합니다",
      processView: {
        kind: "sequence",
        actors: [...seqActors],
        activeEdge: { from: "거래소 원장", to: "zkPoRL 서버", label: "원장 변경 이벤트 전달", tone: "accent" },
        description: "거래 완료 후 원장이 변경 이벤트(ledger_change_event)를 zkPoRL 서버로 전달합니다. 운영자는 이벤트 유입 상태와 마지막 수신 시각을 확인합니다.",
      },
    },
    {
      id: "ZP1-step-3",
      kind: "system-processing",
      label: "부채 증명 생성",
      trigger: "auto",
      duration: 4000,
      screenId: "ZP1-3",
      description: "거래 내역을 바탕으로 고객 부채 증명을 생성합니다",
      processView: {
        kind: "liability-proof",
        description: "우측 처리 개요에서는 배치 전후 liability witness가 어떻게 연결되는지 유저 행 단위로 보여줍니다. 사용자 화면에는 증명 생성 진행 상태만 노출합니다.",
        formula: "sum(old_values) + delta = sum(new_values)",
        rows: [
          { user: "user1", oldValue: "cm1", delta: "5", newValue: "new_cm1" },
          { user: "user2", oldValue: "cm2", delta: "10", newValue: "new_cm2" },
          { user: "user3", oldValue: "cm3", delta: "13", newValue: "new_cm3" },
        ],
        footnote: "cm 값은 실제 고객 잔고가 아닌 커밋먼트 예시입니다. 회로는 배치 전후 총 liability가 delta만큼 정확히 변동했음을 증명합니다.",
        sequence: batchSeq("generate"),
      },
    },
    {
      id: "ZP1-step-4",
      kind: "system-processing",
      label: "증명 검증",
      trigger: "auto",
      duration: 2000,
      screenId: "ZP1-4",
      description: "온체인 게시판에 증명을 제출하고 검증합니다",
      processView: {
        kind: "step-list",
        description: "생성된 증명을 온체인에 제출하고, liability 정합성과 커밋먼트 양수 조건을 순서대로 검증합니다.",
        title: "증명 검증 단계",
        progressLabel: "증명 검증 진행 중",
        progress: 100,
        steps: [
          { label: "잔고 정합성 확인", value: "liability_old + delta = liability_new", state: "done" },
          { label: "각 cm > 0인지 확인", value: "커밋먼트 양수 조건 검증", state: "active" },
        ],
        sequence: batchSeq("verify"),
      },
    },
    {
      id: "ZP1-step-5",
      kind: "result",
      label: "증명 결과 확인",
      trigger: "auto",
      duration: 1500,
      screenId: "ZP1-5",
      description: "운영자가 온체인에 제출된 배치 검증 내역을 확인합니다",
      processView: {
        kind: "overview",
        description: "알림 확인과 대시보드 업데이트를 하나의 조회 단계로 통합합니다. 화면에서는 배치 ID, 코인, 상태, 온체인 제출 Hash, 블록 생성 시간을 표 형태로 확인합니다.",
        cards: [
          { label: "조회 모드", value: "PUBLIC", tone: "accent" },
          { label: "최근 검증", value: "3 batches", tone: "ok" },
          { label: "공개 상태", value: "read-only", tone: "ok" },
        ],
        sequence: batchSeq("done"),
      },
    },
  ],
};
