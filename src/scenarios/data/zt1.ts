import type { Scenario, SequenceContext } from "@/scenarios/types";

const seq1: SequenceContext = {
  actors: ["플랫폼 관리자 Web", "고객 플랫폼 / SC Lifecycle"],
  activeEdge: { from: "플랫폼 관리자 Web", to: "고객 플랫폼 / SC Lifecycle", label: "개인정보보호 기반 송금 정책 설정", tone: "accent" },
  pastEdges: [],
};

const seq2: SequenceContext = {
  actors: ["개인 사용자 App", "스테이블코인 플랫폼"],
  activeEdge: { from: "개인 사용자 App", to: "스테이블코인 플랫폼", label: "기밀 송금 요청", tone: "accent" },
  pastEdges: [],
};

const seq3: SequenceContext = {
  actors: ["zkTransfer SDK", "Core API"],
  activeEdge: { from: "zkTransfer SDK", to: "Core API", label: "proof 생성 요청", tone: "accent" },
  pastEdges: [],
};

const seq4: SequenceContext = {
  actors: ["개인 사용자 App", "플랫폼", "Blockchain"],
  activeEdge: { from: "Blockchain", to: "플랫폼", label: "txHash 반환", tone: "ok" },
  pastEdges: [
    { from: "플랫폼", to: "개인 사용자 App", label: "최종 서명 요청" },
    { from: "개인 사용자 App", to: "플랫폼", label: "서명된 tx 전달" },
    { from: "플랫폼", to: "Blockchain", label: "tx 제출" },
  ],
};

const seq5: SequenceContext = {
  actors: ["감사자 Dashboard", "zkTransfer SDK"],
  activeEdge: { from: "감사자 Dashboard", to: "zkTransfer SDK", label: "txHash 기준 복호화 요청", tone: "accent" },
  pastEdges: [],
};

const seq6: SequenceContext = {
  actors: ["감사자 Dashboard", "zkTransfer SDK"],
  activeEdge: { from: "zkTransfer SDK", to: "감사자 Dashboard", label: "복호화 결과 반환", tone: "ok" },
  pastEdges: [
    { from: "감사자 Dashboard", to: "zkTransfer SDK", label: "txHash 기준 감사 결과 요청" },
  ],
};

