import type { LedgerRow, Scenario, SequenceContext } from "@/scenarios/types";

const seqActors = ["거래소 원장", "zkPoRL 서버", "운영 시스템 (Sidecar)"] as const;

const anomalySeq: SequenceContext = {
  actors: [...seqActors],
  activeEdge: { from: "zkPoRL 서버", to: "운영 시스템 (Sidecar)", label: "지급 차단 명령", tone: "bad" },
  pastEdges: [
    { from: "거래소 원장", to: "zkPoRL 서버", label: "이상 이벤트 유입" },
    { from: "zkPoRL 서버", to: "zkPoRL 서버", label: "증명 생성 실패", tone: "bad" },
  ],
};

const ledgerRowsBase: LedgerRow[] = [
  {
    call: "CALL",
    from: "exchange_ledger",
    to: "zkPoRL_router",
    method: "submitBatchEvent",
    amount: "0",
  },
  {
    call: "DELEGATECALL",
    indent: 1,
    from: "zkPoRL_router",
    to: "BatchCircuit",
    method: "appendEvent",
    amount: "0",
  },
  {
    call: "CALL",
    from: "user_acc_001",
    to: "exchange_ledger",
    method: "withdraw",
    amount: "0.5 BTC",
    duplicate: true,
    blockable: true,
  },
  {
    call: "CALL",
    from: "user_acc_001",
    to: "exchange_ledger",
    method: "withdraw",
    amount: "0.5 BTC",
    duplicate: true,
    blockable: true,
  },
  {
    call: "STATICCALL",
    indent: 1,
    from: "exchange_ledger",
    to: "BatchCircuit",
    method: "verifySum",
    amount: "0",
  },
  {
    call: "CALL",
    from: "user_acc_002",
    to: "exchange_ledger",
    method: "deposit",
    amount: "1.2 BTC",
  },
];

const blockedLedgerRows: LedgerRow[] = ledgerRowsBase.map((row) =>
  row.duplicate
    ? { ...row, status: "blocked", blockable: false }
    : row,
);

