import { navigateToRoute } from "@/router";
import type { ProductId } from "@/scenarios/types";

type ProductMeta = {
  id: ProductId;
  name: string;
  tagline: string;
  description: string;
  tags: string[];
  scenarios: string[];
  available: boolean;
};

const products: ProductMeta[] = [
  {
    id: "zkwallet",
    name: "zkWallet",
    tagline: "개인사용자가 안전하게 지갑을 만들고, 거래 서명을 확인하는 MPC 지갑 데모",
    description: "개인·법인·발행사를 위한 MPC 지갑 서비스입니다. 키 분산 생성(keygen), 다중 서명, 수탁 입출금, 발행·소각 전 과정을 데모로 확인할 수 있습니다.",
    tags: ["MPC", "Keygen", "Custody", "Issuance"],
    scenarios: ["CU-1~3 디지털 자산 수탁사", "IS-1·FS-2~3 스테이블코인 발행사", "FU-1~2 개인 지갑"],
    available: true,
  },
  {
    id: "zktransfer",
    name: "zkTransfer",
    tagline: "개인정보보호 기반 전송",
    description: "ZK Proof 기반으로 발신자·금액을 숨긴 채 스테이블코인·CBDC·바우처를 전송합니다. 감사자는 별도 감사 키로만 내역을 복호화할 수 있습니다.",
    tags: ["ZK Proof", "Privacy", "CBDC", "Voucher"],
    scenarios: ["ZT-1 스테이블코인 프라이버시 전송", "ZT-5 CBDC·바우처 QR 결제"],
    available: true,
  },
  {
    id: "zkpasskey",
    name: "zkPasskey",
    tagline: "Web2 신원 기반 지갑 개설·복구",
    description: "개인 사용자가 카카오, Google 같은 기존 로그인 신원을 연결하고, ZK Proof로 계정을 생성하거나 복구합니다.",
    tags: ["Web2 Identity", "Account Creation", "Account Recovery", "ZK Proof"],
    scenarios: ["ZK-1 지갑 개설", "ZK-2 지갑 복구"],
    available: true,
  },
  {
    id: "zkpol",
    name: "zkPoL",
    tagline: "거래소 고객 부채 ZK 증명",
    description: "개별 잔고를 공개하지 않고 거래소 또는 스테이블코인 플랫폼의 고객 잔액 정합성을 ZK Proof로 상시 증명합니다. 이상징후 탐지 및 차단 흐름도 포함합니다.",
    tags: ["PoL", "BatchCircuit", "Audit"],
    scenarios: ["거래소용 ZP-1·ZP-4", "스테이블코인용 ZPS-1·ZPS-4"],
    available: true,
  },
];

export function ProductLandingPage() {
  return (
    <section className="min-h-[calc(100vh-120px)]">
      <div className="mb-10 max-w-[780px]">
        <div className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--ink-2)]">zkrypto demo</div>
        <h1 className="mt-3 text-[34px] font-semibold leading-tight text-[var(--ink)]">
          서비스를 선택해 데모를 시작하세요
        </h1>
        <p className="mt-4 text-[15px] leading-[1.7] text-[var(--ink-2)]">
          zkrypto의 네 가지 핵심 서비스 각각에 대한 시나리오 데모입니다. 카드를 클릭해 해당 서비스의 사용자 흐름을 단계별로 확인하세요.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {products.map((product) => (
          <button
            className={`group flex min-h-[260px] flex-col justify-between rounded-xl border p-6 text-left transition ${
              product.available
                ? "border-[var(--line)] bg-[var(--surface)] hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[0_14px_38px_rgba(15,23,42,0.08)]"
                : "cursor-default border-[var(--line)] bg-[var(--surface-2)] opacity-60"
            }`}
            disabled={!product.available}
            key={product.id}
            onClick={() => product.available && navigateToRoute({ name: "product", productId: product.id })}
            type="button"
          >
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--accent)]">
                    {product.id}
                  </div>
                  <div className="mt-1 text-[24px] font-semibold text-[var(--ink)]">{product.name}</div>
                  <div className="mt-0.5 text-[13px] text-[var(--ink-2)]">{product.tagline}</div>
                </div>
                {!product.available && (
                  <span className="inline-flex h-6 items-center rounded-full bg-[var(--surface-3)] px-3 text-[11px] font-semibold text-[var(--muted)]">
                    준비 중
                  </span>
                )}
              </div>

              <p className="mt-4 text-[13px] leading-[1.65] text-[var(--ink-2)]">{product.description}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <span
                    className="inline-flex h-5 items-center rounded bg-[var(--surface-2)] px-2 font-mono text-[10px] text-[var(--muted)]"
                    key={tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6">
              {product.scenarios.length > 0 ? (
                <div className="space-y-1">
                  {product.scenarios.map((s) => (
                    <div className="flex items-center gap-2 text-[12px] text-[var(--ink-2)]" key={s}>
                      <span className="h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]" />
                      {s}
                    </div>
                  ))}
                </div>
              ) : null}
              {product.available && (
                <div className="mt-4 text-[13px] font-semibold text-[var(--accent)] group-hover:underline">
                  데모 시작 →
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
