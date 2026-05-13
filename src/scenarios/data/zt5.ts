import type { Scenario, SequenceContext } from "@/scenarios/types";

// Shared actor layout for ZT-5 QR scan & request steps (steps 2-4)
const cbdcSendActors = ["가맹점 QR", "개인 사용자 App", "스테이블코인 플랫폼"] as const;

const seqQrCbdc: SequenceContext = {
  actors: [...cbdcSendActors],
  activeEdge: { from: "개인 사용자 App", to: "가맹점 QR", label: "QR 스캔", tone: "accent" },
  pastEdges: [],
};

const seqQrRecognized: SequenceContext = {
  actors: [...cbdcSendActors],
  activeEdge: { from: "개인 사용자 App", to: "개인 사용자 App", label: "결제 정보 인식 완료", tone: "ok" },
  pastEdges: [seqQrCbdc.activeEdge],
};

const seqPayRequest: SequenceContext = {
  actors: [...cbdcSendActors],
  activeEdge: { from: "개인 사용자 App", to: "스테이블코인 플랫폼", label: "결제 요청", tone: "accent" },
  pastEdges: [],
};

const proofActors = ["개인 사용자", "zkTransfer SDK", "Core API (ZK)"] as const;

const proofSeq = (past: boolean): SequenceContext => ({
  actors: [...proofActors],
  activeEdge: past
    ? { from: "zkTransfer SDK", to: "Core API (ZK)", label: "정책 통과 · cm_new 생성 완료", tone: "ok" }
    : { from: "zkTransfer SDK", to: "Core API (ZK)", label: "정책 검증 후 Proof 생성", tone: "accent" },
  pastEdges: past
    ? [
        { from: "개인 사용자", to: "zkTransfer SDK", label: "QR 결제 요청" },
        { from: "zkTransfer SDK", to: "Core API (ZK)", label: "정책 검증 후 Proof 생성" },
      ]
    : [{ from: "개인 사용자", to: "zkTransfer SDK", label: "QR 결제 요청" }],
});

