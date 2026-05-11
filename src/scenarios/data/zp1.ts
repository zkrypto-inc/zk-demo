import type { Scenario, SequenceContext } from "@/scenarios/types";

const seqActors = ["거래소 원장", "zkPoRL 서버", "온체인 / BulletinBoard"] as const;

const batchSeq = (phase: "generate" | "verify" | "done"): SequenceContext => {
  const base = [{ from: "거래소 원장", to: "zkPoRL 서버", label: "원장 이벤트 전달" }];
  if (phase === "generate") {
    return {
      actors: [...seqActors],
      activeEdge: { from: "zkPoRL 서버", to: "zkPoRL 서버", label: "BatchCircuit Proof 생성 중", tone: "accent" },
      pastEdges: base,
    };
  }
  if (phase === "verify") {
    return {
      actors: [...seqActors],
      activeEdge: { from: "zkPoRL 서버", to: "온체인 / BulletinBoard", label: "Proof 제출 및 검증", tone: "accent" },
      pastEdges: [...base, { from: "zkPoRL 서버", to: "zkPoRL 서버", label: "BatchCircuit Proof 생성" }],
    };
  }
  return {
    actors: [...seqActors],
    activeEdge: { from: "온체인 / BulletinBoard", to: "zkPoRL 서버", label: "검증 완료 반환", tone: "ok" },
    pastEdges: [
      ...base,
      { from: "zkPoRL 서버", to: "zkPoRL 서버", label: "BatchCircuit Proof 생성" },
      { from: "zkPoRL 서버", to: "온체인 / BulletinBoard", label: "Proof 제출 및 검증" },
    ],
  };
};