export const scenarioZP4: Scenario = {
  id: "ZP-4",
  groupId: "risk",
  planningId: "ZP-4",
  name: "거래소 이상징후 차단",
  shortName: "이상징후 차단",
  actor: "보안관제 / 사고대응",
  actorType: "web",
  mode: "incident",
  summary: "이상 원장 이벤트가 유입되어 증명 생성이 차단되면, 담당자가 케이스를 확인하고 지급 차단 조치를 실행하는 흐름입니다.",
  screens: [
    {
      id: "ZP4-1",
      layout: "result",
      actor: "개인 사용자 / 거래소 앱",
      title: "정상 출금 처리 완료",
      subtitle: "사용자에게는 정상 처리 결과로 표시됩니다",
      status: "처리 완료",
      sections: [
        {
          title: "출금 결과",
          fields: [
            { label: "요청 ID", value: "req_001" },
            { label: "자산", value: "BTC" },
            { label: "수량", value: "0.5 BTC" },
            { label: "상태", value: "출금 요청 접수", tone: "ok" },
          ],
        },
      ],
    },
    {
      id: "ZP4-2",
      layout: "ledger",
      actor: "보안관제 / 관제 웹 대시보드",
      title: "내부 트랜잭션",
      sections: [],
      ledger: {
        rows: ledgerRowsBase,
      },
    },
    {
      id: "ZP4-3",
      layout: "ledger",
      actor: "보안관제 / 관제 웹 대시보드",
      title: "내부 트랜잭션",
      sections: [],
      ledger: {
        rows: ledgerRowsBase,
      },
    },
    {
      id: "ZP4-4",
      layout: "ledger",
      actor: "보안관제 / 관제 웹 대시보드",
      title: "내부 트랜잭션",
      sections: [],
      actions: [{ id: "block", label: "지급 차단", tone: "bad" }],
      ledger: {
        rows: ledgerRowsBase,
      },
    },
    {
      id: "ZP4-5",
      layout: "ledger",
      actor: "운영 시스템 / 감사자",
      title: "내부 트랜잭션",
      sections: [],
      ledger: {
        rows: blockedLedgerRows,
      },
    },
  ],
  steps: [
    {
      id: "ZP4-step-1",
      kind: "user-action",
      label: "정상 처리 화면",
      trigger: "user",
      ctaLabel: "다음 단계",
      screenId: "ZP4-1",
      description: "사용자에게는 정상 출금 접수로 표시됩니다. 내부적으로는 이상 이벤트가 유입됩니다",
      processView: {
        kind: "overview",
        description: "사용자 화면에는 정상 출금 접수로 표시됩니다. 이상 이벤트는 내부적으로 유입되지만 사용자에게는 노출되지 않습니다.",
        cards: [
          { label: "사용자 표시 상태", value: "출금 요청 접수", tone: "ok" },
          { label: "내부 상태", value: "이상 이벤트 유입 중", tone: "warn" },
        ],
      },
    },
    {
      id: "ZP4-step-2",
      kind: "system-processing",
      label: "이상 후보 감지",
      trigger: "auto",
      duration: 2000,
      screenId: "ZP4-2",
      description: "원장 트랜잭션 목록에서 중복 거래 후보가 감지됩니다",
      processView: {
        kind: "sequence",
        actors: [...seqActors],
        activeEdge: { from: "거래소 원장", to: "zkPoRL 서버", label: "이상 이벤트 유입", tone: "bad" },
        description: "원장에서 동일 거래 두 건이 zkPoRL 서버로 유입됩니다. 운영자 대시보드에 중복 후보가 강조됩니다.",
      },
    },
    {
      id: "ZP4-step-3",
      kind: "system-processing",
      label: "증명 생성 실패",
      trigger: "auto",
      duration: 2500,
      screenId: "ZP4-3",
      description: "합계 불일치로 증명 생성이 차단되고 케이스가 등록됩니다",
      processView: {
        kind: "audit",
        description: "동일 출금 호출이 두 번 잡혀 시작 잔고 + 변동 ≠ 종료 잔고. 증명이 차단되고 자동 케이스가 생성됩니다.",
        logs: [
          "[batch] batch_20260511_1005_BTC 시작",
          "[circuit] 기대 종료 잔고: 12,510 BTC",
          "[circuit] 실제 종료 잔고: 12,509.5 BTC",
          "[circuit] 차이: -0.5 BTC → 정합성 실패",
          "[alert] 증명 차단 — 케이스 등록: case_001",
        ],
        summary: [
          { label: "배치 ID", value: "batch_20260511_1005_BTC" },
          { label: "차이", value: "-0.5 BTC", tone: "bad" },
          { label: "상태", value: "증명 차단 (proof blocked)", tone: "bad" },
        ],
      },
    },
    {
      id: "ZP4-step-4",
      kind: "user-action",
      label: "케이스 확인 및 차단 선택",
      trigger: "user",
      ctaLabel: "지급 차단",
      screenId: "ZP4-4",
      description: "담당자가 중복 행을 확인하고 지급 차단 버튼을 클릭합니다",
      processView: {
        kind: "approval",
        description: "담당자가 중복 거래 후보 2건을 확인합니다. 표 옆의 '지급 차단' 버튼을 클릭하면 운영 시스템에 차단 명령이 전달됩니다.",
        approvers: [
          { name: "risk_ops_01", role: "보안관제 담당자", status: "pending", note: "중복 거래 검토 중" },
          { name: "audit_log", role: "감사 기록 시스템", status: "waiting", note: "조치 후 자동 기록" },
        ],
      },
    },
    {
      id: "ZP4-step-5",
      kind: "result",
      label: "차단 조치 완료",
      trigger: "auto",
      duration: 2000,
      screenId: "ZP4-5",
      description: "운영 시스템이 지급 차단을 반영하고 감사 이력이 기록됩니다",
      processView: {
        kind: "artifact",
        description: "증명 결과가 실제 운영 통제로 이어집니다. 운영 시스템이 지급 차단을 적용하고 감사 이력이 저장됩니다.",
        items: [
          { label: "조치 유형", value: "지급 차단 (payout_blocked)", tone: "bad" },
          { label: "운영 시스템 반영", value: "적용 완료 (applied)", tone: "ok" },
          { label: "차단 계정", value: "acc_001" },
          { label: "감사 케이스", value: "audit_case_001", tone: "ok" },
          { label: "감사 로그", value: "저장 완료", tone: "ok" },
        ],
        sequence: anomalySeq,
      },
    },
  ],
};
