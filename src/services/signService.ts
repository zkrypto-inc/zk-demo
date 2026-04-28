import type { ApiSignSession } from "@/api/types";
import { mockIds } from "@/mocks/ids";
import { mockHashes } from "@/mocks/hashes";

export interface SignService {
  requestSign(params: {
    walletId: string;
    payload: string;
    requestId?: string;
  }): Promise<ApiSignSession>;
  getSignStatus(signId: string): Promise<ApiSignSession>;
}

export const signService: SignService = {
  async requestSign({ walletId: _walletId }) {
    await delay(400);
    return {
      sign_id: mockIds.signId,
      wallet_id: mockIds.custodyWalletId,
      status: "processing",
      created_at: new Date().toISOString(),
    };
  },

  async getSignStatus(_signId) {
    await delay(200);
    return {
      sign_id: mockIds.signId,
      wallet_id: mockIds.custodyWalletId,
      status: "completed",
      raw_signature: mockHashes.publicKey,
      created_at: new Date().toISOString(),
    };
  },
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
