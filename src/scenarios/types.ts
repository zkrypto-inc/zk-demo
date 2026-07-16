export type Tone = "neutral" | "accent" | "ok" | "bad" | "warn";
export type ProductId = "zkwallet" | "zktransfer" | "zkpasskey" | "zkpol" | "zkvoting";
export type ScenarioMode = "platform" | "custody" | "issuer" | "personal" | "policy-payment" | "zt-user" | "auditor" | "risk" | "incident" | "voter" | "operator";
export type ActorGroupId =
  | "personal"
  | "custody"
  | "issuer"
  | "platform"
  | "policy-payment"
  | "zt-user"
  | "zt-cbdc-user"
  | "zt-auditor"
  | "auditor"
  | "passkey-user"
  | "risk"
  | "stablecoin-risk"
  | "incident"
  | "zv-voter"
  | "zv-operator";
export type Surface = "web" | "app" | "mixed";
export type ActorType = "mobile" | "web";
export type StepKind = "user-action" | "system-processing" | "result";
export type StepPhase = "preview" | "processing" | "result";

export type ScenarioId =
  | "PO-1"
  | "CU-1"
  | "CU-2"
  | "CU-3"
  | "IS-1"
  | "FS-2"
  | "FS-3"
  | "FS-4"
  | "FU-1"
  | "FU-2"
  | "FU-3"
  | "ZK-1"
  | "ZK-2"
  | "ZT-1"
  | "ZT-5"
  | "ZT-A"
  | "ZP-1"
  | "ZP-4"
  | "ZP-D"
  | "ZPS-1"
  | "ZPS-4"
  | "ZPS-D"
  | "ZV-1"
  | "ZO-1";

// --- User screen types ---

export type Field = {
  label: string;
  value: string;
  tone?: Tone;
  picker?: string;
  options?: string[];
};

export type DataTableColumn = {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  width?: string;
};

export type DataTable = {
  columns: DataTableColumn[];
  rows: Record<string, string>[];
  wrap?: boolean;
};

export type Section = {
  title: string;
  fields: Field[];
  table?: DataTable;
  variant?: "rows" | "cards";
};

export type ScreenAction = {
  id: string;
  label: string;
  tone?: Tone;
};

export type ScreenLayout =
  | "form"        // 입력 폼 — 필드를 input 박스 스타일로 렌더링
  | "approval"    // 승인 대기 — 승인자 카드 + 상태 배지
  | "processing"  // 처리 중 — 스피너 + 상태 메시지
  | "scanner"     // QR/코드 스캔 — 모바일 카메라 프레임
  | "result"      // 완료 — 성공 아이콘 + 핵심 값 강조
  | "dashboard"   // 정보 개요 — 카드 그리드
  | "ledger"      // 원장식 표 — 내부 트랜잭션 + 행별 액션
  | "audit-table" // 감사 표 — 거래 행 + 체크박스/복호화 결과
  | "recap"       // 정리 페이지 — 좌우 결과 패널 2장
  | "cta"         // 단일 CTA — 앱 진입 화면 (모바일)
  | "vote"        // 투표 선택 — 후보 라디오 카드 목록 (zkVoting)
  | "tally";      // 개표 — 후보별 득표 막대 + 검증 카드 (zkVoting)

export type WebContext = {
  menuItem: string;
  pageTitle: string;
  host: string;
};

export type LedgerScreenData = {
  banner?: { tone: Tone; title: string; subtitle?: string };
  caseId?: string;
  rows: LedgerRow[];
  actionLog?: string[];
};


export type AuditTableRow = {
  id: string;
  type: string;
  txHash: string;
  from: string;
  to: string;
  amount: string;
  decrypted?: {
    from: string;
    to: string;
    amount: string;
    status?: string;
    extras?: { label: string; value: string }[];
  };
};

export type AuditTableData = {
  mode: "request" | "complete";
  rows: AuditTableRow[];
};

export type RecapRow = {
  label: string;
  value: string;
  mono?: boolean;
  ok?: boolean;
};

export type RecapPanel = {
  title: string;
  subtitle?: string;
  groupTitle: string;
  previewScreen?: { scenarioId: ScenarioId; screenId: string };
  rows: RecapRow[];
  cta?: {
    label: string;
    target:
      | { type: "scenario"; scenarioId: ScenarioId; stepIndex?: number }
      | { type: "actor"; actorId: ActorGroupId };
    tone?: Tone;
  };
};

export type RecapData = {
  eyebrow?: string;
  heading: string;
  description?: string;
  badges?: string[];
  panels: RecapPanel[];
};

export type UserScreen = {
  id: string;
  layout: ScreenLayout;
  actor?: string;
  actorType?: ActorType;
  webContext?: WebContext;
  title: string;
  animateProcessing?: boolean;
  subtitle?: string;
  status?: string;
  progressBoxes?: {
    total: number;
    completed: number;
    cycle?: number[];
    label?: string;
  };
  sections: Section[];
  actions?: ScreenAction[];
  footer?: string;
  ledger?: LedgerScreenData;
  auditTable?: AuditTableData;
  recap?: RecapData;
  vote?: VoteData;
  tally?: TallyData;
};

// --- zkVoting screen data ---

export type VoteOption = {
  mark: string;        // 기호 번호 표기 (예: "기호 1")
  name: string;        // 후보명
  note?: string;       // 부가 설명 (예: "현 사무국장")
  selected?: boolean;  // 선택된 후보 강조
};

