import type { ApiAuditLog } from "@/api/types";
import { mockIds } from "@/mocks/ids";

export interface AuditService {
  getAuditLog(params: {
    requestId?: string;
    walletId?: string;
    tenantId?: string;
  }): Promise<ApiAuditLog>;
}

export const auditService: AuditService = {
  async getAuditLog({ requestId }) {
    await delay(200);
    return {
      audit_event_id: mockIds.auditEventId,
      request_id: requestId ?? mockIds.requestId,
      tenant_id: mockIds.tenantId,
      events: [
        { timestamp: "2026-05-01T09:00:00Z", actor: "플랫폼 운영자", action: "request.created", result: "ok" },
        { timestamp: "2026-05-01T09:05:00Z", actor: "유현아", action: "approval.approved", result: "ok" },
        { timestamp: "2026-05-01T09:10:00Z", actor: "박지훈", action: "approval.approved", result: "ok" },
        { timestamp: "2026-05-01T09:11:00Z", actor: "Wallet Service", action: "sign.completed", result: "ok", metadata: { sign_id: mockIds.signId } },
        { timestamp: "2026-05-01T09:12:00Z", actor: "SC Lifecycle", action: "tx.broadcast", result: "ok" },
      ],
    };
  },
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
