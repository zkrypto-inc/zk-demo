import type { Scenario } from "@/scenarios/types";

// zkVoting ZO-1 · 운영자(주최측) 투표 개설·개표 운영 (웹 콘솔).
// 출처: zkVoting 투표 프로세스 데모 v1.6 — 운영자(주최측) 시나리오. 모든 텍스트는 원본 HTML과 1:1 일치.

const seqActors = ["운영자 콘솔", "서버", "블록체인"] as const;

const openEdge = { from: "운영자 콘솔", to: "서버", label: "개표키·투표키·CRS 생성" } as const;
const rollEdge = { from: "서버", to: "블록체인", label: "명부 머클트리 루트 저장" } as const;
const tallyEdge = { from: "서버", to: "블록체인", label: "증명 전체 재검증 → 복호화·집계 → 결과 저장" } as const;
const verifyEdge = { from: "서버", to: "운영자 콘솔", label: "Pedersen 동형 개표 무결성 검증" } as const;

const TABLE_COLS = ["#", "단계", "구분", "설명", "목적"];

const votingNote = [
  { label: "데모 데이터 안내", text: "조합명·후보·득표수·시리얼넘버·txHash 등은 모두 시연용 예시(가정)입니다." },
  { label: "처리 분담", text: "본인확인·투표값 암호화·영지식증명 생성은 스마트폰 web(클라이언트), 영지식증명 검증·블록체인 저장·DB 저장은 서버에서 수행됩니다." },
  { label: "비밀투표", text: "평문 투표값은 클라이언트를 떠나지 않으며, 개표 무결성은 Pedersen 동형으로 평문 비공개로 검증됩니다." },
  { label: "출처", text: "zkVoting 영지식증명 적용 설명 PPTX / 제품이해 노트." },
];

const tallyRows = [
  { mark: "기호 1", votes: "612표", pct: 49 },
  { mark: "기호 2", votes: "401표", pct: 32 },
  { mark: "기호 3", votes: "227표", pct: 19 },
];