export const scenarioZT1: Scenario = {
  id: "ZT-1",
  groupId: "zt-user",
  planningId: "ZT-1",
  name: "스테이블코인 프라이버시 전송",
  shortName: "프라이버시 전송",
  actor: "개인 사용자",
  actorType: "mobile",
  mode: "zt-user",
  summary: "발신자 주소와 전송 금액을 ZK Proof로 숨긴 채 스테이블코인을 전송하고, 감사자만 감사 키로 내역을 복호화할 수 있는 흐름입니다.",
  screens: [
    {
      id: "ZT1-1",
      layout: "form",
      actor: "정책 운영자 / 웹 관리자 콘솔",
      title: "프라이버시 전송 정책 설정",
      subtitle: "적용 자산과 서비스 유형, 한도를 지정합니다",
      status: "설정 중",
      sections: [
        {
          title: "정책 기본 정보",
          fields: [
            { label: "적용 자산", value: "USDC, USDT" },
            { label: "적용 서비스", value: "P2P 송금, 결제, 정산" },
            { label: "서비스 유형", value: "스테이블코인 전송" },
            { label: "월 한도", value: "1억 KRW" },
          ],
        },
      ],
      actions: [{ id: "save-policy", label: "정책 저장 및 활성화", tone: "accent" }],
    },
    {
      id: "ZT1-2",
      layout: "form",
      actor: "개인 사용자 / 모바일 앱",
      title: "송금 요청",
      subtitle: "수신자와 금액을 확인하고 전송을 요청하세요",
      status: "입력 중",
      sections: [
        {
          title: "수신자 정보",
          fields: [
            { label: "수신자 별칭", value: "Alice" },
            { label: "수신 주소", value: "0xA1b2...C3d4 (ENA)", picker: "주소록" },
          ],
        },
        {
          title: "전송 정보",
          fields: [
            { label: "자산", value: "USDC" },
            { label: "전송 금액", value: "100 USDC" },
            { label: "전송 방식", value: "ENA 기반 비공개 전송" },
            { label: "공개 계정 잔고", value: "320 USDC" },
            { label: "보호 계정 잔고", value: "120 USDC" },
          ],
        },
      ],
      actions: [{ id: "send-request", label: "전송 요청", tone: "accent" }],
    },
    {
      id: "ZT1-3",
      layout: "processing",
      actor: "시스템 자동 처리",
      title: "ZK Proof 생성 중",
      subtitle: "ZK 회로를 실행해 Proof를 생성합니다",
      status: "처리 중",
      animateProcessing: true,
      sections: [
        {
          title: "처리 단계",
          fields: [
            { label: "cm 선택", value: "진행 중...", tone: "accent" },
            { label: "Proof 입력 준비", value: "대기 중", tone: "neutral" },
            { label: "ZK Proof 생성", value: "대기 중", tone: "neutral" },
            { label: "cm_new 생성", value: "대기 중", tone: "neutral" },
          ],
        },
      ],
    },
    {
      id: "ZT1-4",
      layout: "result",
      actor: "개인 사용자 / 모바일 앱",
      title: "전송 완료",
      subtitle: "zkTransfer가 성공적으로 처리됐습니다",
      status: "완료",
      sections: [
        {
          title: "전송 결과",
          fields: [
            { label: "txHash", value: "0x4e9a...d721", tone: "accent" },
            { label: "자산", value: "USDC" },
            { label: "전송 금액", value: "100 USDC" },
            { label: "수신자", value: "0xA1b2...C3d4" },
            { label: "상태", value: "confirmed", tone: "ok" },
          ],
        },
      ],
    },
    {
      id: "ZT1-5",
      layout: "dashboard",
      actor: "감사자 / 웹 대시보드",
      title: "감사 요청 전 — 비공개 상태",
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
      actions: [{ id: "request-audit", label: "감사 요청", tone: "accent" }],
    },
    {
      id: "ZT1-6",
      layout: "result",
      actor: "감사자 / 웹 대시보드",
      title: "감사 완료 — 복호화 결과",
      subtitle: "감사 키로 실제 발신자와 금액이 복호화됩니다",
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
    },
  ],
  steps: [
    {
      id: "ZT1-step-1",
      kind: "user-action",
      label: "정책 설정",
      trigger: "user",
      ctaLabel: "정책 저장 및 활성화",
      screenId: "ZT1-1",
      description: "관리자가 프라이버시 전송 정책을 설정합니다",
      processView: {
        kind: "overview",
        description: "플랫폼 관리자가 적용 자산, 서비스 유형, 월 한도를 지정해 정책을 활성화합니다.",
        cards: [
          { label: "적용 자산", value: "USDC, USDT" },
          { label: "월 한도", value: "1억 KRW" },
          { label: "상태", value: "활성화 대기", tone: "warn" },
        ],
        sequence: seq1,
      },
    },
    {
      id: "ZT1-step-2",
      kind: "user-action",
      label: "송금 요청",
      trigger: "user",
      ctaLabel: "전송 요청",
      screenId: "ZT1-2",
      description: "사용자가 수신자와 금액을 입력하고 전송을 요청합니다",
      processView: {
        kind: "sequence",
        actors: seq2.actors,
        activeEdge: seq2.activeEdge,
        pastEdges: seq2.pastEdges,
        description: "사용자가 주소록에서 수신자를 선택하고 전송 금액을 입력해 기밀 송금을 요청합니다.",
      },
    },
    {
      id: "ZT1-step-3",
      kind: "system-processing",
      label: "ZK Proof 생성",
      trigger: "auto",
      duration: 4000,
      screenId: "ZT1-3",
      description: "내 비공개 잔고를 확인하고 발신자·금액을 숨긴 영지식 증명을 생성합니다",
      processView: {
        kind: "merkle",
        phase: "generating",
        sequence: seq3,
      },
    },
    {
      id: "ZT1-step-4",
      kind: "result",
      label: "전송 완료",
      trigger: "auto",
      duration: 1500,
      screenId: "ZT1-4",
      description: "전송이 완료되고 수신자의 새 비공개 잔고가 반영됩니다",
      processView: {
        kind: "merkle",
        phase: "complete",
        sequence: seq4,
      },
    },
    {
      id: "ZT1-step-5",
      kind: "user-action",
      label: "감사 요청",
      trigger: "user",
      ctaLabel: "감사 요청",
      screenId: "ZT1-5",
      description: "감사자가 txHash를 조회합니다 — 감사 전에는 발신자·금액이 마스킹됩니다",
      processView: {
        kind: "overview",
        description: "감사 요청 전에는 발신자 주소가 비공개이며 금액은 0.0으로 표시됩니다. 감사자가 txHash를 검색해 감사를 요청합니다.",
        cards: [
          { label: "From", value: "비공개", tone: "neutral" },
          { label: "Amount", value: "0.0 USDC (마스킹)", tone: "neutral" },
          { label: "감사 상태", value: "요청 전", tone: "warn" },
        ],
        sequence: seq5,
      },
    },
    {
      id: "ZT1-step-6",
      kind: "result",
      label: "감사 완료",
      trigger: "auto",
      duration: 1500,
      screenId: "ZT1-6",
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
        sequence: seq6,
      },
    },
  ],
};
