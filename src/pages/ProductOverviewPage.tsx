import { getGroupsByProduct, getScenarioDisplayId, scenarios } from "@/scenarios";
import { navigateToRoute } from "@/router";
import type { ActorGroupId, ProductId } from "@/scenarios/types";
import { useDemoStore } from "@/store/demoStore";

const surfaceLabels = {
  app: "모바일",
  web: "웹 콘솔",
  mixed: "혼합",
};

const productMeta: Record<ProductId, { eyebrow: string; title: string; desc: string }> = {
  zkwallet: { eyebrow: "zkWallet", title: "MPC 지갑", desc: "개인·법인·발행사 키 분산 지갑. 사용자 유형을 선택하세요." },
  zktransfer: { eyebrow: "zkTransfer", title: "비공개 전송", desc: "발신자·금액 비공개 전송. 시나리오를 선택하세요." },
  zkpasskey: { eyebrow: "zkPasskey", title: "지갑 개설·복구", desc: "Web2 신원 기반 개설·복구. 시나리오를 선택하세요." },
  zkpol: { eyebrow: "zkPoL", title: "지급의무 증명", desc: "개별 잔고 비공개 부채 증명. 역할을 선택하세요." },
  zkvoting: { eyebrow: "zkVoting", title: "영지식 비밀투표", desc: "비밀투표·공개검증·개표 무결성 증명. 역할을 선택하세요." },
};

const cardClass =
  "group flex min-h-[152px] flex-col justify-between rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6 text-left transition-colors hover:border-[var(--ink)]";

function Cta({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--ink)]">
      {label}
      <span className="text-[var(--muted)] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[var(--accent)]" aria-hidden>→</span>
    </span>
  );
}

type Props = { productId: ProductId };

export function ProductOverviewPage({ productId }: Props) {
  const meta = productMeta[productId];
  const groups = getGroupsByProduct(productId);
  const completedScenarios = useDemoStore((state) => state.completedScenarios);
  const stepMap = useDemoStore((state) => state.stepMap);

  const singleGroup = productId !== "zkpol" && groups.length === 1 ? groups[0] : null;
  const flatScenarios = singleGroup
    ? [...new Set(singleGroup.scenarioIds)].map((id) => scenarios[id]).filter(Boolean)
    : null;

  return (
    <section className="mx-auto max-w-[1100px] pt-2 pb-20">
      <header className="mb-8 border-b border-[var(--ink)]/15 pb-8">
        <div className="font-mono text-[11px] tracking-[0.2em] text-[var(--muted)]">{meta.eyebrow}</div>
        <h1 className="mt-2.5 text-[26px] font-semibold tracking-[-0.01em] text-[var(--ink)]">{meta.title}</h1>
        <p className="mt-2.5 max-w-[560px] text-[13.5px] leading-[1.6] text-[var(--ink-2)]">{meta.desc}</p>
      </header>

      {groups.length === 0 ? (
        <div className="py-16 text-center font-mono text-[12px] uppercase tracking-[0.12em] text-[var(--muted)]">시나리오 준비 중</div>
      ) : flatScenarios ? (
        <div className="grid gap-4 md:grid-cols-2">
          {flatScenarios.map((scenario) => {
            const completed = completedScenarios.includes(scenario.id);
            const step = stepMap[scenario.id] ?? 0;
            const status = completed ? "완료" : step > 0 ? `Step ${step + 1}` : "";
            return (
              <button
                key={scenario.id}
                type="button"
                className={cardClass}
                onClick={() => navigateToRoute({ name: "scenario", productId, actorId: singleGroup!.id as ActorGroupId, scenarioId: scenario.id, stepIndex: step })}
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[11px] text-[var(--muted)]">{getScenarioDisplayId(scenario)}</span>
                    <span className="font-mono text-[11px] text-[var(--muted)]">{scenario.steps.length} steps</span>
                  </div>
                  <div className="mt-3 text-[20px] font-semibold text-[var(--ink)]">{scenario.shortName}</div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <Cta label="시나리오 열기" />
                  {status && <span className="font-mono text-[11px] text-[var(--ink-2)]">{status}</span>}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((group) => {
            const uniqueScenarios = group.scenarioIds
              .map((id) => scenarios[id])
              .filter((s, i, arr) => s && arr.findIndex((x) => x?.id === s.id) === i);
            const completedCount = uniqueScenarios.filter((s) => completedScenarios.includes(s.id)).length;
            return (
              <button
                key={group.id}
                type="button"
                className={cardClass}
                onClick={() => navigateToRoute({ name: "actor", productId, actorId: group.id })}
              >
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
                    {surfaceLabels[group.surface]} · 시나리오 {uniqueScenarios.length}
                  </div>
                  <div className="mt-3 text-[20px] font-semibold text-[var(--ink)]">{group.label}</div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <Cta label="시나리오 선택" />
                  {completedCount > 0 && <span className="font-mono text-[11px] text-[var(--ink-2)]">{completedCount}/{uniqueScenarios.length}</span>}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
