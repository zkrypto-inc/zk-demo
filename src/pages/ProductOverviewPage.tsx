import { getGroupsByProduct, getScenarioDisplayId, getScenarioSurface, scenarios } from "@/scenarios";
import { navigateToRoute } from "@/router";
import type { ActorGroupId, ProductId, Scenario } from "@/scenarios/types";
import { useDemoStore } from "@/store/demoStore";

const surfaceLabels = {
  app: "모바일 앱",
  web: "웹 콘솔",
  mixed: "혼합 화면",
};

const productMeta: Record<ProductId, { eyebrow: string; title: string; description: string }> = {
  zkwallet: {
    eyebrow: "zkWallet",
    title: "개인사용자가 안전하게 지갑을 만들고, 거래 서명을 확인하는 MPC 지갑 데모",
    description: "개인·법인·발행사를 위한 MPC 지갑 서비스입니다. 사용자 유형을 선택해 시나리오를 시작하세요.",
  },
  zktransfer: {
    eyebrow: "zkTransfer",
    title: "개인정보보호 기반 전송",
    description: "ZK Proof 기반으로 발신자·금액을 숨긴 채 전송하는 서비스입니다. 시나리오를 선택해 시작하세요.",
  },
  zkpasskey: {
    eyebrow: "zkPasskey",
    title: "패스키 기반 인증",
    description: "WebAuthn 패스키와 ZK Proof를 결합한 인증 서비스입니다. 시나리오를 준비 중입니다.",
  },
  zkporl: {
    eyebrow: "거래소용",
    title: "거래소 준비금·부채 ZK 증명",
    description: "개별 잔고 비공개 상태에서 전체 준비금·부채 정합성을 ZK Proof로 상시 증명합니다. 역할을 선택해 시나리오를 시작하세요.",
  },
};

function ScenarioCard({
  scenario,
  productId,
  actorId,
  completed,
  currentStep,
}: {
  scenario: Scenario;
  productId: ProductId;
  actorId: ActorGroupId;
  completed: boolean;
  currentStep: number;
}) {
  const displayId = getScenarioDisplayId(scenario);
  const surface = getScenarioSurface(scenario);
  const status = completed ? "완료" : currentStep > 0 ? `진행 중 Step ${currentStep + 1}` : "시작 전";

  return (
    <button
      className="group flex min-h-[200px] w-full flex-col justify-between rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 text-left transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[0_14px_38px_rgba(15,23,42,0.08)]"
      onClick={() =>
        navigateToRoute({
          name: "scenario",
          productId,
          actorId,
          scenarioId: scenario.id,
          stepIndex: currentStep,
        })
      }
      type="button"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] font-semibold text-[var(--accent)]">{displayId}</span>
          <span className="inline-flex h-5 items-center rounded bg-[var(--surface-2)] px-2 text-[10px] font-semibold text-[var(--ink-2)]">
            {surfaceLabels[surface]}
          </span>
          <span className="inline-flex h-5 items-center rounded bg-[var(--surface-2)] px-2 font-mono text-[10px] text-[var(--muted)]">
            {scenario.steps.length} steps
          </span>
        </div>
        <div className="mt-3 text-[20px] font-semibold text-[var(--ink)]">{scenario.shortName}</div>
        <div className="mt-2 text-[13px] leading-[1.6] text-[var(--ink-2)]">{scenario.summary}</div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <div className={`text-[12px] font-semibold ${completed ? "text-[var(--ok)]" : currentStep > 0 ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}>
          {status}
        </div>
        <div className="text-[13px] font-semibold text-[var(--accent)] group-hover:underline">시나리오 열기</div>
      </div>
    </button>
  );
}

type Props = {
  productId: ProductId;
};

export function ProductOverviewPage({ productId }: Props) {
  const meta = productMeta[productId];
  const groups = getGroupsByProduct(productId);
  const completedScenarios = useDemoStore((state) => state.completedScenarios);
  const stepMap = useDemoStore((state) => state.stepMap);

  // 그룹이 하나뿐이면 시나리오 카드를 바로 표시
  const singleGroup = groups.length === 1 ? groups[0] : null;
  const flatScenarios = singleGroup
    ? [...new Set(singleGroup.scenarioIds)].map((id) => scenarios[id]).filter(Boolean)
    : null;

  return (
    <section className="min-h-[calc(100vh-120px)]">
      <div className="mb-8 max-w-[780px]">
        <div className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--ink-2)]">{meta.eyebrow}</div>
        <h1 className="mt-3 text-[34px] font-semibold leading-tight text-[var(--ink)]">{meta.title}</h1>
        <p className="mt-4 text-[15px] leading-[1.7] text-[var(--ink-2)]">{meta.description}</p>
      </div>

      {groups.length === 0 ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--line)] text-[var(--muted)]">
          <div className="text-[32px]">🔧</div>
          <div className="mt-3 text-[15px] font-semibold">시나리오 준비 중</div>
          <div className="mt-1 text-[13px]">곧 업데이트될 예정입니다.</div>
        </div>
      ) : flatScenarios ? (
        <div className="grid gap-4 md:grid-cols-2">
          {flatScenarios.map((scenario) => (
            <ScenarioCard
              actorId={singleGroup!.id as ActorGroupId}
              completed={completedScenarios.includes(scenario.id)}
              currentStep={stepMap[scenario.id] ?? 0}
              key={scenario.id}
              productId={productId}
              scenario={scenario}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((group) => {
            const groupScenarios = group.scenarioIds.map((id) => scenarios[id]).filter(Boolean);
            const uniqueScenarios = groupScenarios.filter(
              (s, i, arr) => arr.findIndex((x) => x.id === s.id) === i,
            );
            const completedCount = uniqueScenarios.filter((s) => completedScenarios.includes(s.id)).length;

            return (
              <button
                className="flex min-h-[200px] flex-col justify-between rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5 text-left transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[0_14px_38px_rgba(15,23,42,0.08)]"
                key={group.id}
                onClick={() => navigateToRoute({ name: "actor", productId, actorId: group.id })}
                type="button"
              >
                <div>
                  <div className="flex flex-wrap gap-2">
                    <div className="inline-flex h-6 items-center rounded bg-[var(--surface-2)] px-2 text-[11px] font-semibold text-[var(--ink-2)]">
                      {surfaceLabels[group.surface]}
                    </div>
                    <div className="inline-flex h-6 items-center rounded bg-[var(--surface-2)] px-2 font-mono text-[11px] text-[var(--muted)]">
                      {uniqueScenarios.length} scenarios
                    </div>
                  </div>
                  <div className="mt-4 text-[21px] font-semibold text-[var(--ink)]">{group.label}</div>
                  <div className="mt-3 text-[13px] leading-[1.6] text-[var(--ink-2)]">{group.description}</div>
                </div>
                <div className="mt-6 flex items-center justify-between gap-3">
                  <div className="text-[12px] text-[var(--muted)]">{completedCount} 완료</div>
                  <div className="text-[13px] font-semibold text-[var(--accent)]">시나리오 선택</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
