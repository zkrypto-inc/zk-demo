import { toneText } from "@/utils/tone";
import type { ProcessView, StatusCard } from "@/scenarios/types";

type Props = {
  view: Extract<ProcessView, { kind: "keygen" }>;
};

function NodeBox({ node }: { node?: StatusCard }) {
  const tone = node?.tone;
  const isActive = tone === "ok" || tone === "warn" || tone === "accent";
  const borderClass =
    tone === "ok" ? "border-[var(--ok)]" :
    tone === "warn" ? "border-[var(--warn)]" :
    tone === "accent" ? "border-[var(--accent)]" :
    "border-[var(--line)]";
  const valueClass = isActive ? toneText(tone) : "text-[var(--muted)]";

  return (
    <div className={`flex flex-1 min-w-0 flex-col items-center rounded-lg border bg-[var(--surface)] px-2 py-3 text-center ${borderClass} ${!isActive ? "opacity-50" : ""}`}>
      <div className="text-[12px] font-semibold text-[var(--ink)]">{node?.label ?? "—"}</div>
      {node?.value && (
        <div className={`mt-1 truncate text-[10px] leading-[1.3] font-medium ${valueClass}`}>
          {node.value}
        </div>
      )}
    </div>
  );
}

function MutualArrow() {
  return (
    <div className="flex shrink-0 flex-col items-center justify-center gap-[3px] px-0.5 text-[var(--muted)]">
      <svg width="20" height="6" viewBox="0 0 20 6" fill="none">
        <line x1="0" y1="1.5" x2="18" y2="1.5" stroke="currentColor" strokeWidth="1.2" />
        <polygon points="18,1.5 13,0 13,3" fill="currentColor" />
      </svg>
      <svg width="20" height="6" viewBox="0 0 20 6" fill="none">
        <line x1="20" y1="4.5" x2="2" y2="4.5" stroke="currentColor" strokeWidth="1.2" />
        <polygon points="2,4.5 7,3 7,6" fill="currentColor" />
      </svg>
    </div>
  );
}

export function KeygenProcessView({ view }: Props) {
  const partyNode = view.nodes.find((n) => n.tone === "accent");
  const workerNodes = partyNode
    ? view.nodes.filter((n) => n !== partyNode)
    : view.nodes;

  return (
    <div className="space-y-4">
      <p className="text-[14px] leading-[1.65] text-[var(--ink-2)]">{view.description}</p>

      <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-4">
        {/* Party Node */}
        <div className="flex justify-center">
          <div className="min-w-[140px] rounded-lg border-2 border-[var(--accent)] bg-[var(--accent-soft)] px-8 py-3 text-center">
            <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--accent)]">조율</div>
            <div className="mt-0.5 text-[15px] font-bold text-[var(--ink)]">
              {partyNode?.label ?? "관리자 노드"}
            </div>
            {partyNode?.value && (
              <div className={`mt-0.5 text-[11px] font-medium ${toneText(partyNode.tone)}`}>
                {partyNode.value}
              </div>
            )}
          </div>
        </div>

        {/* Fan-out: party → nodes
            Lines use % coords (scales with container, no distortion).
            Marker uses userSpaceOnUse so the arrowhead stays fixed-pixel-size. */}
        <svg aria-hidden="true" className="w-full" height="36">
          <defs>
            <marker
              id="fan-tip"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path d="M0,0 L0,8 L7,4 z" fill="var(--accent)" fillOpacity="0.75" />
            </marker>
          </defs>
          <line x1="50%" y1="2"  x2="15%" y2="30" stroke="var(--accent)" strokeWidth="1.5" strokeOpacity="0.7" markerEnd="url(#fan-tip)" />
          <line x1="50%" y1="2"  x2="50%" y2="30" stroke="var(--accent)" strokeWidth="1.5" strokeOpacity="0.7" markerEnd="url(#fan-tip)" />
          <line x1="50%" y1="2"  x2="85%" y2="30" stroke="var(--accent)" strokeWidth="1.5" strokeOpacity="0.7" markerEnd="url(#fan-tip)" />
        </svg>

        {/* Worker nodes with mutual arrows */}
        <div className="flex items-stretch gap-1">
          <NodeBox node={workerNodes[0]} />
          <MutualArrow />
          <NodeBox node={workerNodes[1]} />
          <MutualArrow />
          <NodeBox node={workerNodes[2]} />
        </div>

        {/* Legend */}
        <div className="mt-3 flex gap-4 text-[10px] text-[var(--muted)]">
          <span className="flex items-center gap-1">
            <span className="text-[var(--accent)]">↓</span> 키 생성 요청
          </span>
          <span className="flex items-center gap-1">
            <span>⇄</span> 노드 간 상호 통신
          </span>
        </div>
      </div>

      {view.showProgress !== false && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[12px] font-medium text-[var(--ink-2)]">
              {view.progressLabel ?? "진행률"}
            </span>
            {view.showProgressValue !== false && (
              <span className="font-mono text-[12px] text-[var(--accent)]">{view.progress}%</span>
            )}
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--line)]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
              style={{ width: `${view.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
