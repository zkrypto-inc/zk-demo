import { useEffect, useState } from "react";
import type { ProcessView } from "@/scenarios/types";

type Phase = "generating" | "complete";
type Props = { view: Extract<ProcessView, { kind: "merkle" }> };

// ── Shared geometry ────────────────────────────────────────────────────
const W = 220;
const R_INT = 14; // intermediate node radius
const R_LEAF = 16; // leaf node radius

// ── 3-leaf tree (selecting / generating) ──────────────────────────────
const tree3 = {
  root: { x: W / 2,       y: 18 },
  h01:  { x: W * 0.33,    y: 70 },
  h2:   { x: W * 0.70,    y: 70 },
  cm1:  { x: W * 0.16,    y: 140 },
  cm2:  { x: W * 0.50,    y: 140 },
  cm3:  { x: W * 0.84,    y: 140 },
};
const edges3 = [
  [tree3.root, tree3.h01],
  [tree3.root, tree3.h2],
  [tree3.h01,  tree3.cm1],
  [tree3.h01,  tree3.cm2],
  [tree3.h2,   tree3.cm3],
];

// ── 4-leaf tree (complete) ─────────────────────────────────────────────
const tree4 = {
  root:  { x: W / 2,      y: 18 },
  h01:   { x: W * 0.28,   y: 70 },
  h23:   { x: W * 0.72,   y: 70 },
  cm1:   { x: W * 0.14,   y: 140 },
  cm2:   { x: W * 0.42,   y: 140 },
  cm3:   { x: W * 0.58,   y: 140 },
  cmNew: { x: W * 0.86,   y: 140 },
};
const edges4 = [
  [tree4.root, tree4.h01],
  [tree4.root, tree4.h23],
  [tree4.h01,  tree4.cm1],
  [tree4.h01,  tree4.cm2],
  [tree4.h23,  tree4.cm3],
  [tree4.h23,  tree4.cmNew],
];

type NodeTone = "default" | "selected" | "spent" | "new" | "changed";

function toneStyle(t: NodeTone) {
  switch (t) {
    case "selected": return { stroke: "var(--accent)", fill: "var(--accent-soft)", text: "var(--accent)" };
    case "spent":    return { stroke: "var(--muted)",  fill: "var(--surface-2)",   text: "var(--muted)" };
    case "new":      return { stroke: "var(--ok)",     fill: "var(--ok-soft)",     text: "var(--ok)" };
    case "changed":  return { stroke: "var(--ok)",     fill: "var(--ok-soft)",     text: "var(--ok)" };
    default:         return { stroke: "var(--line)",   fill: "var(--surface)",     text: "var(--ink-2)" };
  }
}

type SvgNode = { x: number; y: number };

function TreeNode({ node, label, tone, isLeaf, badge }: {
  node: SvgNode; label: string; tone: NodeTone; isLeaf: boolean; badge?: string;
}) {
  const s = toneStyle(tone);
  const r = isLeaf ? R_LEAF : R_INT;
  return (
    <g>
      <circle cx={node.x} cy={node.y} r={r}
        fill={s.fill} stroke={s.stroke}
        strokeWidth={tone !== "default" ? 2 : 1.2}
      />
      <text x={node.x} y={node.y}
        textAnchor="middle" dominantBaseline="central"
        fontSize={isLeaf ? 8 : 7} fontFamily="monospace"
        fontWeight={tone !== "default" ? "700" : "500"} fill={s.text}
      >
        {label}
      </text>
      {badge && (
        <text x={node.x} y={node.y + r + 10}
          textAnchor="middle" fontSize={7} fontFamily="sans-serif" fill={s.text}
        >
          {badge}
        </text>
      )}
    </g>
  );
}

function MerkleTree({ phase }: { phase: Phase }) {
  if (phase === "complete") {
    return (
      <svg viewBox={`0 0 ${W} 168`} className="w-full" aria-hidden="true">
        {edges4.map(([a, b], i) => (
          <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke="var(--line)" strokeWidth="1.5" />
        ))}
        <TreeNode node={tree4.root}  label="root*"  tone="changed" isLeaf={false} />
        <TreeNode node={tree4.h01}   label="H(01)"  tone="default" isLeaf={false} />
        <TreeNode node={tree4.h23}   label="H(23)*" tone="changed" isLeaf={false} />
        <TreeNode node={tree4.cm1}   label="cm1"    tone="spent"   isLeaf badge="spent" />
        <TreeNode node={tree4.cm2}   label="cm2"    tone="default" isLeaf />
        <TreeNode node={tree4.cm3}   label="cm3"    tone="default" isLeaf />
        <TreeNode node={tree4.cmNew} label="cm_new" tone="new"     isLeaf badge="신규" />
      </svg>
    );
  }

  // generating — 3 leaves, no cm4 yet

  return (
    <svg viewBox={`0 0 ${W} 168`} className="w-full" aria-hidden="true">
      {edges3.map(([a, b], i) => (
        <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
          stroke="var(--line)" strokeWidth="1.5" />
      ))}
      <TreeNode node={tree3.root} label="root"  tone="default" isLeaf={false} />
      <TreeNode node={tree3.h01}  label="H(01)" tone="default" isLeaf={false} />
      <TreeNode node={tree3.h2}   label="H(23)" tone="default" isLeaf={false} />
      <TreeNode node={tree3.cm1}  label="cm1"   tone="selected" isLeaf badge="사용 중" />
      <TreeNode node={tree3.cm2}  label="cm2"   tone="default" isLeaf />
      <TreeNode node={tree3.cm3}  label="cm3"   tone="default" isLeaf />
    </svg>
  );
}

