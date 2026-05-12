import type { AuditTableRow, Scenario, SequenceContext } from "@/scenarios/types";

const seqRequest: SequenceContext = {
  actors: ["감사자 Dashboard", "zkTransfer SDK"],
  activeEdge: { from: "감사자 Dashboard", to: "zkTransfer SDK", label: "복호화 요청", tone: "accent" },
  pastEdges: [],
};

const seqDecrypt: SequenceContext = {
  actors: ["감사자 Dashboard", "zkTransfer SDK"],
  activeEdge: { from: "zkTransfer SDK", to: "감사자 Dashboard", label: "복호화 결과 반환", tone: "ok" },
  pastEdges: [
    { from: "감사자 Dashboard", to: "zkTransfer SDK", label: "복호화 요청" },
  ],
};

const rowsMasked: AuditTableRow[] = [
  {
    id: "tx-privacy",
    type: "프라이버시 전송",
    txHash: "0x4e9a...d721",
    from: "비공개",
    to: "보호 계정",
    amount: "0.0 USDC",
  },
  {
    id: "tx-cbdc",
    type: "CBDC·바우처 결제",
    txHash: "0x7b1c...e829",
    from: "비공개",
    to: "비공개",
    amount: "0 KRW",
  },
];

const rowsDecrypted: AuditTableRow[] = [
  {
    id: "tx-privacy",
    type: "프라이버시 전송",
    txHash: "0x4e9a...d721",
    from: "비공개",
    to: "보호 계정",
    amount: "0.0 USDC",
    decrypted: {
      from: "0x9c8d...4a12",
      to: "0xA1b2...C3d4",
      amount: "100 USDC",
      status: "decrypt_success",
    },
  },
  {
    id: "tx-cbdc",
    type: "CBDC·바우처 결제",
    txHash: "0x7b1c...e829",
    from: "비공개",
    to: "비공개",
    amount: "0 KRW",
    decrypted: {
      from: "user_001",
      to: "m_123",
      amount: "7,000 KRW",
      status: "decrypt_success",
      extras: [
        { label: "program_id", value: "voucher_001" },
        { label: "정책 결과", value: "통과 (passed)" },
      ],
    },
  },
];

export const scenarioZTA: Scenario = {
  id: "ZT-A",
  groupId: "zt-auditor",
  planningId: "ZT-A",
  name: "zkTransfer 감사",
  shortName: "감사",
  actor: "감사자",
  actorType: "web",
  mode: "auditor",
  summary: "프라이버시 전송과 CBDC·바우처 결제의 비공개 거래를 감사자가 표에서 선택해 감사 키로 복호화하는 통합 감사 흐름입니다.",
  screens: [
    {
      id: "ZTA-1",
      layout: "audit-table",
      actorType: "web",
      webContext: { menuItem: "감사", pageTitle: "zkTransfer 감사", host: "audit.zktransfer.io" },
      actor: "감사자 / 웹 대시보드",
      title: "복호화 요청",
      subtitle: "복호화할 거래에 체크하고 '복호화'를 실행하세요",
      status: "감사 전",
      sections: [],
      auditTable: { mode: "request", rows: rowsMasked },
      actions: [{ id: "decrypt", label: "복호화", tone: "accent" }],
    },
    {
      id: "ZTA-2",
      layout: "audit-table",
      actorType: "web",
      webContext: { menuItem: "감사", pageTitle: "zkTransfer 감사", host: "audit.zktransfer.io" },
      actor: "감사자 / 웹 대시보드",
      title: "복호화 완료",
      subtitle: "감사 키로 두 거래의 실제 내역이 복호화됐습니다",
      status: "감사 완료",
      sections: [],
      auditTable: { mode: "complete", rows: rowsDecrypted },
    },
  ],
  steps: [
    {
      id: "ZTA-step-1",
      kind: "user-action",
      label: "복호화",
      trigger: "user",
      ctaLabel: "복호화",
      screenId: "ZTA-1",
      description: "감사자가 표에서 복호화할 거래를 선택해 감사 키로 복호화 요청을 보냅니다",
      processView: {
        kind: "overview",
        description: "감사 요청 전에는 발신자·금액·가맹점·정책 결과가 비공개 상태로 표시됩니다. 감사자가 복호화 대상 거래를 선택해 요청합니다.",
        cards: [
          { label: "프라이버시 전송", value: "마스킹", tone: "neutral" },
          { label: "CBDC·바우처 결제", value: "마스킹", tone: "neutral" },
          { label: "감사 상태", value: "요청 전", tone: "warn" },
        ],
        sequence: seqRequest,
      },
    },
    {
      id: "ZTA-step-2",
      kind: "result",
      label: "복호화 완료",
      trigger: "auto",
      duration: 1500,
      screenId: "ZTA-2",
      description: "감사 키로 두 거래(프라이버시 전송·CBDC 결제)의 실제 내역이 복호화됩니다",
      processView: {
        kind: "audit",
        description: "감사자가 감사 키를 사용해 두 비공개 거래를 복호화합니다. 실제 수신자·금액·가맹점·정책 결과가 복호화 결과로 제공됩니다.",
        logs: [
          "[audit] txHash: 0x4e9a...d721 (프라이버시 전송) 조회",
          "[audit] txHash: 0x7b1c...e829 (CBDC 결제) 조회",
          "[audit] 감사 권한 확인: auditor_001",
          "[audit] 감사 키 유효성 검증 완료",
          "[decrypt] 프라이버시 — 수신자: 0xA1b2...C3d4 / 금액: 100 USDC",
          "[decrypt] CBDC — merchant_id: m_123 / 금액: 7,000 KRW / 정책: passed",
          "[audit] 상태: decrypt_success",
        ],
        summary: [
          { label: "프라이버시 금액", value: "100 USDC", tone: "ok" },
          { label: "CBDC 금액", value: "7,000 KRW", tone: "ok" },
          { label: "감사자 ID", value: "auditor_001" },
        ],
        sequence: seqDecrypt,
      },
    },
  ],
};
