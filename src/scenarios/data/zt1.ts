import type { Scenario, SequenceContext } from "@/scenarios/types";

const seq1: SequenceContext = {
  actors: ["플랫폼 관리자", "스테이블코인 플랫폼"],
  activeEdge: { from: "플랫폼 관리자", to: "스테이블코인 플랫폼", label: "개인정보보호 기반 송금 정책 설정", tone: "accent" },
  pastEdges: [],
};

const seq2: SequenceContext = {
  actors: ["개인 사용자 App", "스테이블코인 플랫폼"],
  activeEdge: { from: "개인 사용자 App", to: "스테이블코인 플랫폼", label: "기밀 송금 요청", tone: "accent" },
  pastEdges: [],
};

const seqQr: SequenceContext = {
  actors: ["수신자 QR", "개인 사용자 App", "스테이블코인 플랫폼"],
  activeEdge: { from: "수신자 QR", to: "개인 사용자 App", label: "수신 주소 스캔", tone: "accent" },
  pastEdges: [],
};

const seq3: SequenceContext = {
  actors: ["개인 사용자 App", "스테이블코인 플랫폼", "zkTransfer SDK"],
  activeEdge: { from: "스테이블코인 플랫폼", to: "zkTransfer SDK", label: "SDK 호출", tone: "accent" },
  pastEdges: [
    { from: "개인 사용자 App", to: "스테이블코인 플랫폼", label: "스테이블코인 개인정보보호 송금 요청" },
  ],
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

export const scenarioZT1: Scenario = {
  id: "ZT-1",
  groupId: "zt-user",
  planningId: "ZT-1",
  name: "프라이버시 전송",
  shortName: "프라이버시 전송",
  actor: "개인 사용자",
  actorType: "mobile",
  mode: "zt-user",
  summary: "발신자 주소와 전송 금액을 ZK Proof로 숨긴 채 스테이블코인을 전송하고, 감사자만 감사 키로 내역을 복호화할 수 있는 흐름입니다.",
  screens: [
    {
      id: "ZT1-1",
      layout: "form",
      actorType: "web",
      webContext: { menuItem: "설정", pageTitle: "프라이버시 전송 정책", host: "admin.zktransfer.io" },
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
      layout: "scanner",
      actor: "개인 사용자 / 모바일 앱",
      title: "수신자 QR 스캔",
      subtitle: "수신자의 QR 코드를 화면 중앙에 맞춰주세요",
      status: "스캔 중",
      footer: "주소 인식 중...",
      sections: [
        {
          title: "스캔 상태",
          fields: [
            { label: "대상", value: "수신자 QR" },
            { label: "상태", value: "주소 인식 중", tone: "accent" },
          ],
        },
      ],
      actions: [{ id: "scan-qr", label: "QR 인식", tone: "accent" }],
    },
    {
      id: "ZT1-3",
      layout: "scanner",
      actor: "개인 사용자 / 모바일 앱",
      title: "QR 인식 완료",
      subtitle: "수신 주소를 송금 요청에 자동 반영합니다",
      status: "인식 완료",
      footer: "주소 인식 완료",
      sections: [
        {
          title: "인식 결과",
          fields: [
            { label: "수신자 별칭", value: "Alice", tone: "ok" },
            { label: "수신 주소", value: "0xA1b2...C3d4 (ENA)", tone: "ok" },
          ],
        },
      ],
    },
    {
      id: "ZT1-4",
      layout: "form",
      actor: "개인 사용자 / 모바일 앱",
      title: "송금 요청",
      subtitle: "QR에서 인식한 수신 주소와 금액을 확인하세요",
      status: "입력 중",
      sections: [
        {
          title: "수신자 정보",
          fields: [
            { label: "수신자 별칭", value: "Alice" },
            { label: "수신 주소", value: "0xA1b2...C3d4 (ENA)", picker: "QR 인식" },
          ],
        },
        {
          title: "전송 정보",
          fields: [
            { label: "입력 방식", value: "QR에서 자동 기입", tone: "ok" },
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
      id: "ZT1-5",
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
      id: "ZT1-6",
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
      label: "QR 스캔",
      trigger: "user",
      ctaLabel: "QR 인식",
      screenId: "ZT1-2",
      description: "사용자가 수신자의 QR 코드를 스캔해 송금 주소를 인식합니다",
      processView: {
        kind: "sequence",
        actors: seqQr.actors,
        activeEdge: seqQr.activeEdge,
        pastEdges: seqQr.pastEdges,
        description: "수신자의 QR 코드를 카메라 프레임에 맞추고 주소 인식이 완료될 때까지 대기합니다.",
      },
    },
    {
      id: "ZT1-step-3",
      kind: "system-processing",
      label: "주소 인식 완료",
      trigger: "auto",
      duration: 1200,
      screenId: "ZT1-3",
      description: "QR에서 인식한 수신 주소를 송금 요청 화면에 자동 기입합니다",
      processView: {
        kind: "artifact",
        description: "QR payload에서 수신자 별칭과 주소를 추출해 송금 요청 폼에 반영합니다. 사용자는 다음 단계에서 금액과 수신 주소를 확인합니다.",
        items: [
          { label: "수신자 별칭", value: "Alice", tone: "ok" },
          { label: "수신 주소", value: "0xA1b2...C3d4 (ENA)", tone: "ok" },
          { label: "입력 방식", value: "QR 자동 기입", tone: "accent" },
        ],
        sequence: {
          actors: seqQr.actors,
          activeEdge: { from: "개인 사용자 App", to: "개인 사용자 App", label: "주소 자동 기입", tone: "ok" },
          pastEdges: [seqQr.activeEdge],
        },
      },
    },
    {
      id: "ZT1-step-4",
      kind: "user-action",
      label: "송금 요청",
      trigger: "user",
      ctaLabel: "전송 요청",
      screenId: "ZT1-4",
      description: "사용자가 자동 기입된 수신 주소와 금액을 확인하고 스테이블코인 플랫폼에 개인정보보호 송금을 요청합니다",
      processView: {
        kind: "sequence",
        actors: seq2.actors,
        activeEdge: seq2.activeEdge,
        pastEdges: [],
        description: "QR에서 인식된 수신 주소가 송금 요청 폼에 자동 기입됩니다. 사용자는 금액과 잔고를 확인한 뒤 기밀 송금을 요청합니다.",
      },
    },
    {
      id: "ZT1-step-5",
      kind: "system-processing",
      label: "ZK Proof 생성",
      trigger: "auto",
      duration: 4000,
      screenId: "ZT1-5",
      description: "스테이블코인 플랫폼이 zkTransfer SDK를 호출하고, SDK가 발신자·금액을 숨긴 영지식 증명을 생성합니다",
      processView: {
        kind: "merkle",
        phase: "generating",
        sequence: seq3,
      },
    },
    {
      id: "ZT1-step-6",
      kind: "result",
      label: "전송 완료",
      trigger: "auto",
      duration: 1500,
      screenId: "ZT1-6",
      description: "전송이 완료되고 수신자의 새 비공개 잔고가 반영됩니다",
      processView: {
        kind: "merkle",
        phase: "complete",
        sequence: seq4,
      },
    },
  ],
};
