import type { Scenario, SequenceContext } from "@/scenarios/types";

const seqPrivacyRequest: SequenceContext = {
  actors: ["감사자 Dashboard", "zkTransfer SDK"],
  activeEdge: { from: "감사자 Dashboard", to: "zkTransfer SDK", label: "txHash 기준 복호화 요청", tone: "accent" },
  pastEdges: [],
};

const seqPrivacyDecrypt: SequenceContext = {
  actors: ["감사자 Dashboard", "zkTransfer SDK"],
  activeEdge: { from: "zkTransfer SDK", to: "감사자 Dashboard", label: "복호화 결과 반환", tone: "ok" },
  pastEdges: [
    { from: "감사자 Dashboard", to: "zkTransfer SDK", label: "txHash 기준 복호화 요청" },
  ],
};

const seqCbdcRequest: SequenceContext = {
  actors: ["감사자 Dashboard", "zkTransfer SDK"],
  activeEdge: { from: "감사자 Dashboard", to: "zkTransfer SDK", label: "txHash · program id 기준 감사 조회", tone: "accent" },
  pastEdges: [],
};

const seqCbdcDecrypt: SequenceContext = {
  actors: ["감사자 Dashboard", "zkTransfer SDK"],
  activeEdge: { from: "zkTransfer SDK", to: "감사자 Dashboard", label: "가맹점·금액·정책 결과 복호화", tone: "ok" },
  pastEdges: [
    { from: "감사자 Dashboard", to: "zkTransfer SDK", label: "txHash · program id 기준 감사 조회" },
  ],
};

