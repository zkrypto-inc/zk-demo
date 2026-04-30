import type { SequenceEdge, Tone } from "@/scenarios/types";

type Props = {
  actors: string[];
  edge?: SequenceEdge;
  pastEdges?: SequenceEdge[];
  compact?: boolean;
};

const width = 760;
const height = 420;
const nodeWidth = 142;
const nodeHeight = 42;

function toneColor(tone?: Tone) {
  if (tone === "bad") return "var(--bad)";
  if (tone === "warn") return "var(--warn)";
  if (tone === "ok") return "var(--ok)";
  return "var(--accent)";
}

function nodeCenter(index: number, total: number) {
  const cols = Math.min(3, Math.max(1, total));
  const rows = Math.ceil(total / cols);
  const row = Math.floor(index / cols);
  const col = index % cols;
  const rowCount = row === rows - 1 ? total - row * cols : cols;
  const offset = ((cols - rowCount) * width) / cols / 2;

  return {
    x: offset + (col + 0.5) * (width / cols),
    y: (row + 0.5) * (height / rows),
  };
}

function edgeGeometry(actors: string[], edge: SequenceEdge, offsetPx = 0) {
  const fromIndex = Math.max(0, actors.indexOf(edge.from));
  const toIndex = Math.max(0, actors.indexOf(edge.to));
  const from = nodeCenter(fromIndex, actors.length);
  const to = nodeCenter(toIndex, actors.length);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / distance;
  const uy = dy / distance;
  const canonicalFrom = nodeCenter(Math.min(fromIndex, toIndex), actors.length);
  const canonicalTo = nodeCenter(Math.max(fromIndex, toIndex), actors.length);
  const canonicalDx = canonicalTo.x - canonicalFrom.x;
  const canonicalDy = canonicalTo.y - canonicalFrom.y;
  const canonicalDistance = Math.sqrt(canonicalDx * canonicalDx + canonicalDy * canonicalDy) || 1;
  const offsetX = (-canonicalDy / canonicalDistance) * offsetPx;
  const offsetY = (canonicalDx / canonicalDistance) * offsetPx;
  const start = {
    x: from.x + ux * (nodeWidth / 2 + 8) + offsetX,
    y: from.y + uy * (nodeHeight / 2 + 8) + offsetY,
  };
  const end = {
    x: to.x - ux * (nodeWidth / 2 + 14) + offsetX,
    y: to.y - uy * (nodeHeight / 2 + 14) + offsetY,
  };
  const arrowEnd = {
    x: to.x - ux * (nodeWidth / 2 + 4) + offsetX,
    y: to.y - uy * (nodeHeight / 2 + 4) + offsetY,
  };
  const angle = Math.atan2(dy, dx);
  const arrowLength = 10;
  const arrowSpread = 0.42;
  const arrow = [
    `${arrowEnd.x.toFixed(1)},${arrowEnd.y.toFixed(1)}`,
    `${(arrowEnd.x - arrowLength * Math.cos(angle - arrowSpread)).toFixed(1)},${(arrowEnd.y - arrowLength * Math.sin(angle - arrowSpread)).toFixed(1)}`,
    `${(arrowEnd.x - arrowLength * Math.cos(angle + arrowSpread)).toFixed(1)},${(arrowEnd.y - arrowLength * Math.sin(angle + arrowSpread)).toFixed(1)}`,
  ].join(" ");

  return {
    d: `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} L ${end.x.toFixed(1)} ${end.y.toFixed(1)}`,
    arrow,
    labelX: (start.x + end.x) / 2,
    labelY: (start.y + end.y) / 2 - 10,
  };
}

function hasSameActorPair(a: SequenceEdge, b?: SequenceEdge) {
  if (!b) return false;
  return (a.from === b.from && a.to === b.to) || (a.from === b.to && a.to === b.from);
}

export function SequenceProcessView({ actors, edge, pastEdges = [], compact = false }: Props) {
  const activeActors = new Set<string>();
  pastEdges.forEach((pastEdge) => {
    activeActors.add(pastEdge.from);
    activeActors.add(pastEdge.to);
  });
  if (edge) {
    activeActors.add(edge.from);
    activeActors.add(edge.to);
  }

  return (
    <div className={`flex flex-col ${compact ? "h-full" : "min-h-[460px]"}`}>
      <svg
        className="min-h-0 w-full flex-1"
        viewBox={compact ? `0 155 ${width} 130` : `0 0 ${width} ${height}`}
        role="img"
        aria-label="시스템 시퀀스 다이어그램"
      >
        {pastEdges.map((pastEdge, index) => {
          if (pastEdge.from === pastEdge.to) return null;
          const geometry = edgeGeometry(actors, pastEdge, hasSameActorPair(pastEdge, edge) ? 14 : 0);
          return (
            <g key={`${pastEdge.from}-${pastEdge.to}-${index}`} opacity="0.28">
              <path d={geometry.d} fill="none" stroke="var(--ink-2)" strokeWidth="1.4" />
              <polygon fill="var(--ink-2)" points={geometry.arrow} />
            </g>
          );
        })}

        {edge && edge.from !== edge.to && (
          <g>
            {(() => {
              const geometry = edgeGeometry(actors, edge);
              const stroke = toneColor(edge.tone);
              return (
                <>
                  <path d={geometry.d} fill="none" stroke={stroke} strokeLinecap="round" strokeWidth="2.2" />
                  <polygon fill={stroke} points={geometry.arrow} />
                  <text fill={stroke} fontSize="12" fontWeight="600" textAnchor="middle" x={geometry.labelX} y={geometry.labelY}>
                    {edge.label}
                  </text>
                </>
              );
            })()}
          </g>
        )}

        {actors.map((actor, index) => {
          const center = nodeCenter(index, actors.length);
          const isCurrent = edge?.from === actor || edge?.to === actor;
          const isPast = !isCurrent && activeActors.has(actor);
          return (
            <g key={actor} opacity={activeActors.size === 0 || isCurrent ? 1 : isPast ? 0.62 : 0.35}>
              <rect
                fill={isCurrent ? "var(--accent-soft)" : "var(--surface)"}
                height={nodeHeight}
                rx="8"
                stroke={isCurrent ? toneColor(edge?.tone) : "var(--line)"}
                strokeWidth={isCurrent ? 1.6 : 1}
                width={nodeWidth}
                x={center.x - nodeWidth / 2}
                y={center.y - nodeHeight / 2}
              />
              <text
                fill={isCurrent ? "var(--ink)" : "var(--ink-2)"}
                fontSize="12"
                fontWeight={isCurrent ? 700 : 600}
                textAnchor="middle"
                x={center.x}
                y={center.y + 4}
              >
                {actor}
              </text>
            </g>
          );
        })}
      </svg>

      {!compact && edge?.sublabel && (
        <div className="rounded-md bg-[var(--surface-2)] px-3 py-2 text-[12px] leading-[1.5] text-[var(--ink-2)]">
          {edge.sublabel}
        </div>
      )}
    </div>
  );
}