export const scenarioZP1: Scenario = {
  id: "ZP-1",
  groupId: "risk",
  planningId: "ZP-1",
  name: "거래소 상시 PoR/L 대사",
  shortName: "상시 PoR/L 대사",
  actor: "리스크 운영자",
  actorType: "web",
  mode: "risk",
  summary: "거래소 고객 부채(오프체인 잔고 합계)를 개별 잔고 비공개 상태로 ZK Proof로 지속 증명하고, 대시보드로 준비금·부채 정합성을 상시 확인합니다.",
  screens: [
    {
      id: "ZP1-1",
      layout: "result",
      actor: "개인 사용자 / 거래소 앱",
      title: "거래 체결 완료",
      subtitle: "사용자 화면에는 정상 거래 결과만 표시됩니다",
      status: "체결 완료",
      sections: [
        {
          title: "거래 결과",
          fields: [
            { label: "거래 유형", value: "BTC 매수" },
            { label: "자산", value: "BTC" },
            { label: "수량", value: "0.5 BTC" },
            { label: "상태", value: "체결 완료", tone: "ok" },
            { label: "잔고 반영", value: "완료", tone: "ok" },
          ],
        },
      ],
    },
    {
      id: "ZP1-2",
      layout: "dashboard",
      actor: "리스크 운영자 / 운영자 웹 대시보드",
      title: "원장 이벤트 유입 현황",
      subtitle: "거래소 원장에서 PoRL 서버로 전달된 이벤트를 확인합니다",
      status: "정상",
      sections: [
        {
          title: "이벤트 유입 현황",
          fields: [
            { label: "PoL 유입 상태", value: "정상", tone: "ok" },
            { label: "자산", value: "BTC" },
            { label: "포함 이벤트 수", value: "1,248" },
            { label: "마지막 수신", value: "2026-05-11 10:05" },
          ],
        },
        {
          title: "이벤트 목록 (최근 3건)",
          fields: [
            { label: "event_id: evt_001", value: "BTC +0.5 | 체결" },
            { label: "event_id: evt_002", value: "USDC -150 | 출금" },
            { label: "event_id: evt_003", value: "ETH +1.2 | 입금" },
          ],
        },
      ],
    },
    {
      id: "ZP1-3",
      layout: "processing",
      actor: "리스크 운영자 / 데모 페이지",
      title: "고객 부채 증명 생성",
      subtitle: "sum(old) + delta == sum(new) — 개별 잔고는 비공개",
      status: "생성 중",
      sections: [
        {
          title: "핵심 공식",
          fields: [
            { label: "증명 대상", value: "고객 오프체인 부채 합계 정합성" },
            { label: "공식", value: "sum(old_values) + delta == sum(new_values)" },
            { label: "old_values", value: "구간 시작 시점 고객 잔고 합계 (cm_old)" },
            { label: "delta", value: "입금 + 출금 + 거래 + 정산 합계" },
            { label: "new_values", value: "구간 종료 시점 고객 잔고 합계 (cm_new)" },
          ],
        },
        {
          title: "BatchCircuit 진행",
          fields: [
            { label: "배치 ID", value: "batch_20260511_1005_BTC" },
            { label: "처리 이벤트", value: "1,248" },
            { label: "생성 상태", value: "진행 중...", tone: "accent" },
          ],
        },
      ],
    },
    {
      id: "ZP1-4",
      layout: "dashboard",
      actor: "리스크 운영자 / 데모 페이지",
      title: "증명 검증",
      subtitle: "cm > 0 체크와 cm 정합성 검증을 동시에 수행합니다",
      status: "검증 중",
      sections: [
        {
          title: "검증 항목",
          fields: [
            { label: "잔고 비공개", value: "개별 잔고 미노출 (commitment 처리)", tone: "ok" },
            { label: "cm > 0 체크", value: "모든 잔고 양수 확인", tone: "ok" },
            { label: "합계 정합성", value: "sum(old) + delta == sum(new) 일치", tone: "ok" },
            { label: "위변조 방지", value: "온체인 제출 완료", tone: "ok" },
          ],
        },
        {
          title: "검증 결과",
          fields: [
            { label: "cm > 0 결과", value: "잔고 오류 없음", tone: "ok" },
            { label: "정합성 결과", value: "일치 (PASS)", tone: "ok" },
            { label: "txHash", value: "0x3a7f...c8d2" },
          ],
        },
      ],
    },
    {
      id: "ZP1-5",
      layout: "dashboard",
      actor: "리스크 운영자 / 운영자 웹 대시보드",
      title: "검증 결과 알림",
      subtitle: "정상·주의·위험 배지로 배치 상태를 확인합니다",
      status: "모니터링",
      sections: [
        {
          title: "알림 이력",
          fields: [
            { label: "BTC #18", value: "정상 — 제출 완료", tone: "ok" },
            { label: "USDT #16", value: "주의 — 제출 지연 (retry 2회)", tone: "warn" },
            { label: "BNB #14", value: "위험 — 서명 검증 실패", tone: "bad" },
          ],
        },
        {
          title: "BTC #18 처리 결과",
          fields: [
            { label: "배치 ID", value: "batch_20260511_1005_BTC" },
            { label: "이벤트 수", value: "1,248" },
            { label: "retry 횟수", value: "0" },
            { label: "상태", value: "완료", tone: "ok" },
          ],
        },
      ],
    },
    {
      id: "ZP1-6",
      layout: "dashboard",
      actor: "리스크 운영자 / 감사자 / 외부 공개 조회자",
      title: "대시보드 업데이트",
      subtitle: "공개 대시보드와 운영 대시보드가 갱신됩니다",
      status: "완료",
      sections: [
        {
          title: "공개 대시보드 — 자산별 건전성",
          fields: [
            { label: "BTC 온체인 자산", value: "1,264.10 BTC" },
            { label: "BTC 오프체인 부채", value: "1,240.23 BTC" },
            { label: "준비율", value: "101.9%", tone: "ok" },
          ],
        },
        {
          title: "검증 이력 (최근)",
          fields: [
            { label: "BTC #18", value: "+2.8 BTC | 1,248 events | 2026-05-11 10:05", tone: "ok" },
            { label: "txHash", value: "0x3a7f...c8d2" },
          ],
        },
        {
          title: "운영 대시보드 — 배치 상태",
          fields: [
            { label: "BTC #18", value: "완료 (0 retries)", tone: "ok" },
            { label: "USDT #16", value: "재시도 중 (2회 / RPC delay)", tone: "warn" },
          ],
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
      ctaLabel: "다음 단계",
      screenId: "ZP1-1",
      description: "사용자가 BTC를 매수합니다. 사용자 화면에는 정상 체결 결과만 표시됩니다",
      processView: {
        kind: "overview",
        description: "사용자가 거래를 완료합니다. 이 레이어에서는 PoL이나 원장 이벤트 세부 정보가 노출되지 않습니다.",
        cards: [
          { label: "거래 유형", value: "BTC 매수" },
          { label: "수량", value: "0.5 BTC" },
          { label: "상태", value: "체결 완료", tone: "ok" },
        ],
      },
    },
    {
      id: "ZP1-step-2",
      kind: "system-processing",
      label: "원장 이벤트 전달",
      trigger: "auto",
      duration: 2000,
      screenId: "ZP1-2",
      description: "거래소 원장이 ledger_change_event를 zkPoRL 서버로 전달합니다",
      processView: {
        kind: "sequence",
        actors: [...seqActors],
        activeEdge: { from: "거래소 원장", to: "zkPoRL 서버", label: "ledger_change_event 전달", tone: "accent" },
        description: "거래 완료 후 원장이 event를 zkPoRL 서버로 전달합니다. 운영자는 이벤트 유입 상태와 마지막 수신 시각을 확인합니다.",
      },
    },
    {
      id: "ZP1-step-3",
      kind: "system-processing",
      label: "부채 증명 생성",
      trigger: "auto",
      duration: 4000,
      screenId: "ZP1-3",
      description: "zkPoRL 서버가 BatchCircuit으로 고객 부채 ZK Proof를 생성합니다",
      processView: {
        kind: "keygen",
        description: "sum(old_values) + delta == sum(new_values) 공식으로 고객 부채 정합성을 증명합니다. 개별 잔고는 commitment(cm)로 숨겨집니다.",
        progress: 55,
        showProgress: true,
        progressLabel: "BatchCircuit Proof 생성 중",
        nodes: [
          { label: "old_values (cm_old)", value: "로드 완료", tone: "ok" },
          { label: "delta 집계", value: "1,248 이벤트", tone: "ok" },
          { label: "BatchCircuit 실행", value: "진행 중", tone: "accent" },
          { label: "cm_new 준비", value: "대기", tone: "neutral" },
        ],
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
      description: "온체인 / BulletinBoard에 Proof를 제출하고 검증합니다",
      processView: {
        kind: "artifact",
        description: "생성된 Proof를 온체인에 제출합니다. cm > 0 체크와 합계 정합성 검증을 동시 수행합니다.",
        items: [
          { label: "cm > 0 체크", value: "잔고 오류 없음", tone: "ok" },
          { label: "합계 정합성", value: "일치 (PASS)", tone: "ok" },
          { label: "위변조 방지", value: "온체인 기록 완료", tone: "ok" },
          { label: "txHash", value: "0x3a7f...c8d2" },
        ],
        sequence: batchSeq("verify"),
      },
    },
    {
      id: "ZP1-step-5",
      kind: "result",
      label: "알림 확인",
      trigger: "auto",
      duration: 1500,
      screenId: "ZP1-5",
      description: "운영자가 배치별 정상·주의·위험 알림 이력을 확인합니다",
      processView: {
        kind: "audit",
        description: "검증 결과가 알림 이력에 기록됩니다. 정상·주의·위험 배지로 구분되며, 실패 시 ZP-4 흐름이 트리거됩니다.",
        logs: [
          "[batch] BTC #18: Proof 생성 완료",
          "[submit] BTC #18: 온체인 제출 완료",
          "[verify] BTC #18: 검증 PASS",
          "[alert] BTC #18: 정상 처리",
          "[alert] USDT #16: 제출 지연 (retry 2회)",
          "[alert] BNB #14: 서명 검증 실패 → 조사 필요",
        ],
        summary: [
          { label: "BTC #18", value: "정상", tone: "ok" },
          { label: "USDT #16", value: "주의 (재시도)", tone: "warn" },
          { label: "BNB #14", value: "위험", tone: "bad" },
        ],
        sequence: batchSeq("done"),
      },
    },
    {
      id: "ZP1-step-6",
      kind: "result",
      label: "대시보드 업데이트",
      trigger: "auto",
      duration: 1500,
      screenId: "ZP1-6",
      description: "공개 대시보드와 운영 대시보드가 최신 검증 결과로 갱신됩니다",
      processView: {
        kind: "overview",
        description: "공개 대시보드는 자산별 준비율과 최근 검증 이력을 표시합니다. 운영 대시보드는 배치별 처리 상태와 retry 이력을 보여줍니다.",
        cards: [
          { label: "BTC 준비율", value: "101.9%", tone: "ok" },
          { label: "최근 검증 배치", value: "BTC #18", tone: "ok" },
          { label: "USDT #16", value: "재시도 중", tone: "warn" },
        ],
      },
    },
  ],
};
