import type { ApiKeygenSession, ApiWallet } from "@/api/types";
import { mockIds } from "@/mocks/ids";
import { mockHashes } from "@/mocks/hashes";

// 인터페이스: 백엔드 연결 시 이 시그니처를 유지하면서 구현체만 교체
export interface WalletService {
  createWallet(params: {
    tenantId: string;
    type: "custody" | "issuer" | "personal";
    adminIds?: string[];
  }): Promise<ApiWallet>;
  getWallet(walletId: string): Promise<ApiWallet>;
  getKeygenStatus(keygenId: string): Promise<ApiKeygenSession>;
}

// Mock 구현 (현재 사용 중)
export const walletService: WalletService = {
  async createWallet({ type }) {
    await delay(300);
    const idMap = {
      custody: mockIds.custodyWalletId,
      issuer: mockIds.issuerWalletId,
      personal: mockIds.walletId,
    };
    const addressMap = {
      custody: mockHashes.custodyAddress,
      issuer: mockHashes.issuerAddress,
      personal: mockHashes.userAddress,
    };
    return {
      wallet_id: idMap[type],
      tenant_id: mockIds.tenantId,
      address: addressMap[type],
      key_id: mockIds.keyId,
      type,
      status: "active",
      created_at: new Date().toISOString(),
    };
  },

  async getWallet(walletId) {
    await delay(200);
    return {
      wallet_id: walletId,
      tenant_id: mockIds.tenantId,
      address: mockHashes.custodyAddress,
      key_id: mockIds.keyId,
      type: "custody",
      status: "active",
      created_at: "2026-01-15T09:00:00Z",
    };
  },

  async getKeygenStatus(_keygenId) {
    await delay(200);
    return {
      keygen_id: `keygen_${mockIds.keyId}`,
      wallet_id: mockIds.custodyWalletId,
      progress: 100,
      node_statuses: [
        { node_id: "node_1", status: "completed" },
        { node_id: "node_2", status: "completed" },
        { node_id: "node_3", status: "completed" },
      ],
      status: "completed",
    };
  },
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
