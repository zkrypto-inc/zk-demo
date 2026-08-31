import type { ReactNode } from "react";
import { navigateToRoute } from "@/router";
import type { ProductId } from "@/scenarios/types";

type ProductMeta = {
  id: ProductId;
  name: string;
  desc: string;
  codes: string;
};

// 금융 카테고리 — 영지식 증명 기반 디지털 자산·결제 제품.
const financeProducts: ProductMeta[] = [
  { id: "zkwallet", name: "zkWallet", desc: "MPC 키 분산 · 다중 서명 · 수탁 입출금", codes: "FU · CU · IS" },
  { id: "zktransfer", name: "zkTransfer", desc: "발신자 · 금액 비공개 전송, 감사키 복호화", codes: "ZT" },
  { id: "zkpasskey", name: "zkPasskey", desc: "Web2 신원 기반 지갑 개설 · 복구", codes: "ZK" },
  { id: "zkpol", name: "zkPoL", desc: "거래소·스테이블코인 잔액 정합성 증명", codes: "ZP · ZPS" },
];

// 투표 카테고리 — 영지식 증명 기반 비밀투표 제품.
const votingProducts: ProductMeta[] = [
  { id: "zkvoting", name: "zkVoting", desc: "비밀투표 · 공개검증 · 개표 무결성 증명", codes: "ZV · ZO" },
];

function ProductCard({ product }: { product: ProductMeta }) {
  return (
    <button
      type="button"
      onClick={() => navigateToRoute({ name: "product", productId: product.id })}
      className="group flex min-h-[172px] flex-col justify-between bg-[var(--surface)] p-7 text-left transition-colors hover:bg-[var(--surface-2)]"
    >
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[22px] font-semibold tracking-[-0.01em] text-[var(--ink)]">{product.name}</span>
        <span className="font-mono text-[11px] tracking-[0.06em] text-[var(--muted)]">{product.codes}</span>
      </div>
      <p className="mt-4 text-[13.5px] leading-[1.55] text-[var(--ink-2)]">{product.desc}</p>
      <span className="mt-6 inline-flex items-center gap-2 text-[13px] font-medium text-[var(--ink)]">
        데모 시작
        <span className="text-[var(--muted)] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[var(--accent)]" aria-hidden>→</span>
      </span>
    </button>
  );
}

function CategorySection({ label, caption, children }: { label: string; caption: string; children: ReactNode }) {
  return (
    <div className="mt-12 first:mt-0">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-[var(--ink)]">{label}</h2>
        <span className="text-[12.5px] text-[var(--muted)]">{caption}</span>
      </div>
      {children}
    </div>
  );
}

export function ProductLandingPage() {
  return (
    <section className="mx-auto max-w-[1080px] px-2 pt-10 pb-20 md:pt-14">
      <header className="mb-10 flex flex-col gap-5 border-b border-[var(--ink)]/15 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="font-mono text-[11px] tracking-[0.2em] text-[var(--muted)]">ZKRYPTO</div>
          <h1 className="mt-2.5 text-[26px] font-semibold tracking-[-0.01em] text-[var(--ink)]">영지식 증명 제품 데모</h1>
        </div>
        <p className="max-w-[340px] text-[13px] leading-[1.6] text-[var(--ink-2)] sm:text-right">
          영지식 증명 제품을 분야별 시나리오로 시연합니다.
          <br />
          항목을 선택해 시작하세요.
        </p>
      </header>

      <CategorySection label="금융" caption="디지털 자산 · 결제 · 지급의무 증명">
        <div className="grid gap-px overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--line)] md:grid-cols-2">
          {financeProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </CategorySection>

      <CategorySection label="투표" caption="비밀투표 · 공개검증 · 개표 무결성 증명">
        <div className="grid gap-px overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--line)] md:grid-cols-2">
          {votingProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </CategorySection>
    </section>
  );
}
