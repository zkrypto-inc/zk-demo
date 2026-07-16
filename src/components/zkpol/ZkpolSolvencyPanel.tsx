import { useEffect, useState } from "react";
import { getPublicCoins, type PolCoinHealth } from "@/api/polClient";
import { currentDemoToken, displayToken, type PolLine } from "@/api/polControlClient";

// 지급능력(Solvency) 패널 — PoR(준비금) × PoL(발행잔액) 대조 인터페이스.
// PoL(발행잔액)은 zkpol 파이프라인의 실제 검증값. PoR(준비금)은 아직 백엔드가 없어
// 데모 값(백엔드가 발행잔액을 미러링 → 담보율 100%)이다. 수탁기관 증명 연동 전 인터페이스 선행.
type Props = { line?: PolLine };

const POLL_MS = 4000;
const nf = new Intl.NumberFormat("ko-KR");

export function ZkpolSolvencyPanel({ line = "stablecoin" }: Props) {
  const [coin, setCoin] = useState<PolCoinHealth | null>(null);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const coins = await getPublicCoins();
        if (!alive) return;
        const token = currentDemoToken(line);
        setCoin(coins.find((c) => c.tokenId === token) ?? null);
      } catch {
        /* 다음 폴링에서 재시도 */
      }
    };
    void tick();
    const timer = setInterval(tick, POLL_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [line]);

  const symbol = displayToken(coin?.tokenId ?? currentDemoToken(line));
  const incident = coin?.healthStatus === "incident";
  const reserve = coin?.reserveAmount ?? null;
  const liability = coin?.liabilityAmount ?? null;
  const coverage = coin?.coverageRatio ?? null;

  const badge = incident
    ? { label: "검증 실패 · 상환 차단", cls: "bg-[var(--bad-soft)] text-[var(--bad)]" }
    : coverage != null && coverage < 100
      ? { label: "준비금 부족", cls: "bg-[var(--warn-soft,#fef3c7)] text-[var(--warn,#b45309)]" }
      : { label: "정상 · 1:1 담보", cls: "bg-[var(--ok-soft,#dcfce7)] text-[var(--ok)]" };

  const row = (label: string, sub: string, value: string) => (
    <div className="flex items-baseline justify-between py-2">
      <div>
        <div className="text-[12px] font-semibold text-[var(--ink)]">{label}</div>
        <div className="text-[10px] text-[var(--muted)]">{sub}</div>
      </div>
      <div className="font-mono text-[15px] font-semibold tabular-nums text-[var(--ink)]">{value}</div>
    </div>
  );

  return (
    <section className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
          지급능력 · PoR × PoL ({symbol})
        </span>
        <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-medium ${badge.cls}`}>
          {badge.label}
        </span>
      </div>

      <div className="divide-y divide-[var(--ink)]/8">
        {row("준비금 (PoR)", "수탁기관 잔고 증명 — 데모 값(연동 예정)", reserve != null ? `${nf.format(reserve)} ${symbol}` : "—")}
        {row("발행 잔액 (PoL)", "ZK 증명으로 검증된 부채 합계", liability != null ? `${nf.format(liability)} ${symbol}` : "—")}
        {row("담보율", "준비금 ÷ 발행 잔액", coverage != null ? `${coverage.toFixed(1)}%` : "—")}
      </div>

      <p className="mt-2 text-[11px] leading-[1.6] text-[var(--muted)]">
        {incident
          ? "이상 이벤트로 발행잔액 증명이 실패해 담보율을 보증할 수 없습니다. 상환이 차단됩니다."
          : "발행 잔액은 개별 잔고 비공개 상태로 ZK 증명되며, 준비금과 1:1 대조해 지급능력을 상시 확인합니다."}
      </p>
    </section>
  );
}
