export type Tone = "neutral" | "accent" | "ok" | "bad" | "warn";
export type ProductId = "zkwallet" | "zktransfer" | "zkpasskey" | "zkpol";
export type ScenarioMode = "platform" | "custody" | "issuer" | "personal" | "policy-payment" | "zt-user" | "auditor" | "risk" | "incident";
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
  | "risk"
  | "incident";
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
  | "ZT-1"
  | "ZT-5"
  | "ZT-A"
  | "ZP-1"
  | "ZP-4";

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
};

export type Section = {
  title: string;
  fields: Field[];
  table?: DataTable;
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
  | "cta";        // 단일 CTA — 앱 진입 화면 (모바일)

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
  sections: Section[];
  actions?: ScreenAction[];
  footer?: string;
  ledger?: LedgerScreenData;
  auditTable?: AuditTableData;
};

// --- Process panel types ---

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
      sequence?: SequenceContext;
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
};
