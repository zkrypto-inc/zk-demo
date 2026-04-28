// API response types — 백엔드가 실제로 반환할 형태
// 화면 표현용 타입(scenarios/types.ts)과 분리

export type ApiStatus = "active" | "inactive" | "pending" | "processing" | "completed" | "failed";

export type ApiWallet = {
  wallet_id: string;
  tenant_id: string;
  address: string;
  key_id: string;
  type: "custody" | "issuer" | "personal";
  status: ApiStatus;
  created_at: string;
};

export type ApiKeygenSession = {
  keygen_id: string;
  wallet_id: string;
  progress: number;
  node_statuses: { node_id: string; status: "completed" | "processing" | "waiting" }[];
  status: "processing" | "completed" | "failed";
};

export type ApiSignSession = {
  sign_id: string;
  wallet_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  raw_signature?: string;
  created_at: string;
};

export type ApiApprover = {
  user_id: string;
  name: string;
  role: string;
  status: "approved" | "pending" | "waiting";
  approved_at?: string;
  note?: string;
};

export type ApiApprovalRequest = {
  request_id: string;
  tenant_id: string;
  kind: "custody_withdraw" | "mint" | "burn" | "liquidity";
  approvers: ApiApprover[];
  overall_status: "pending" | "approved" | "rejected";
  created_at: string;
};

export type ApiAuditEvent = {
  timestamp: string;
  actor: string;
  action: string;
  result: "ok" | "fail";
  metadata?: Record<string, string>;
};

export type ApiAuditLog = {
  audit_event_id: string;
  request_id: string;
  tenant_id: string;
  events: ApiAuditEvent[];
};
