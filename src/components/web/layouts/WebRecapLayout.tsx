import type { RecapPanel, RecapRow, ScenarioId, UserScreen } from "@/scenarios/types";
import { navigateToRoute } from "@/router";
import { actorGroups, scenarioGroupLookup, scenarios } from "@/scenarios";
import { PhoneStatusBar } from "@/components/phone/PhoneStatusBar";
import { PhoneScreen } from "@/components/phone/PhoneScreen";
import { getProductLabelByScenarioId } from "@/scenarios/groups";
import { useDemoStore } from "@/store/demoStore";
import { withLiveScreenValues } from "@/utils/liveValues";

type Props = {
  screen: UserScreen;
};

function RecapMiniCard({ row }: { row: RecapRow }) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)]/90 px-4 py-3">
      <div className="text-[11px] text-[var(--ink-2)]">{row.label}</div>
      <div
        className={`mt-1.5 break-all text-[13px] font-semibold ${row.mono ? "font-mono" : ""} ${
          row.ok ? "text-[var(--ok)]" : "text-[var(--ink)]"
        }`}
      >
        {row.value}
      </div>
    </div>
  );
}

function handleCtaClick(target: NonNullable<RecapPanel["cta"]>["target"]) {
  if (target.type === "scenario") {
    const actorId = scenarioGroupLookup[target.scenarioId];
    const productId = actorGroups.find((g) => g.id === actorId)?.productId ?? "zkwallet";
    navigateToRoute({
      name: "scenario",
      productId,
      actorId,
      scenarioId: target.scenarioId,
      stepIndex: target.stepIndex ?? 0,
    });
    return;
  }
  const productId = actorGroups.find((g) => g.id === target.actorId)?.productId ?? "zkwallet";
  navigateToRoute({ name: "actor", productId, actorId: target.actorId });
}

function PhoneFramePreview({
  scenarioId,
  screenId,
  hostScenarioId,
}: {
  scenarioId: string;
  screenId: string;
  hostScenarioId?: ScenarioId;
}) {
  const storeState = useDemoStore((s) => s);
  const scenario = scenarios[scenarioId as keyof typeof scenarios];
  if (!scenario) return null;
  const rawScreen = scenario.screens.find((s) => s.id === screenId);
  if (!rawScreen) return null;
  // 임베드된 폰 화면도 실제 실행 값(어댑터 결과)으로 오버라이드한다.
  // (안 하면 recap 패널 rows는 실값인데 폰 목업만 픽스처로 남아 값이 어긋난다)
  // 순서: 호스트 시나리오 값으로 먼저 채우고(직접 진입 시 원본 시나리오 미실행 대비),
  // 원본 시나리오 값이 있으면 그걸 우선한다("FU-1 결과"는 FU-1 실행값이 정답).
  const hostResolved = hostScenarioId ? withLiveScreenValues(rawScreen, storeState, hostScenarioId) : rawScreen;
  const previewScreen = withLiveScreenValues(hostResolved, storeState, scenario.id as ScenarioId);
  const productLabel = getProductLabelByScenarioId(scenario.id);
  const noop = () => {};

  return (
    <div className="mx-auto mb-4 w-[280px]" style={{ transform: "scale(0.85)", transformOrigin: "top center" }}>
      <div className="relative h-[600px] w-[280px] rounded-[48px] bg-[var(--bezel)] p-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.08),0_20px_56px_rgba(0,0,0,0.18)]">
        <div className="relative flex h-full flex-col overflow-hidden rounded-[42px] bg-[var(--surface)]">
          <div className="absolute left-1/2 top-[8px] z-20 h-[22px] w-[78px] -translate-x-1/2 rounded-[16px] bg-black" />
          <PhoneStatusBar />
          <div className="relative flex h-10 shrink-0 items-center justify-center border-b border-[var(--line)] px-5">
            <div className="text-[13px] font-semibold text-[var(--ink)]">{productLabel}</div>
          </div>
          <PhoneScreen
            screen={previewScreen}
            activeActionLabel={undefined}
            canAdvance={false}
            onAdvance={noop}
            onFieldChange={noop}
          />
          <div className="shrink-0 py-[6px]">
            <div className="mx-auto h-[4px] w-[128px] rounded-full bg-[rgba(82,82,91,0.4)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Panel({ panel, hostScenarioId }: { panel: RecapPanel; hostScenarioId?: ScenarioId }) {
  return (
    <section className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-[18px] font-bold text-[var(--ink)]">{panel.title}</h2>
        {panel.subtitle && (
          <p className="mt-1 text-[13px] leading-[1.6] text-[var(--ink-2)]">{panel.subtitle}</p>
        )}
      </div>

      {panel.previewScreen && (
        <PhoneFramePreview
          scenarioId={panel.previewScreen.scenarioId}
          screenId={panel.previewScreen.screenId}
          hostScenarioId={hostScenarioId}
        />
      )}

      <div className="rounded-xl border border-[var(--ok)] bg-[var(--ok-soft)] p-4">
        <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.05em] text-[var(--ok)]">
          {panel.groupTitle}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {panel.rows.map((row, i) => {
            const fullWidth = row.label === "감사 이벤트" || row.label === "Raw Signature";
            return (
              <div key={i} className={fullWidth ? "sm:col-span-2" : undefined}>
                <RecapMiniCard row={row} />
              </div>
            );
          })}
        </div>
      </div>

      {panel.cta && (
        <button
          type="button"
          onClick={() => handleCtaClick(panel.cta!.target)}
          className={`mt-4 w-full rounded-lg px-4 py-3 text-left text-[13px] font-semibold transition ${
            panel.cta.tone === "accent"
              ? "bg-[var(--accent)] text-white hover:opacity-90"
              : "bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[var(--accent-soft)]/70"
          }`}
        >
          {panel.cta.label} →
        </button>
      )}
    </section>
  );
}

export function WebRecapLayout({ screen }: Props) {
  const recap = screen.recap;
  if (!recap) return null;

  // 이 recap 화면이 속한 호스트 시나리오(id) 역조회 — 프리뷰 폰 화면의 라이브 값 폴백에 쓴다.
  const hostScenarioId = (Object.values(scenarios).find((sc) => sc.screens.some((s) => s.id === screen.id))?.id ??
    undefined) as ScenarioId | undefined;

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-5">
      <div className="space-y-2">
        {recap.eyebrow && (
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-2)]">
            {recap.eyebrow}
          </div>
        )}
        <h1 className="text-[24px] font-bold leading-tight text-[var(--ink)]">{recap.heading}</h1>
        {recap.description && (
          <p className="max-w-[820px] text-[13px] leading-[1.6] text-[var(--ink-2)]">{recap.description}</p>
        )}
      </div>

      {recap.badges && recap.badges.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3">
          {recap.badges.map((badge, i) => (
            <span key={badge} className="flex items-center gap-2">
              <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[12px] font-semibold text-[var(--accent)]">
                {badge}
              </span>
              {i < recap.badges!.length - 1 && <span className="text-[var(--muted)]">→</span>}
            </span>
          ))}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {recap.panels.map((panel, i) => (
          <Panel key={i} panel={panel} hostScenarioId={hostScenarioId} />
        ))}
      </div>
    </div>
  );
}