export const scenarioZO1: Scenario = {
  id: "ZO-1",
  groupId: "zv-operator",
  name: "투표 개설·개표 운영",
  shortName: "투표 개설·개표 운영",
  actor: "운영자(주최측) · 웹 콘솔",
  actorType: "web",
  surface: "web",
  mode: "operator",
  summary:
    "운영자(주최측)는 웹 콘솔에서 투표를 개설하고 명부를 머클트리로 고정한 뒤, 종료 후 개표·개표 무결성 검증을 수행하고 검증 내역을 외부 설명자료로 내려받습니다.",
  note: votingNote,
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
            { label: "개표키", value: "난수 생성 · 분할 개표키 옵션 ON" },
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
          title: "선거인 명부 업로드",
          fields: [
            { label: "명부 파일", value: "정조합원_명부.xlsx (1,240명)" },
            { label: "유효성 체크", value: "중복·누락·규칙 검사 통과 1,240/1,240", tone: "ok" },
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
        caption: "자동 마감 완료 · 참여 1,105 · 개표 결과 (예시)",
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
      actions: [{ id: "download-verify", label: "검증 내역 파일 다운로드", tone: "accent" }],
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
      description: "운영자가 투표명·기간·검증옵션을 입력해 투표를 개설합니다",
      processView: {
        kind: "overview",
        description:
          "운영자 콘솔에서 투표명·기간·검증옵션을 입력해 투표를 개설합니다. 서버가 개표키(난수)·투표키(개표키 ElGamal 암호화)·CRS(증명용 CRSp/검증용 CRSv)를 생성합니다. 안건·후보 구성과 명부 등록은 별도 단계에서 진행합니다.",
        compareTable: {
          title: "순서도 단계 설명",
          columns: TABLE_COLS,
          pillColumn: 2,
          rows: [
            ["1", "투표명·기간·검증옵션 입력", "운영자 web", "투표명·기간·검증옵션을 입력합니다.", "선거 규칙 설정"],
            ["2", "개설 요청", "운영자 web", "개설을 요청합니다.", "선거 개설"],
            ["3", "개표키·투표키·CRS 생성", "서버", "서버가 개표키(난수)·투표키(개표키 ElGamal)·CRS(CRSp/CRSv)를 생성합니다.", "암호화·개표·증명용 키/설정 준비"],
          ],
        },
        cards: [
          { label: "인터페이스", value: "운영자 web" },
          { label: "키 / CRS", value: "개표키·투표키·CRS", tone: "accent" },
          { label: "명부 등록", value: "다음 단계" },
        ],
        sequence: { actors: [...seqActors], activeEdge: { ...openEdge, tone: "accent" } },
      },
    },
    {
      id: "ZO1-step-2",
      kind: "system-processing",
      label: "명부 등록",
      trigger: "user",
      ctaLabel: "명부 마감",
      screenId: "ZO1-2",
      description: "명부를 업로드하면 서버가 머클트리로 만들어 블록체인에 저장합니다",
      processView: {
        kind: "overview",
        description:
          "유권자 명부를 업로드하면 서버가 명부를 머클트리로 구성해 루트를 블록체인에 저장합니다. 저장 후에는 명부를 위·변조할 수 없으며, 이 머클트리가 이후 유권자 자격 증명(membership)의 기준이 됩니다.",
        compareTable: {
          title: "순서도 단계 설명",
          columns: TABLE_COLS,
          pillColumn: 2,
          rows: [
            ["1", "명부 업로드", "운영자 web", "유권자 명부를 업로드합니다.", "정확한 선거인 명단 확보"],
            ["2", "머클트리 생성", "서버", "공개키를 해시로 묶어 머클트리를 생성합니다.", "명부를 검증 가능한 구조로 구성"],
            ["3", "블록체인 저장", "서버", "머클트리 루트를 블록체인에 저장합니다(명부 위·변조 방지).", "명부 위·변조 방지"],
          ],
        },
        diagram: "merkle-roll",
        cards: [
          { label: "대상 명부", value: "정조합원 1,240명" },
          { label: "머클트리 루트", value: "블록체인 저장", tone: "ok" },
          { label: "자격 기준", value: "머클트리", tone: "accent" },
        ],
        sequence: { actors: [...seqActors], activeEdge: { ...rollEdge, tone: "accent" }, pastEdges: [openEdge] },
      },
    },
    {
      id: "ZO1-step-3",
      kind: "system-processing",
      label: "개표",
      trigger: "user",
      ctaLabel: "개표 실행",
      screenId: "ZO1-3",
      description: "개표 전 전체 영지식증명 재검증 후, 개표키로 복호화해 집계합니다",
      processView: {
        kind: "overview",
        description:
          "개표를 시작하면 서버가 블록체인에 기록된 암호화 투표값 전체를 영지식증명으로 다시 검증합니다(개표 무결성 확인 목적). 통과 시 개표키(분할 옵션 사용 시 분할키 조합)로 복호화해 집계하고, 개표 결과를 블록체인에 저장합니다.",
        compareTable: {
          title: "순서도 단계 설명",
          columns: TABLE_COLS,
          pillColumn: 2,
          rows: [
            ["1", "개표 시작", "운영자 web", "운영자가 개표를 시작합니다.", "집계 개시"],
            ["2", "영지식증명 전체 재검증", "서버", "블록체인의 암호화 투표값 전체를 영지식증명으로 다시 검증합니다.", "개표 전 모든 표 유효성 재확인"],
            ["3", "개표키 복호화·집계", "서버", "개표키(분할키 조합)로 복호화해 집계합니다.", "권한 분산 하 결과 산출"],
            ["4", "결과 블록체인 저장", "서버", "개표 결과를 블록체인에 저장합니다.", "결과 위·변조 방지"],
          ],
        },
        cards: [
          { label: "인터페이스", value: "운영자 web" },
          { label: "개표 전 재검증", value: "영지식증명 전체", tone: "ok" },
          { label: "개표키", value: "분할키 조합 복호화" },
        ],
        sequence: { actors: [...seqActors], activeEdge: { ...tallyEdge, tone: "warn" }, pastEdges: [openEdge, rollEdge] },
      },
    },
    {
      id: "ZO1-step-4",
      kind: "result",
      label: "무결성 검증",
      trigger: "auto",
      duration: 1200,
      screenId: "ZO1-4",
      description: "투표값을 공개하지 않고 Pedersen 동형으로 개표 무결성을 검증합니다",
      processView: {
        kind: "overview",
        description:
          "개표 무결성은 서버가 Pedersen Commitment 덧셈 동형으로 평문 투표값을 공개하지 않고 개표 전후 약정값 일치를 증명해 검증합니다. 운영자는 검증 내역(증명값·블록체인 기록·검증 절차)을 파일로 내려받아 이의제기·소송 시 외부 설명자료로 제출할 수 있습니다.",
        compareTable: {
          title: "순서도 단계 설명",
          columns: TABLE_COLS,
          pillColumn: 2,
          rows: [
            ["1", "검증 내역 조회", "운영자 web", "검증 내역을 조회합니다.", "무결성 검증 수행"],
            ["2", "검증 파일 다운로드", "운영자 web", "검증 결과를 파일로 내려받습니다(분쟁 대응 자료).", "분쟁 대응 외부 자료 확보"],
            ["3", "Pedersen 동형 개표 무결성 검증", "서버", "서버가 Pedersen 동형으로 평문 공개 없이 개표 전후 약정값 일치를 검증합니다.", "투표값 공개 없이 개표 정합성 증명"],
          ],
        },
        cards: [
          { label: "개표 무결성", value: "Pedersen 동형 일치", tone: "ok" },
          { label: "평문 공개", value: "없음", tone: "accent" },
          { label: "검증 파일", value: "다운로드 가능", tone: "ok" },
        ],
        sequence: { actors: [...seqActors], activeEdge: { ...verifyEdge, tone: "ok" }, pastEdges: [openEdge, rollEdge, tallyEdge] },
      },
    },
  ],
};