export const scenarioZT5: Scenario = {
  id: "ZT-5",
  groupId: "zt-cbdc-user",
  planningId: "ZT-5",
  name: "CBDC·바우처 프라이버시 결제",
  shortName: "CBDC·바우처 결제",
  actor: "개인 사용자",
  actorType: "mobile",
  mode: "zt-user",
  summary: "지역 바우처·CBDC를 QR로 결제할 때 정책 조건(가맹점·업종·한도)을 검증한 후 ZK Proof 기반으로 결제 내역을 비공개 처리합니다.",
  screens: [
    {
      id: "ZT5-1",
      layout: "form",
      actorType: "web",
      webContext: { menuItem: "정책 설정", pageTitle: "QR 결제 정책", host: "admin.zktransfer.io" },
      actor: "정책 운영자 / 웹 관리자 콘솔",
      title: "QR 결제 정책 등록",
      subtitle: "참여 기관, 허용 업종, 한도를 설정합니다",
      status: "설정 중",
      sections: [
        {
          title: "프로그램 정보",
          fields: [
            { label: "프로그램명", value: "지역 바우처" },
            { label: "참여 기관", value: "경기도 / 운영사" },
            { label: "허용 업종", value: "대중교통, 일상 편의점" },
            { label: "월 한도", value: "300,000 KRW" },
          ],
        },
      ],
      actions: [{ id: "save-policy", label: "정책 저장 및 활성화", tone: "accent" }],
    },
    {
      id: "ZT5-2",
      layout: "scanner",
      actor: "개인 사용자 / 모바일 앱",
      title: "가맹점 QR 스캔",
      subtitle: "가맹점 QR 코드를 화면 중앙에 맞춰주세요",
      status: "스캔 중",
      footer: "결제 정보 인식 중...",
      sections: [
        {
          title: "스캔 상태",
          fields: [
            { label: "대상", value: "가맹점 QR" },
            { label: "상태", value: "결제 정보 인식 중", tone: "accent" },
          ],
        },
      ],
      actions: [{ id: "scan-qr", label: "QR 인식", tone: "accent" }],
    },
    {
      id: "ZT5-3",
      layout: "scanner",
      actor: "개인 사용자 / 모바일 앱",
      title: "QR 인식 완료",
      subtitle: "가맹점·결제 정보를 결제 요청에 자동 반영합니다",
      status: "인식 완료",
      footer: "결제 정보 인식 완료",
      sections: [
        {
          title: "인식 결과",
          fields: [
            { label: "가맹점명", value: "경기페이 가맹점", tone: "ok" },
            { label: "업종", value: "편의점 (convenience_store)", tone: "ok" },
            { label: "결제 금액", value: "7,000 KRW", tone: "ok" },
            { label: "프로그램", value: "voucher_001 (지역 바우처)", tone: "ok" },
          ],
        },
      ],
    },
    {
      id: "ZT5-4",
      layout: "form",
      actor: "개인 사용자 / 모바일 앱",
      title: "QR 결제 요청",
      subtitle: "QR에서 인식한 가맹점·결제 정보를 확인하세요",
      status: "결제 확인 중",
      sections: [
        {
          title: "가맹점 정보",
          fields: [
            { label: "가맹점 ID", value: "m_123" },
            { label: "가맹점명", value: "경기페이 가맹점" },
            { label: "업종", value: "편의점 (convenience_store)" },
          ],
        },
        {
          title: "결제 정보",
          fields: [
            { label: "입력 방식", value: "QR에서 자동 기입", tone: "ok" },
            { label: "결제 금액", value: "7,000 KRW" },
            { label: "프로그램", value: "voucher_001 (지역 바우처)" },
          ],
        },
      ],
      actions: [{ id: "pay", label: "결제 요청", tone: "accent" }],
    },
    {
      id: "ZT5-5",
      layout: "processing",
      actor: "개인 사용자 / 모바일 앱",
      title: "잔고 확인 및 전환",
      subtitle: "EOA·ENA 잔고를 확인하고 필요 시 전환합니다",
      status: "확인 중",
      sections: [
        {
          title: "계정 잔고",
          fields: [
            { label: "공개 계정 (EOA)", value: "50,000 KRW" },
            { label: "보호 계정 (ENA)", value: "10,000 KRW" },
            { label: "결제 필요 금액", value: "7,000 KRW" },
            { label: "전환 필요 여부", value: "불필요", tone: "ok" },
            { label: "상태", value: "결제 준비 완료", tone: "ok" },
          ],
        },
      ],
    },
    {
      id: "ZT5-6",
      layout: "processing",
      actor: "시스템 자동 처리",
      title: "정책 검증 및 zkTransfer 처리",
      subtitle: "가맹점·업종·한도를 검증 후 ZK Proof를 생성합니다",
      status: "처리 중",
      sections: [
        {
          title: "정책 검증",
          fields: [
            { label: "가맹점 허용 여부", value: "통과", tone: "ok" },
            { label: "업종 허용 여부", value: "통과 (편의점)", tone: "ok" },
            { label: "월 한도 잔여", value: "293,000 KRW", tone: "ok" },
          ],
        },
        {
          title: "ZK Proof 처리",
          fields: [
            { label: "정책 조건 통과", value: "완료", tone: "ok" },
            { label: "cm1 선택", value: "완료", tone: "ok" },
            { label: "ZK Proof 생성", value: "진행 중...", tone: "accent" },
            { label: "Tx 제출 준비", value: "대기 중", tone: "neutral" },
          ],
        },
      ],
    },
    {
      id: "ZT5-7",
      layout: "result",
      actor: "개인 사용자 / 모바일 앱",
      title: "결제 완료",
      subtitle: "zkTransfer로 결제가 비공개 처리됐습니다",
      status: "완료",
      sections: [
        {
          title: "결제 결과",
          fields: [
            { label: "txHash", value: "0x7b1c...e829", tone: "accent" },
            { label: "프로그램 ID", value: "voucher_001" },
            { label: "가맹점", value: "경기페이 가맹점 (m_123)" },
            { label: "결제 금액", value: "7,000 KRW" },
            { label: "월 한도 잔여", value: "293,000 KRW", tone: "ok" },
            { label: "상태", value: "confirmed", tone: "ok" },
          ],
        },
      ],
    },
  ],
  steps: [
    {
      id: "ZT5-step-1",
      kind: "user-action",
      label: "결제 정책 등록",
      trigger: "user",
      ctaLabel: "정책 저장 및 활성화",
      screenId: "ZT5-1",
      description: "정책 운영자가 QR 결제 프로그램 정책을 등록합니다",
      processView: {
        kind: "overview",
        description: "정책 운영자가 지역 바우처 프로그램의 참여 기관, 허용 업종, 월 한도를 설정합니다.",
        cards: [
          { label: "프로그램", value: "지역 바우처" },
          { label: "허용 업종", value: "대중교통, 편의점" },
          { label: "월 한도", value: "300,000 KRW" },
          { label: "상태", value: "활성화 대기", tone: "warn" },
        ],
      },
    },
    {
      id: "ZT5-step-2",
      kind: "user-action",
      label: "QR 스캔",
      trigger: "user",
      ctaLabel: "QR 인식",
      screenId: "ZT5-2",
      description: "사용자가 가맹점의 QR 코드를 스캔해 결제 정보를 인식합니다",
      processView: {
        kind: "sequence",
        actors: seqQrCbdc.actors,
        activeEdge: seqQrCbdc.activeEdge,
        pastEdges: seqQrCbdc.pastEdges,
        description: "가맹점 QR 코드를 카메라 프레임에 맞추고 결제 정보 인식이 완료될 때까지 대기합니다.",
      },
    },
    {
      id: "ZT5-step-3",
      kind: "system-processing",
      label: "결제 정보 인식 완료",
      trigger: "auto",
      duration: 1200,
      screenId: "ZT5-3",
      description: "QR에서 인식한 가맹점·금액·프로그램을 결제 요청 화면에 자동 기입합니다",
      processView: {
        kind: "artifact",
        description: "QR에서 가맹점·업종·결제 금액·프로그램 ID를 추출해 결제 요청 폼에 반영합니다.",
        items: [
          { label: "가맹점명", value: "경기페이 가맹점", tone: "ok" },
          { label: "업종", value: "편의점", tone: "ok" },
          { label: "결제 금액", value: "7,000 KRW", tone: "ok" },
          { label: "프로그램", value: "voucher_001", tone: "accent" },
        ],
        sequence: seqQrRecognized,
      },
    },
    {
      id: "ZT5-step-4",
      kind: "user-action",
      label: "결제 요청",
      trigger: "user",
      ctaLabel: "결제 요청",
      screenId: "ZT5-4",
      description: "사용자가 자동 기입된 가맹점·금액을 확인하고 결제를 요청합니다",
      processView: {
        kind: "overview",
        description: "QR에서 인식된 가맹점·금액이 결제 요청 폼에 자동 기입됩니다. 사용자가 내용을 확인하고 결제를 요청합니다.",
        cards: [
          { label: "결제 금액", value: "7,000 KRW" },
          { label: "가맹점", value: "경기페이 가맹점 (m_123)" },
          { label: "프로그램", value: "voucher_001" },
        ],
        sequence: seqPayRequest,
      },
    },
    {
      id: "ZT5-step-5",
      kind: "system-processing",
      label: "잔고 확인",
      trigger: "auto",
      duration: 1500,
      screenId: "ZT5-5",
      description: "앱이 EOA·ENA 잔고를 확인하고 필요 시 전환합니다",
      processView: {
        kind: "overview",
        description: "공개 계정(EOA)과 보호 계정(ENA) 잔고를 확인합니다. 결제 금액 충족 여부에 따라 전환 뱃지가 표시됩니다.",
        cards: [
          { label: "EOA 잔고", value: "50,000 KRW" },
          { label: "ENA 잔고", value: "10,000 KRW" },
          { label: "전환 필요", value: "불필요", tone: "ok" },
          { label: "결제 준비", value: "완료", tone: "ok" },
        ],
      },
    },
    {
      id: "ZT5-step-6",
      kind: "system-processing",
      label: "정책 검증 · Proof 생성",
      trigger: "auto",
      duration: 3000,
      screenId: "ZT5-6",
      description: "사용처 조건 검증 후 zkTransfer가 ZK Proof를 생성합니다",
      processView: {
        kind: "merkle",
        phase: "generating",
        sequence: proofSeq(false),
      },
    },
    {
      id: "ZT5-step-7",
      kind: "result",
      label: "결제 완료",
      trigger: "auto",
      duration: 1500,
      screenId: "ZT5-7",
      description: "결제가 완료되고 월 한도 잔여가 업데이트됩니다",
      processView: {
        kind: "merkle",
        phase: "complete",
        sequence: proofSeq(true),
      },
    },
  ],
};