export type VoteData = {
  question: string;    // 안건 (예: "이사장 선출")
  hint?: string;       // 보조 안내 (예: "후보 1인을 선택하세요 · 비밀투표")
  options: VoteOption[];
};

export type TallyRow = {
  mark: string;        // 기호 번호 표기
  votes: string;       // 득표 표기 (예: "612표")
  pct: number;         // 막대 채움 비율 (0~100)
};

export type TallyData = {
  caption?: string;             // 집계 요약 (예: "총 투표 1,105 (예시)")
  rows: TallyRow[];
  verification?: {              // 개표 무결성 검증 카드 (선택)
    title: string;
    lines: string[];
  };
  badges?: { label: string; tone?: Tone }[];
};

// --- Process panel types ---

export type CompareTable = {
  title?: string;
  columns: string[];
  rows: string[][];
  pillColumn?: number; // 해당 컬럼(index)의 셀을 알약(pill) 배지로 렌더 (zkVoting 구분)
};

export type StatusCard = {
  label: string;
  value: string;
  tone?: Tone;
  detail?: string;
};

export type ApproverCard = {
  name: string;
  role: string;
  status: "approved" | "pending" | "waiting";
  note?: string;
};

export type SequenceEdge = {
  from: string;
  to: string;
  label: string;
  sublabel?: string;
  tone?: Tone;
};

export type SequenceContext = {
  actors: string[];
  activeEdge: SequenceEdge;
  pastEdges?: SequenceEdge[];
  extraActiveEdges?: SequenceEdge[];
};

export type ProcessView =
  | {
      kind: "sequence";
      actors: string[];
      activeEdge: SequenceEdge;
      pastEdges?: SequenceEdge[];
      description?: string;
    }
  | {
      kind: "overview";
      description: string;
      cards?: StatusCard[];
      compareTable?: CompareTable;
      sequence?: SequenceContext;
      diagram?: "merkle-roll"; // 선거인 명부 머클트리 (zkVoting)
    }
  | {
      kind: "approval";
      description: string;
      approvers: ApproverCard[];
    }
  | {
      kind: "keygen";
      description: string;
      progress: number;
      showProgress?: boolean;
      progressLabel?: string;
      showProgressValue?: boolean;
      nodes: StatusCard[];
      sequence?: SequenceContext;
    }
  | {
      kind: "artifact";
      description: string;
      items: StatusCard[];
      diagram?: "account-abstraction";
      sequence?: SequenceContext;
    }
  | {
      kind: "audit";
      description: string;
      logs: string[];
      summary?: StatusCard[];
      sequence?: SequenceContext;
    }
  | {
      kind: "merkle";
      phase: "generating" | "complete";
      sequence?: SequenceContext;
    }
  | {
      kind: "formula";
      description?: string;
      formula: string;
      cards: FormulaCard[];
      sequence?: SequenceContext;
    }
  | {
      kind: "liability-proof";
      description?: string;
      formula: string;
      rows: LiabilityProofRow[];
      footnote?: string;
      sequence?: SequenceContext;
    }
  | {
      kind: "step-list";
      description?: string;
      title: string;
      progress: number;
      progressLabel?: string;
      steps: ProcessStep[];
      sequence?: SequenceContext;
    }
  | {
      kind: "ledger";
      description?: string;
      banner?: { tone: Tone; title: string; subtitle?: string };
      caseId?: string;
      rows: LedgerRow[];
      actionLog?: string[];
      sequence?: SequenceContext;
    };

export type FormulaCard = {
  label: string;
  value: string;
  sublabel?: string;
  tone?: Tone;
  role?: "old" | "delta" | "new" | "proof";
};

export type LiabilityProofRow = {
  user: string;
  oldValue: string;
  delta: string;
  newValue: string;
};

export type ProcessStep = {
  label: string;
  value: string;
  state: "done" | "active" | "wait";
};

export type LedgerRow = {
  call: "CALL" | "DELEGATECALL" | "STATICCALL";
  indent?: number;
  from: string;
  to: string;
  method: string;
  amount?: string;
  gasLimit?: string;
  duplicate?: boolean;
  status?: "normal" | "blocked";
  blockable?: boolean;
};

// --- Scenario step ---

export type ScenarioStep = {
  id: string;
  kind: StepKind;
  phase?: StepPhase;
  label: string;
  trigger: "user" | "auto";
  duration?: number;
  ctaLabel?: string;
  screenId: string;
  processView: ProcessView;
  description: string;
  // 진행 단계에 표시할 처리 주체 (예: "스마트폰 web", "서버", "운영자 web · 서버").
  lane?: string;
  // zkPoL 라이브 스텝: 화면 슬롯에 목업 대신 실데이터 컴팩트 콘솔을 렌더한다.
  // incident = 위반 감지 + 지급 차단 종합(배치 로그 + 사고 + 차단 카운터).
  liveView?: "ingest" | "verify" | "detect" | "blocked" | "console" | "incident";
};

// --- Scenario ---

export type Scenario = {
  id: ScenarioId;
  groupId?: ActorGroupId;
  planningId?: string;
  displayId?: string;
  surface?: Surface;
  name: string;
  shortName: string;
  actor: string;
  actorType: ActorType;
  mode: ScenarioMode;
  summary: string;
  screens: UserScreen[];
  steps: ScenarioStep[];
  // 시나리오 하단 안내 노트 (zkVoting: 데모 데이터 안내·처리 분담·비밀투표·출처 등).
  note?: { label: string; text: string }[];
};
