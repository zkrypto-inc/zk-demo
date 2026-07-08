import type { Scenario } from "@/scenarios/types";

// zkVoting ZO-1 · 운영자(주최측) 투표 개설·개표 운영 (웹 콘솔).
// 출처: zkVoting 투표 프로세스 데모 v1.6 — 운영자(주최측) 시나리오.

const seqActors = ["운영자 콘솔", "서버", "블록체인"] as const;

const openEdge = { from: "운영자 콘솔", to: "서버", label: "개표키·투표키·CRS 생성" } as const;
const rollEdge = { from: "서버", to: "블록체인", label: "명부 머클트리 루트 저장" } as const;
const tallyEdge = { from: "서버", to: "블록체인", label: "증명 전체 재검증 → 복호화·집계 → 결과 저장" } as const;
const verifyEdge = { from: "서버", to: "운영자 콘솔", label: "Pedersen 동형 개표 무결성 검증" } as const;

const tallyRows = [
  { mark: "기호 1", votes: "612표", pct: 49 },
  { mark: "기호 2", votes: "401표", pct: 32 },
  { mark: "기호 3", votes: "227표", pct: 19 },
];

export const scenarioZO1: Scenario = {
  id: "ZO-1",
  groupId: "zv-operator",
  name: "투표 개설·개표 운영",
  shortName: "개설·개표",
  actor: "운영자(주최측) · 웹 콘솔",
  actorType: "web",
  surface: "web",
  mode: "operator",
  summary:
    "운영자는 웹 콘솔에서 투표를 개설하고 명부를 머클트리로 고정한 뒤, 종료 후 개표·개표 무결성 검증을 수행하고 검증 내역을 외부 설명자료로 내려받습니다.",
  screens: [
    {
      id: "ZO1-1",
      layout: "form",
      title: "투표 개설",
      subtitle: "투표 설정",
      status: "설정",
      sections: [
        {
          title: "투표 기본 정보",
          fields: [
            { label: "투표명", value: "2026 정기총회 — 이사장 선출" },
            { label: "투표 기간", value: "2026-06-15 09:00 ~ 06-16 18:00" },
            { label: "검증 옵션", value: "비밀투표 + 공개검증 ON", tone: "accent" },
            { label: "개표키", value: "난수 생성 · 분할 개표키 ON" },
          ],
        },
      ],
      actions: [{ id: "open-election", label: "투표 개설", tone: "accent" }],
    },
    {
      id: "ZO1-2",
      layout: "form",
      title: "명부 등록",
      subtitle: "투표 설정",
      status: "명부",
      sections: [
        {
          title: "선거인 명부",
          fields: [
            { label: "명부 업로드", value: "정조합원_명부.xlsx (1,240명)" },
            { label: "유효성 검사", value: "중복·누락·규칙 통과 1,240/1,240", tone: "ok" },
          ],
        },
      ],
      actions: [{ id: "finalize-roll", label: "명부 마감", tone: "accent" }],
    },
    {
      id: "ZO1-3",
      layout: "tally",
      title: "개표",
      subtitle: "종료 2026-06-16 18:00",
      status: "개표",
      sections: [],
      tally: {
        caption: "투표 마감 · 참여 1,105 (예시)",
        rows: tallyRows,
      },
      actions: [{ id: "run-tally", label: "개표 실행", tone: "accent" }],
    },
    {
      id: "ZO1-4",
      layout: "tally",
      title: "개표 무결성 검증 · ZV-1",
      subtitle: "종료 2026-06-16 18:00",
      status: "검증",
      sections: [],
      tally: {
        caption: "집계 결과 · 총 투표 1,105 (예시)",
        rows: tallyRows,
        verification: {
          title: "개표 무결성 검증 성공",
          lines: [
            "commit_sum : 개표 전후 약정값 일치",
            "zkp_revote_check : VALID (전체 재검증)",
            "ballots_on_chain : 1,105 / 명부 1,240",
            "평문 투표값 공개 : 없음 (Pedersen 동형)",
          ],
        },
        badges: [
          { label: "조작 없음 검증됨", tone: "ok" },
          { label: "🔒 개별 평문 비공개", tone: "accent" },
        ],
      },
    },
  ],
  steps: [
    {
      id: "ZO1-step-1",
      kind: "user-action",
      label: "투표 개설",
      trigger: "user",
      ctaLabel: "투표 개설",
      screenId: "ZO1-1",
      description:
        "투표명·기간·검증옵션을 입력해 투표를 개설합니다. 서버가 개표키(난수)·투표키(개표키 ElGamal 암호화)·CRS(증명용 CRSp/검증용 CRSv)를 생성합니다.",
      processView: {
        kind: "sequence",
        actors: [...seqActors],
        activeEdge: { ...openEdge, tone: "accent" },
      },
    },
    {
      id: "ZO1-step-2",
      kind: "system-processing",
      label: "명부 등록",
      trigger: "user",
      ctaLabel: "명부 마감",
      screenId: "ZO1-2",
      description:
        "명부를 업로드하면 서버가 공개키를 해시로 묶어 머클트리를 구성하고 루트를 블록체인에 저장합니다. 저장 후에는 명부를 위·변조할 수 없으며, 이 머클트리가 이후 유권자 자격 증명의 기준이 됩니다.",
      processView: {
        kind: "merkle",
        phase: "complete",
        sequence: {
          actors: [...seqActors],
          activeEdge: { ...rollEdge, tone: "accent" },
          pastEdges: [openEdge],
        },
      },
    },
    {
      id: "ZO1-step-3",
      kind: "system-processing",
      label: "개표",
      trigger: "user",
      ctaLabel: "개표 실행",
      screenId: "ZO1-3",
      description:
        "개표를 시작하면 서버가 블록체인의 암호화 투표값 전체를 영지식증명으로 다시 검증합니다(개표 무결성 확인). 통과 시 개표키(분할키 조합)로 복호화해 집계하고, 결과를 블록체인에 저장합니다.",
      processView: {
        kind: "sequence",
        actors: [...seqActors],
        activeEdge: { ...tallyEdge, tone: "warn" },
        pastEdges: [openEdge, rollEdge],
      },
    },
    {
      id: "ZO1-step-4",
      kind: "result",
      label: "무결성 검증",
      trigger: "auto",
      duration: 1200,
      screenId: "ZO1-4",
      description:
        "개표 무결성은 서버가 Pedersen Commitment 덧셈 동형으로 평문 투표값을 공개하지 않고 개표 전후 약정값 일치를 증명해 검증합니다. 운영자는 검증 내역을 파일로 내려받아 이의제기·소송 시 외부 설명자료로 제출할 수 있습니다.",
      processView: {
        kind: "sequence",
        actors: [...seqActors],
        activeEdge: { ...verifyEdge, tone: "ok" },
        pastEdges: [openEdge, rollEdge, tallyEdge],
      },
    },
  ],
};
