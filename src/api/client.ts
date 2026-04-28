// 백엔드 연결 시 여기만 교체하면 됩니다.
// BASE_URL과 getHeaders를 설정하면 모든 서비스가 실제 API를 사용합니다.

export const API_CONFIG = {
  baseUrl: "",        // 연결 시: "https://api.zkwallet.io/v1"
  tenantId: "",       // 연결 시: X-Tenant-Id 헤더 값
  token: "",          // 연결 시: Authorization Bearer 토큰
};

export function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (API_CONFIG.tenantId) headers["X-Tenant-Id"] = API_CONFIG.tenantId;
  if (API_CONFIG.token) headers["Authorization"] = `Bearer ${API_CONFIG.token}`;
  return headers;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_CONFIG.baseUrl}${path}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_CONFIG.baseUrl}${path}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}
