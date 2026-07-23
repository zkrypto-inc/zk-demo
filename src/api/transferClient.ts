// zkTransfer 데모 어댑터(:9090) 호출 클라이언트.
// 프론트는 /transfer/api 로 부르고, vite/web-server가 어댑터로 프록시(prefix strip)한다.

export type SetupResponse = {
  sessionId: string;
  contractAddress: string;
  tokenAddress: string;
  senderEna: string;
  receiverEna: string;
  senderEoa: string;
  receiverEoa: string;
};

export type TransferResponse = {
  sessionId: string;
  txHash: string;
  elapsedMs: number;
  ciphertext: string | null;
  amount: string;
};

export type TxView = {
  txHash: string;
  blockNumber: string;
  status: string;
  to: string;
  from: string;
  ciphertext: string | null;
};

export type TransferRecord = {
  txHash: string;
  elapsedMs: number;
  ciphertext: string | null;
  fromEna: string;
  toEna: string;
  amount: string;
};

export type StatusResponse = {
  ok: boolean;
  ready: boolean;
  coreApiReachable: boolean;
  chainReachable: boolean;
  contractConfigured: boolean;
  tokenConfigured: boolean;
  contractAddress: string;
  tokenAddress: string;
};

export class TransferClientError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, options: { status: number; details?: unknown }) {
    super(message);
    this.name = "TransferClientError";
    this.status = options.status;
    this.details = options.details;
  }
}

export function getTransferBaseUrl() {
  const configured = import.meta.env.VITE_ZKTRANSFER_ADAPTER_BASE_URL?.trim();
  return stripTrailingSlash(configured || "/transfer/api");
}

/** 계정 준비 (진입 시 1회). sessionId 미지정 시 어댑터가 새로 발급. */
export async function setupTransfer(sessionId?: string): Promise<SetupResponse> {
  return post<SetupResponse>("/demo/setup", sessionId ? { sessionId } : {});
}

/** A→B 비공개 전송 (제출 시). 증명 생성 → 서명·제출 → 결과. */
export async function runTransfer(sessionId: string): Promise<TransferResponse> {
  return post<TransferResponse>("/demo/transfer", { sessionId });
}

/** 온체인 겉보기 조회. */
export async function getTransferTx(hash: string): Promise<TxView> {
  return get<TxView>(`/demo/tx/${encodeURIComponent(hash)}`);
}

/** 세션의 최근 비공개 전송 목록 (ZT-A용). */
export async function getSessionTransfers(sessionId: string): Promise<TransferRecord[]> {
  return get<TransferRecord[]>(`/demo/transfers/${encodeURIComponent(sessionId)}`);
}

/** 준비 상태. */
export async function getTransferStatus(): Promise<StatusResponse> {
  return get<StatusResponse>("/demo/status");
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${getTransferBaseUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handle<T>(res, path);
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${getTransferBaseUrl()}${path}`);
  return handle<T>(res, path);
}

async function handle<T>(res: Response, path: string): Promise<T> {
  const text = await res.text();
  let payload: unknown = undefined;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      throw new TransferClientError(`Adapter response is not valid JSON: ${path}`, {
        status: res.status,
        details: text,
      });
    }
  }
  if (!res.ok || (payload as { ok?: boolean })?.ok === false) {
    const message = (payload as { error?: string })?.error || `Transfer adapter request failed: ${path}`;
    throw new TransferClientError(message, { status: res.status, details: payload });
  }
  return payload as T;
}

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}
