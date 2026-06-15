import type { ScenarioId } from "@/scenarios/types";

export const adapterCaseIds = ["FU-1", "FU-2", "FU-3", "CU-1", "CU-2", "CU-3", "IS-1", "FS-2", "FS-3"] as const;

export type AdapterCaseId = (typeof adapterCaseIds)[number];
export type AdapterValueSource = "wallet-api" | "mock" | "adapter" | string;

export type AdapterStepState = {
  stepId: string;
  label: string;
  status: string;
  provider: string;
  callKey: string;
  values: Record<string, unknown>;
  sources: Record<string, AdapterValueSource>;
  completedAt: string;
};

export type AdapterCaseState = {
  runId: string;
  caseId: AdapterCaseId;
  status: string;
  startedAt: string;
  completedAt: string | null;
  steps: Record<string, AdapterStepState>;
  uiSteps?: AdapterStepState[];
  result: Record<string, unknown>;
  sources: Record<string, AdapterValueSource>;
  errors: { message: string; errorCode?: string; provider?: string }[];
};

export type AdapterRunResponse = {
  ok: boolean;
  state: AdapterCaseState;
};

export class AdapterClientError extends Error {
  status: number;
  errorCode?: string;
  details?: unknown;

  constructor(message: string, options: { status: number; errorCode?: string; details?: unknown }) {
    super(message);
    this.name = "AdapterClientError";
    this.status = options.status;
    this.errorCode = options.errorCode;
    this.details = options.details;
  }
}

export function isAdapterCase(scenarioId: ScenarioId): scenarioId is AdapterCaseId {
  return (adapterCaseIds as readonly string[]).includes(scenarioId);
}

export function getAdapterBaseUrl() {
  const configured = import.meta.env.VITE_ZKWALLET_ADAPTER_BASE_URL?.trim();
  return stripTrailingSlash(configured || "/wallet/adapter");
}

export async function runAdapterCase(caseId: AdapterCaseId, inputs: Record<string, unknown> = {}) {
  const res = await fetch(`${getAdapterBaseUrl()}/cases/${encodeURIComponent(caseId)}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inputs }),
  });
  const payload = await parseJsonSafely(res);

  if (!res.ok || payload?.ok === false) {
    throw new AdapterClientError(payload?.message || `Adapter case run failed: ${caseId}`, {
      status: res.status,
      errorCode: payload?.errorCode,
      details: payload,
    });
  }

  return payload as AdapterRunResponse;
}

async function parseJsonSafely(res: Response) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new AdapterClientError("Adapter response is not valid JSON.", {
      status: res.status,
      errorCode: "INVALID_ADAPTER_RESPONSE",
      details: text,
    });
  }
}

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}
