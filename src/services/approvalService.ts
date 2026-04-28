import type { ApiApprovalRequest } from "@/api/types";
import { mockIds } from "@/mocks/ids";

export interface ApprovalService {
  getApprovalStatus(requestId: string): Promise<ApiApprovalRequest>;
  submitApproval(params: {
    requestId: string;
    approverId: string;
    decision: "approve" | "reject";
    note?: string;
  }): Promise<ApiApprovalRequest>;
}

const MOCK_APPROVERS = [
  { user_id: "user_001", name: "유현아", role: "준법감시인 (1차)", status: "approved" as const, approved_at: new Date().toISOString() },
  { user_id: "user_002", name: "박지훈", role: "리스크관리 (2차)", status: "approved" as const, approved_at: new Date().toISOString() },
];

export const approvalService: ApprovalService = {
  async getApprovalStatus(requestId) {
    await delay(200);
    return {
      request_id: requestId,
      tenant_id: mockIds.tenantId,
      kind: "mint",
      approvers: MOCK_APPROVERS,
      overall_status: "approved",
      created_at: new Date().toISOString(),
    };
  },

  async submitApproval({ requestId, approverId: _approverId, decision: _decision }) {
    await delay(300);
    return {
      request_id: requestId,
      tenant_id: mockIds.tenantId,
      kind: "mint",
      approvers: MOCK_APPROVERS,
      overall_status: "approved",
      created_at: new Date().toISOString(),
    };
  },
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