const PROOF_STEPS = [
  { label: "cm 선택",        desc: "Merkle 경로 확인" },
  { label: "Proof 입력 준비", desc: "witness 구성" },
  { label: "ZK Proof 생성",  desc: "회로 실행" },
  { label: "cm_new 생성",    desc: "출력 레코드 준비" },
] as const;

function AnimatedProofPanel() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIdx((i) => (i + 1) % PROOF_STEPS.length);
    }, 900);
    return () => clearInterval(id);
  }, []);

  const progress = Math.round(((activeIdx + 1) / PROOF_STEPS.length) * 100);

  return (
    <>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-2)]">
        ZK Proof 생성 중
      </div>
      <div className="flex flex-col gap-2">
        {PROOF_STEPS.map((item, i) => {
          const state = i < activeIdx ? "done" : i === activeIdx ? "active" : "wait";
          return (
            <div key={item.label}
              className="flex items-start gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2"
            >
              <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold
                ${state === "done"   ? "bg-[var(--ok)] text-white"
                : state === "active" ? "border-2 border-[var(--accent)] text-[var(--accent)]"
                : "border border-[var(--line)] text-[var(--muted)]"}`}
              >
                {state === "done" ? "✓" : ""}
              </div>
              <div>
                <div className={`text-[12px] font-semibold
                  ${state === "done"   ? "text-[var(--ok)]"
                  : state === "active" ? "text-[var(--accent)]"
                  : "text-[var(--muted)]"}`}
                >
                  {item.label}
                </div>
                <div className="text-[10px] text-[var(--ink-2)]">{item.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-auto pt-2">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[11px] text-[var(--ink-2)]">Proof 생성 중</span>
          <span className="font-mono text-[11px] text-[var(--accent)]">{progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--line)]">
          <div className="h-full rounded-full bg-[var(--accent)] transition-all duration-700"
            style={{ width: `${progress}%` }} />
        </div>
      </div>
    </>
  );
}

function ProofPanel({ phase }: { phase: Phase }) {
  if (phase === "generating") {
    return <AnimatedProofPanel />;
  }

  // complete
  return (
    <>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ok)]">
        ZK Proof 검증 완료
      </div>
      <div className="rounded-xl border border-[var(--ok)] bg-[var(--ok-soft)] p-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[var(--ok)]">증명된 명제</div>
        <ul className="mt-2 space-y-1.5">
          {[
            "기존 노트 생성",
            "음수 잔액 방지 검증",
            "중복 사용 방지 검증",
            "cm은 머클트리에 속해있음",
          ].map((s) => (
            <li key={s} className="flex items-start gap-1.5 text-[11px] text-[var(--ok)]">
              <span className="mt-0.5 shrink-0">✓</span><span>{s}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-2 flex flex-col gap-1.5">
        {[
          { label: "txHash",    value: "0x4e9a...d721" },
          { label: "Proof 크기", value: "2.1 KB" },
          { label: "검증 시간",  value: "< 1ms" },
        ].map((item) => (
          <div key={item.label}
            className="flex items-center justify-between rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5"
          >
            <span className="text-[11px] text-[var(--ink-2)]">{item.label}</span>
            <span className="font-mono text-[11px] text-[var(--ink)]">{item.value}</span>
          </div>
        ))}
      </div>
    </>
  );
}

const descriptions: Record<Phase, string> = {
  generating: "cm(비공개 잔고 레코드)을 선택하고 발신자·금액을 숨긴 영지식 증명을 생성합니다. 개인 잔고는 외부에 노출되지 않습니다.",
  complete:   "증명 검증이 완료되어 전송이 처리됐습니다. cm_new(수신자의 새 비공개 잔고 레코드)가 반영되고 기존 cm은 사용 완료 처리됩니다.",
};

const legends: Record<Phase, Array<{ color: string; label: string }>> = {
  generating: [
    { color: "var(--accent)", label: "사용 중인 cm1" },
    { color: "var(--line)",   label: "일반 노드" },
  ],
  complete: [
    { color: "var(--ok)",    label: "신규/변경" },
    { color: "var(--muted)", label: "spent" },
  ],
};

export function MerkleProcessView({ view }: Props) {
  const { phase } = view;

  return (
    <div className="space-y-3">
      <p className="text-[13px] leading-[1.6] text-[var(--ink-2)]">{descriptions[phase]}</p>

      <div className="grid grid-cols-2 gap-3">
        {/* Left: Merkle tree */}
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-2)]">
            Merkle Tree
          </div>
          <MerkleTree phase={phase} />
          <div className="mt-1 flex flex-wrap gap-2">
            {legends[phase].map((l) => (
              <span key={l.label} className="flex items-center gap-1 text-[9px] text-[var(--muted)]">
                <span className="inline-block h-2 w-2 rounded-full border"
                  style={{ backgroundColor: l.color, borderColor: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>

        {/* Right: ZK proof */}
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3">
          <ProofPanel phase={phase} />
        </div>
      </div>
    </div>
  );
}
