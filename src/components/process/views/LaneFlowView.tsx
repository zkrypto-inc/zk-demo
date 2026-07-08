import { Fragment } from "react";

// zkVoting 처리 개요 — 원본 HTML의 lanerow(레인 배지) + seqwrap(세부 단계 박스)를 재현.
// 색상: 서버=슬레이트, 운영자 web=보라(op), 스마트폰 web/클라이언트=accent.

type LaneStyle = { solid: string; tint: string };

function laneStyle(lane: string): LaneStyle {
  if (lane.includes("서버")) return { solid: "#5b6b86", tint: "#eef0f3" };
  if (lane.includes("운영자")) return { solid: "#7c5cff", tint: "#f0ecff" };
  return { solid: "var(--accent)", tint: "var(--accent-soft)" };
}

function FlowArrow({ color }: { color: string }) {
  return (
    <svg width="34" height="12" viewBox="0 0 34 12" className="shrink-0" aria-hidden>
      <line x1="1" y1="6" x2="24" y2="6" stroke={color} strokeWidth="2" />
      <polygon points="24,2 33,6 24,10" fill={color} />
    </svg>
  );
}

export type LaneFlowData = {
  lanes: string[];
  steps: { label: string; lane: string }[];
};

export function LaneFlowView({ lanes, steps }: LaneFlowData) {
  return (
    <div className="rounded-xl bg-[var(--surface-2)] px-4 py-4">
      {/* 레인 배지 배너 (상단) */}
      <div className="mb-4 flex flex-wrap gap-2">
        {lanes.map((lane) => (
          <span
            key={lane}
            className="inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold text-white"
            style={{ backgroundColor: laneStyle(lane).solid }}
          >
            {lane}
          </span>
        ))}
      </div>

      {/* 세부 단계 박스 흐름 */}
      <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-3">
        {steps.map((step, i) => {
          const s = laneStyle(step.lane);
          return (
            <Fragment key={`${step.label}-${i}`}>
              <div
                className="whitespace-nowrap rounded-[10px] border px-3.5 py-2.5 text-[13px] font-semibold text-[var(--ink)]"
                style={{ borderColor: s.solid, backgroundColor: s.tint }}
              >
                {step.label}
              </div>
              {i < steps.length - 1 && <FlowArrow color={s.solid} />}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
