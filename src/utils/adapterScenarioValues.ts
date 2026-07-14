import type { AdapterCaseId, AdapterCaseState } from "@/api/adapterClient";
import type { ProcessView, Scenario } from "@/scenarios/types";

type ScenarioValues = Record<string, string>;

export function collectScenarioDefaults(scenario: Scenario): ScenarioValues {
  const values: ScenarioValues = {};

  for (const screen of scenario.screens) {
    for (const section of screen.sections) {
      for (const field of section.fields) {
        if (!values[field.label]) values[field.label] = field.value;
      }
    }

    for (const panel of screen.recap?.panels ?? []) {
      for (const row of panel.rows) {
        if (!values[row.label]) values[row.label] = row.value;
      }
    }
  }

  for (const step of scenario.steps) {
    collectProcessViewValues(step.processView, values);
  }

  return values;
}

export function buildAdapterCaseInputs(caseId: AdapterCaseId, values: ScenarioValues): Record<string, unknown> {
  const get = (...labels: string[]) => {
    for (const label of labels) {
      const value = values[label];
      if (value !== undefined && value.trim() !== "") return value;
    }
    return undefined;
  };

  switch (caseId) {
    case "FU-2":
      return {
        amount: get("금액"),
        recipient: get("받는 주소", "목적지 주소", "목적지"),
      };
    case "CU-2":
      return {
        asset: normalizeAsset(get("자산", "자산 유형")),
        depositAmount: get("입금 수량", "금액"),
      };
    case "CU-3":
      return {
        amount: get("출금 수량", "금액"),
        destination: get("목적지 주소", "목적지", "받는 주소"),
      };
    case "FS-2":
      return {
        amount: get("발행 수량", "금액"),
        symbol: normalizeAsset(get("코인 심볼", "자산")),
        reserveAmount: get("준비금 총액"),
        reserveInfo: get("준비금 구성"),
      };
    case "FS-3":
      return {
        burnAmount: get("소각 수량", "금액"),
        symbol: normalizeAsset(get("코인 심볼", "자산")),
      };
    default:
      return {};
  }
}

export function mapAdapterStateToScenarioValues(state: AdapterCaseState): ScenarioValues {
  const result = state.result ?? {};
  const values: ScenarioValues = {};
  const add = createAdder(values);

  add("Adapter Run ID", state.runId);
  add("Adapter 상태", translateStatus(state.status));
  add("Wallet ID", result.walletId);
  add("Key ID", result.keyId);
  add("Sign ID", result.signId);
  add("요청 ID", result.requestId);
  add("Tx Hash", result.txHash);
  add("Raw Signature", shorten(result.signedRawTransaction));
  add("지갑 주소", result.address);
  add("상태", translateStatus(result.status ?? result.broadcastStatus ?? result.mintResult ?? result.burnResult ?? result.ledgerStatus));
  add("승인 상태", translateStatus(result.approvalStatus));
  add("플랫폼 승인", translateStatus(result.approvalStatus));
  add("서명 상태", translateStatus(result.signId ? "completed" : undefined));
  add("전송 상태", translateStatus(result.broadcastStatus));
  add("제출 상태", translateStatus(result.broadcastStatus));
  add("Policy 버전", result.policyVersion);
  add("코인 심볼", result.symbol ?? result.asset);

  switch (state.caseId) {
    case "FU-1":
      add("지갑 상태", translateStatus(result.status));
      add("키 생성", result.keyId ? "완료" : undefined);
      break;
    case "FU-2":
      add("거래 요청 ID", result.txIntentId);
      add("서명 요청 상태", result.signId ? "완료" : undefined);
      add("Tx 준비", result.txHash ? "완료" : undefined);
      // 온체인 KRWC 민팅·이동 (chain live일 때만 채워짐, mock 시 undefined→목업 유지)
      add("KRWC 컨트랙트", result.krwToken);
      add("민팅 Tx", result.mintTxHash);
      add("전송 수량", result.krwAmount ? `${formatKrw(result.krwAmount)} KRWC` : undefined);
      add("보낸 잔액", result.senderKrwBalance ? `${formatKrw(result.senderKrwBalance)} KRWC` : undefined);
      add("받은 잔액", result.recipientKrwBalance ? `${formatKrw(result.recipientKrwBalance)} KRWC` : undefined);
      break;
    case "CU-1":
      add("Custody Wallet ID", result.walletId);
      add("계정 연결", result.walletId ? "완료" : undefined);
      add("지갑 상태", translateStatus(result.status));
      break;
    case "CU-2":
      add("입금 수량", result.amount);
      add("자산", result.asset);
      add("Tx 전송", translateStatus(result.broadcastStatus));
      break;
    case "CU-3":
      add("출금 수량", result.amount);
      add("목적지 주소", result.destination);
      add("목적지", result.destination);
      add("브로드캐스트", translateStatus(result.broadcastStatus));
      break;
    case "IS-1":
      add("Issuer Wallet ID", result.walletId);
      add("발행사 주소", result.address);
      add("관리자 연결", result.walletId ? "3명 활성" : undefined);
      break;
    case "FS-2":
      add("발행 수량", result.amount);
      add("준비금 총액", result.reserveAmount);
      add("준비금 구성", translateComposition(result.composition));
      add("승인 정책", translateStatus(result.approvalStatus));
      break;
    case "FS-3":
      add("소각 수량", result.burnAmount);
      add("소각 후 잔량", result.circulatingAfterBurn);
      add("승인 정책", translateStatus(result.approvalStatus));
      break;
    case "FU-3":
      add("MPC 키 생성", result.keyId ? "완료" : undefined);
      add("개인키 보관", result.keyId ? "단일 서버 보관 없음" : undefined);
      add("감사 이벤트", Array.isArray(result.auditEvents) ? `${result.auditEvents.length} events` : undefined);
      break;
  }

  return values;
}

