import type { Scenario } from "@/scenarios/types";
import { scenarioZP1 } from "./zp1";
import { scenarioZP4 } from "./zp4";

type RewriteRule = readonly [from: string, to: string];

const stablecoinRules: readonly RewriteRule[] = [
  ["ZP1-", "ZPS1-"],
  ["ZP4-", "ZPS4-"],
  ["batch_20260511_1005_BTC", "batch_20260511_1005_KRWSC"],
  ["batch_20260511_1010_ETH", "batch_20260511_1010_KUSD"],
  ["batch_20260511_1015_USDC", "batch_20260511_1015_GSC"],
  ["withdraw_20260511_001", "redeem_20260511_001"],
  ["withdrawal event", "redemption event"],
  ["duplicate withdrawal event", "duplicate redemption event"],
  ["payout_blocked", "redemption_blocked"],
  ["payout blocked", "redemption blocked"],
  ["12,499.5 BTC", "12,499,500 KRWSC"],
  ["12,500 BTC", "12,500,000 KRWSC"],
  ["12,499 BTC", "12,499,000 KRWSC"],
  ["1.2 ETH", "1,200 KUSD"],
  ["+0.5 BTC", "+500 KRWSC"],
  ["-1.0 BTC", "-1,000 KRWSC"],
  ["-0.5 BTC", "-500 KRWSC"],
  ["0.5 BTC", "500 KRWSC"],
  ["+0.5", "+500"],
  ["-0.5", "-500"],
  ["BTC 매수", "KRWSC 발행"],
  ["BTC 출금 요청", "KRWSC 상환 요청"],
  ["BTC 출금", "KRWSC 상환"],
  ["BTC 이벤트", "KRWSC 이벤트"],
  ["BTC", "KRWSC"],
  ["ETH", "KUSD"],
  ["USDC", "GSC"],
  ["거래소 고객 부채", "스테이블코인 발행 잔액"],
  ["고객 부채", "발행 잔액"],
  ["부채 증명", "발행잔액 증명"],
  ["liability", "issued balance"],
  ["거래소 앱", "스테이블코인 앱"],
  ["거래소 원장", "스테이블코인 원장"],
  ["거래소", "스테이블코인 플랫폼"],
  ["거래 체결 완료", "스테이블코인 거래 완료"],
  ["거래 체결", "스테이블코인 거래"],
  ["체결 내역", "거래 내역"],
  ["체결", "거래"],
  ["출금 요청 접수", "상환 요청 접수"],
  ["출금 요청", "상환 요청"],
  ["출금 이벤트", "상환 이벤트"],
  ["중복 출금", "중복 상환"],
  ["출금 변동값", "상환 변동값"],
  ["출금", "상환"],
  ["입금", "충전"],
  ["매수", "발행"],
  ["지급 차단", "상환 차단"],
  ["지급", "상환"],
  ["온체인 게시판", "온체인 검증 컨트랙트"],
  ["ops.zkpol.io", "stable.zkpol.io"],
];

function rewriteText(text: string) {
  return stablecoinRules.reduce((next, [from, to]) => next.split(from).join(to), text);
}

function rewriteValue<T>(value: T): T {
  if (typeof value === "string") {
    return rewriteText(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => rewriteValue(item)) as T;
  }

  if (value && typeof value === "object") {
    const next: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      next[key] = rewriteValue(item);
    }
    return next as T;
  }

  return value;
}

function makeStablecoinScenario(
  source: Scenario,
  overrides: Pick<Scenario, "id" | "groupId" | "planningId" | "name" | "summary">,
): Scenario {
  return {
    ...rewriteValue(source),
    ...overrides,
  };
}

export const scenarioZPS1: Scenario = makeStablecoinScenario(scenarioZP1, {
  id: "ZPS-1",
  groupId: "stablecoin-risk",
  planningId: "ZPS-1",
  name: "스테이블코인 상시 대사",
  summary:
    "스테이블코인 발행 잔액과 고객 잔액 합계를 개별 잔고 비공개 상태로 ZK Proof로 지속 증명하고, 대시보드로 정합성을 상시 확인합니다.",
});

export const scenarioZPS4: Scenario = makeStablecoinScenario(scenarioZP4, {
  id: "ZPS-4",
  groupId: "stablecoin-risk",
  planningId: "ZPS-4",
  name: "스테이블코인 이상징후 차단",
  summary:
    "같은 사용자의 KRWSC 원장 이벤트가 중복 유입되면 zkPoL이 발행잔액 증명 생성 전에 후보를 감지하고, 증명 실패와 상환 차단 조치까지 이어지는 흐름입니다.",
});
