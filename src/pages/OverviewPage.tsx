import { actorGroups, scenarios } from "@/scenarios";
import { navigateToRoute } from "@/router";
import { useDemoStore } from "@/store/demoStore";
import type { ProductId } from "@/scenarios/types";

const surfaceLabels = {
  app: "모바일 앱",
  web: "웹 콘솔",
  mixed: "혼합 화면",
};

export function OverviewPage() {
  const completedScenarios = useDemoStore((state) => state.completedScenarios);

  return (
    <section className="min-h-[calc(100vh-120px)]">
      <div className="mb-8 max-w-[780px]">
        <div className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--ink-2)]">Demo Home</div>
        <h1 className="mt-3 text-[34px] font-semibold leading-tight text-[var(--ink)]">
          사용자 유형을 선택해 시나리오를 시작하세요
        </h1>
        <p className="mt-4 text-[15px] leading-[1.7] text-[var(--ink-2)]">
          각 사용자 유형 안에서 지갑 생성, 발행 요청, 수탁 출금 같은 개별 시나리오를 선택한 뒤 단계별 화면과 처리 과정을 확인할 수 있습니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {actorGroups.map((group) => {
          const groupScenarios = group.scenarioIds.map((scenarioId) => scenarios[scenarioId]).filter(Boolean);
          const completedCount = groupScenarios.filter((scenario) => completedScenarios.includes(scenario.id)).length;

          return (
            <button
              className="flex min-h-[220px] flex-col justify-between rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5 text-left transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[0_14px_38px_rgba(15,23,42,0.08)]"
              key={group.id}
              onClick={() => navigateToRoute({ name: "actor", productId: group.productId as ProductId, actorId: group.id })}
              type="button"
            >
              <div>
                <div className="flex flex-wrap gap-2">
                  <div className="inline-flex h-6 items-center rounded bg-[var(--surface-2)] px-2 text-[11px] font-semibold text-[var(--ink-2)]">
                    {surfaceLabels[group.surface]}
                  </div>
                  <div className="inline-flex h-6 items-center rounded bg-[var(--surface-2)] px-2 font-mono text-[11px] text-[var(--muted)]">
                    {groupScenarios.length} scenarios
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
    </section>
  );
}