function collectProcessViewValues(view: ProcessView, values: ScenarioValues) {
  const collect = (items?: { label: string; value: string }[]) => {
    for (const item of items ?? []) {
      if (!values[item.label]) values[item.label] = item.value;
    }
  };

  switch (view.kind) {
    case "overview":
      collect(view.cards);
      break;
    case "keygen":
      collect(view.nodes);
      break;
    case "artifact":
      collect(view.items);
      break;
    case "audit":
      collect(view.summary);
      break;
    case "formula":
      collect(view.cards);
      break;
  }
}

function createAdder(values: ScenarioValues) {
  return (label: string, rawValue: unknown) => {
    const value = stringifyValue(rawValue);
    if (value !== undefined) values[label] = value;
  };
}

function stringifyValue(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  }
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return shorten(JSON.stringify(value));
}

function translateStatus(value: unknown) {
  const status = stringifyValue(value);
  if (!status) return undefined;
  const normalized = status.toLowerCase();
  const labels: Record<string, string> = {
    active: "사용 가능",
    applied: "입금 완료",
    approved: "승인 완료",
    completed: "완료",
    failed: "실패",
    processing: "처리 중",
    requested: "요청됨",
    submitted: "제출 완료",
    validated: "검증 완료",
  };
  return labels[normalized] ?? status;
}

function translateComposition(value: unknown) {
  const composition = stringifyValue(value);
  if (!composition) return undefined;
  return composition
    .replace(/cash/gi, "현금")
    .replace(/bond/gi, "채권");
}

function normalizeAsset(value: string | undefined) {
  if (!value) return undefined;
  if (value.includes("KRW")) return "KRW";
  return value;
}

// KRWC는 decimals=0이라 스케일링 없이 천 단위 구분만 적용한다.
function formatKrw(value: unknown): string {
  const raw = stringifyValue(value);
  if (!raw) return "";
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return raw;
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function shorten(value: unknown, maxLength = 72) {
  const text = stringifyValue(value);
  if (!text || text.length <= maxLength) return text;
  const head = Math.max(24, Math.floor(maxLength * 0.55));
  const tail = Math.max(12, maxLength - head - 3);
  return `${text.slice(0, head)}...${text.slice(-tail)}`;
}