export const scenarioZTA: Scenario = {
  id: "ZT-A",
  groupId: "zt-auditor",
  planningId: "ZT-A",
  name: "zkTransfer 감사",
  shortName: "감사",
  actor: "감사자",
  actorType: "web",
  mode: "auditor",
  summary: "프라이버시 전송과 CBDC·바우처 결제의 비공개 거래를 감사자가 txHash로 조회하고 감사 키로 복호화하는 통합 감사 흐름입니다.",
  screens: [
    {
      id: "ZTA-1",
      layout: "dashboard",
      actorType: "web",
      webContext: { menuItem: "감사", pageTitle: "프라이버시 전송 감사", host: "audit.zktransfer.io" },
      actor: "감사자 / 웹 대시보드",
      title: "프라이버시 전송 — 감사 요청 전",
      subtitle: "감사 전에는 발신자·금액이 마스킹됩니다",
      status: "감사 전",
      sections: [
        {
          title: "조회 결과 (감사 전)",
          fields: [
            { label: "txHash", value: "0x4e9a...d721" },
            { label: "From", value: "발신 주소 비공개" },
            { label: "To", value: "컨트랙트 주소 / 보호 계정" },
            { label: "Amount", value: "0.0 USDC (마스킹)", tone: "neutral" },
          ],
        },
      ],
      actions: [{ id: "request-audit-privacy", label: "감사 요청", tone: "accent" }],
    },
    {
      id: "ZTA-2",
      layout: "result",
      actorType: "web",
      webContext: { menuItem: "감사", pageTitle: "프라이버시 전송 감사", host: "audit.zktransfer.io" },
      actor: "감사자 / 웹 대시보드",
      title: "프라이버시 전송 — 감사 완료",
      subtitle: "감사 키로 실제 발신자·금액이 복호화됩니다",
      status: "감사 완료",
      sections: [
        {
          title: "복호화 결과",
          fields: [
            { label: "txHash", value: "0x4e9a...d721" },
            { label: "실제 수신자", value: "0xA1b2...C3d4", tone: "ok" },
            { label: "실제 금액", value: "100 USDC", tone: "ok" },
            { label: "상태", value: "decrypt_success", tone: "ok" },
            { label: "감사자 ID", value: "auditor_001" },
            { label: "조회 시각", value: "2026-05-11 10:00" },
          ],
        },
      ],
      actions: [{ id: "next-cbdc", label: "CBDC 감사 진행", tone: "accent" }],
    },
    {
      id: "ZTA-3",
      layout: "dashboard",
      actorType: "web",
      webContext: { menuItem: "감사", pageTitle: "CBDC·바우처 결제 감사", host: "audit.zktransfer.io" },
      actor: "감사자 / 웹 대시보드",
      title: "CBDC·바우처 결제 — 감사 요청 전",
      subtitle: "감사 전에는 가맹점·금액·정책 결과가 마스킹됩니다",
      status: "감사 전",
      sections: [
        {
          title: "조회 결과 (감사 전)",
          fields: [
            { label: "txHash", value: "0x7b1c...e829" },
            { label: "program_id", value: "voucher_001" },
            { label: "merchant_id", value: "비공개", tone: "neutral" },
            { label: "결제 금액", value: "0 KRW (마스킹)", tone: "neutral" },
            { label: "정책 결과", value: "비공개", tone: "neutral" },
          ],
        },
      ],
      actions: [{ id: "request-audit-cbdc", label: "감사 요청", tone: "accent" }],
    },
    {
      id: "ZTA-4",
      layout: "result",
      actorType: "web",
      webContext: { menuItem: "감사", pageTitle: "CBDC·바우처 결제 감사", host: "audit.zktransfer.io" },
      actor: "감사자 / 웹 대시보드",
      title: "CBDC·바우처 결제 — 감사 완료",
      subtitle: "감사 키로 가맹점·금액·정책 결과가 복호화됩니다",
      status: "감사 완료",
      sections: [
        {
          title: "복호화 결과",
          fields: [
            { label: "감사 케이스 ID", value: "audit_001" },
            { label: "txHash", value: "0x7b1c...e829" },
            { label: "프로그램 ID", value: "voucher_001" },
            { label: "가맹점 ID", value: "m_123" },
            { label: "복호화 금액", value: "7,000 KRW", tone: "ok" },
            { label: "정책 결과", value: "통과 (passed)", tone: "ok" },
            { label: "상태", value: "decrypt_success", tone: "ok" },
          ],
        },
      ],
    },
  ],
  steps: [
    {
      id: "ZTA-step-1",
      kind: "user-action",
      label: "프라이버시 전송 — 감사 요청",
      trigger: "user",
      ctaLabel: "감사 요청",
      screenId: "ZTA-1",
      description: "감사자가 프라이버시 전송 건의 txHash를 조회합니다 — 감사 전에는 발신자·금액이 마스킹됩니다",
      processView: {
        kind: "overview",
        description: "감사 요청 전에는 발신자·금액이 마스킹된 상태로 표시됩니다. 감사자가 txHash를 검색해 복호화를 요청합니다.",
        cards: [
          { label: "From", value: "비공개", tone: "neutral" },
          { label: "Amount", value: "0.0 USDC (마스킹)", tone: "neutral" },
          { label: "감사 상태", value: "요청 전", tone: "warn" },
        ],
        sequence: seqPrivacyRequest,
      },
    },
    {
      id: "ZTA-step-2",
      kind: "result",
      label: "프라이버시 전송 — 감사 완료",
      trigger: "auto",
      duration: 1500,
      screenId: "ZTA-2",
      description: "감사 키로 실제 수신자 주소와 금액이 복호화됩니다",
      processView: {
        kind: "audit",
        description: "감사자가 감사 키를 사용해 비공개 전송 내역을 복호화합니다. 실제 수신자와 금액이 복호화 결과로 제공됩니다.",
        logs: [
          "[audit] txHash: 0x4e9a...d721 조회",
          "[audit] 감사 권한 확인: auditor_001",
          "[audit] 감사 키 유효성 검증 완료",
          "[decrypt] 수신자: 0xA1b2...C3d4",
          "[decrypt] 금액: 100 USDC",
          "[audit] 상태: decrypt_success",
        ],
        summary: [
          { label: "실제 수신자", value: "0xA1b2...C3d4", tone: "ok" },
          { label: "실제 금액", value: "100 USDC", tone: "ok" },
          { label: "감사자 ID", value: "auditor_001" },
        ],
        sequence: seqPrivacyDecrypt,
      },
    },
    {
      id: "ZTA-step-3",
      kind: "user-action",
      label: "CBDC·바우처 결제 — 감사 요청",
      trigger: "user",
      ctaLabel: "감사 요청",
      screenId: "ZTA-3",
      description: "감사자가 CBDC·바우처 결제 건의 txHash를 조회합니다 — 감사 전에는 가맹점·금액·정책 결과가 마스킹됩니다",
      processView: {
        kind: "overview",
        description: "감사 요청 전에는 가맹점·금액·정책 결과가 비공개 상태로 표시됩니다. 감사자가 txHash·program id를 검색해 복호화를 요청합니다.",
        cards: [
          { label: "merchant_id", value: "비공개", tone: "neutral" },
          { label: "결제 금액", value: "0 KRW (마스킹)", tone: "neutral" },
          { label: "감사 상태", value: "요청 전", tone: "warn" },
        ],
        sequence: seqCbdcRequest,
      },
    },
    {
      id: "ZTA-step-4",
      kind: "result",
      label: "CBDC·바우처 결제 — 감사 완료",
      trigger: "auto",
      duration: 1500,
      screenId: "ZTA-4",
      description: "감사 키로 가맹점·금액·정책 통과 여부가 복호화됩니다",
      processView: {
        kind: "audit",
        description: "감사자가 txHash·program id로 결제 건을 조회하고 감사 키로 가맹점·금액·정책 결과를 복호화합니다.",
        logs: [
          "[audit] txHash: 0x7b1c...e829 조회",
          "[audit] program_id: voucher_001",
          "[audit] merchant_id: m_123",
          "[audit] 감사 권한 확인: auditor_001",
          "[decrypt] 금액: 7,000 KRW",
          "[policy] 결과: passed",
          "[audit] 상태: decrypt_success",
        ],
        summary: [
          { label: "복호화 금액", value: "7,000 KRW", tone: "ok" },
          { label: "정책 결과", value: "passed", tone: "ok" },
          { label: "상태", value: "decrypt_success", tone: "ok" },
        ],
        sequence: seqCbdcDecrypt,
      },
    },
  ],
};
