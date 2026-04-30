export type Tone = "neutral" | "accent" | "ok" | "bad" | "warn";
export type ScenarioMode = "platform" | "custody" | "issuer" | "personal";
export type ActorGroupId =
  | "personal"
  | "custody"
  | "issuer"
  | "platform"
  | "policy-payment"
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
  | "FU-2";

// --- User screen types ---

export type Field = {
  label: string;
  value: string;
  tone?: Tone;
};

export type Section = {
  title: string;
  fields: Field[];
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
  | "result"      // 완료 — 성공 아이콘 + 핵심 값 강조
  | "dashboard"   // 정보 개요 — 카드 그리드
  | "cta";        // 단일 CTA — 앱 진입 화면 (모바일)

export type UserScreen = {
  id: string;
  layout: ScreenLayout;
  actor?: string;
  title: string;
  subtitle: string;
  status: string;
  sections: Section[];
  actions?: ScreenAction[];
  footer?: string;
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
      cardsPosition?: "aboveSequence" | "belowSequence";
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
