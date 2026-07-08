import type { Scenario } from "@/scenarios/types";

// zkVoting ZV-1 · 유권자 비밀투표 (스마트폰 웹).
// 출처: zkVoting 투표 프로세스 데모 v1.6 — 유권자(온라인) 시나리오. 모든 텍스트는 원본 HTML과 1:1 일치.

const seqActors = ["유권자 스마트폰", "서버", "블록체인"] as const;

const authEdge = { from: "유권자 스마트폰", to: "서버", label: "본인확인 · 자격확인(머클트리)" } as const;
const submitEdge = { from: "유권자 스마트폰", to: "서버", label: "암호화 투표 · 영지식증명 제출" } as const;
const verifyEdge = { from: "서버", to: "유권자 스마트폰", label: "영지식증명 검증(CRSv)" } as const;
const storeEdge = { from: "서버", to: "블록체인", label: "블록체인 저장 → DB 저장" } as const;

const TABLE_COLS = ["#", "단계", "구분", "설명", "목적"];

// 하단 안내 노트 — 원본 HTML 우측 하단 고정 안내 (verbatim).
const votingNote = [
  { label: "데모 데이터 안내", text: "조합명·후보·득표수·시리얼넘버·txHash 등은 모두 시연용 예시(가정)입니다." },
  { label: "처리 분담", text: "본인확인·투표값 암호화·영지식증명 생성은 스마트폰 web(클라이언트), 영지식증명 검증·블록체인 저장·DB 저장은 서버에서 수행됩니다." },
  { label: "비밀투표", text: "평문 투표값은 클라이언트를 떠나지 않으며, 개표 무결성은 Pedersen 동형으로 평문 비공개로 검증됩니다." },
  { label: "출처", text: "zkVoting 영지식증명 적용 설명 PPTX / 제품이해 노트." },
];

export const scenarioZV1: Scenario = {
  id: "ZV-1",
  groupId: "zv-voter",
  name: "비밀투표 참여",
  shortName: "비밀투표 참여",
  actor: "유권자 · 스마트폰 웹",
  actorType: "mobile",
  surface: "app",
  mode: "voter",
  summary:
    "유권자는 스마트폰 웹(브라우저)으로 투표합니다. 본인확인·투표값 암호화·영지식증명 생성은 스마트폰 web에서, 영지식증명 검증·블록체인 저장·DB 저장은 서버에서 처리됩니다.",
  note: votingNote,
  screens: [
    {
      id: "ZV1-1",
      layout: "form",
      title: "본인확인",
      subtitle: "2026 정기총회 — 이사장 선출",
      status: "본인확인 성공",
      sections: [
        {
          title: "본인확인 정보",
          fields: [
            { label: "이름", value: "홍○○" },
            { label: "생년월일", value: "19__-__-__" },
            { label: "휴대폰 인증번호", value: "______ ✓ 인증완료", tone: "ok" },
          ],
        },
      ],
      actions: [{ id: "to-vote", label: "다음 (투표 참여)", tone: "accent" }],
    },
    {
      id: "ZV1-2",
      layout: "vote",
      title: "이사장 선출",
      subtitle: "후보 1인을 선택하세요 · 비밀투표",
      vote: {
        question: "이사장 선출",
        hint: "후보 1인을 선택하세요 · 비밀투표",
        options: [
          { mark: "기호 1", name: "김○○", note: "현 사무국장" },
          { mark: "기호 2", name: "이○○", note: "전 이사", selected: true },
          { mark: "기호 3", name: "박○○", note: "감사위원" },
        ],
      },
      sections: [],
      actions: [{ id: "cast", label: "투표하기", tone: "accent" }],
    },
    {
      id: "ZV1-3",
      layout: "processing",
      title: "서버에서 검증 중…",
      subtitle: "잠시만 기다려 주세요",
      status: "처리 중",
      animateProcessing: true,
      sections: [
        {
          title: "검증 단계",
          fields: [
            { label: "공개값·증명 수신", value: "대기" },
            { label: "영지식증명 검증(CRSv)", value: "대기" },
            { label: "이중투표 확인(시리얼넘버)", value: "대기" },
            { label: "검증 통과", value: "대기" },
          ],
        },
      ],
    },
    {
      id: "ZV1-4",
      layout: "result",
      title: "투표 성공",
      status: "검증 완료 · 블록체인·DB에 안전하게 저장됩니다",
      sections: [],
    },
    {
      id: "ZV1-5",
      layout: "result",
      title: "투표가 완료되었습니다",
      subtitle: "2026 정기총회 — 이사장 선출",
      status: "투표가 완료되었습니다",
      sections: [
        {
          title: "블록체인 기록",
          fields: [
            { label: "블록체인 txHash", value: "0x9f3a4c…e21d77" },
            { label: "블록 높이", value: "#18,442,901" },
            { label: "영수증 · 시리얼넘버", value: "SN-7F3A-29C1-8E0B", tone: "accent" },
          ],
        },
      ],
      footer: "블록체인 기록 확인 · 🔒 선택 내용 비공개",
    },
  ],
  steps: [
    {
      id: "ZV1-step-1",
      kind: "user-action",
      label: "본인확인",
      trigger: "user",
      ctaLabel: "다음 (투표 참여)",
      screenId: "ZV1-1",
      description: "유권자가 스마트폰 웹에서 본인확인 정보를 입력하고 본인확인에 성공합니다",
      processView: {
        kind: "overview",
        description:
          "스마트폰 웹에서 본인확인 정보를 입력해 본인확인에 성공합니다. 서버는 명부(머클트리) 기반으로 선거인 자격을 확인하고, 증명 생성용 CRSp가 단말로 다운로드됩니다.",
        compareTable: {
          title: "순서도 단계 설명",
          columns: TABLE_COLS,
          pillColumn: 2,
          rows: [
            ["1", "본인확인 정보입력", "스마트폰 web", "이름·생년월일·휴대폰 인증번호를 입력합니다.", "본인 식별 정보 수집"],
            ["2", "본인확인 성공", "스마트폰 web", "본인확인이 완료됩니다(서버는 명부 머클트리로 자격을 확인하고 CRSp를 단말로 내려보냄).", "본인 확인(서버는 머클트리로 자격 검증)"],
          ],
        },
        cards: [
          { label: "인터페이스", value: "스마트폰 web" },
          { label: "본인확인", value: "성공", tone: "ok" },
          { label: "자격 확인", value: "머클트리" },
        ],
        sequence: { actors: [...seqActors], activeEdge: { ...authEdge, tone: "accent" } },
      },
    },
    {
      id: "ZV1-step-2",
      kind: "user-action",
      label: "투표참여",
      trigger: "user",
      ctaLabel: "투표하기",
      screenId: "ZV1-2",
      description: "유권자가 투표한 뒤, 브라우저에서 투표값을 암호화하고 영지식증명을 생성합니다",
      processView: {
        kind: "overview",
        description:
          "후보 선택(투표참여) 후 브라우저 안에서 투표값을 암호화하고(대칭키 MiMC7 해시·CTR 모드, 대칭키는 투표키로 ElGamal), 약정값(Pedersen)·시리얼넘버로 공개값(statement)을 만든 뒤, witness·statement·CRSp로 영지식증명(proof)을 생성합니다. 모두 클라이언트에서 수행됩니다.",
        compareTable: {
          title: "순서도 단계 설명",
          columns: TABLE_COLS,
          pillColumn: 2,
          rows: [
            ["1", "투표참여", "스마트폰 web", "후보를 선택해 투표합니다(평문은 단말에만 보관).", "선거인 의사 표시"],
            ["2", "투표값 암호화", "스마트폰 web", "대칭키(MiMC7·CTR)로 투표값을, 대칭키는 투표키(ElGamal)로 암호화합니다.", "평문 은닉(비밀투표)"],
            ["3", "영지식증명 생성", "스마트폰 web", "약정값(Pedersen)·시리얼넘버로 공개값을 만들고 CRSp로 영지식증명을 생성합니다.", "평문 공개 없이 표 정당성 증명"],
          ],
        },
        cards: [
          { label: "인터페이스", value: "스마트폰 web" },
          { label: "암호화", value: "MiMC7·CTR·ElGamal", tone: "accent" },
          { label: "증명 생성", value: "CRSp→proof", tone: "ok" },
        ],
        sequence: { actors: [...seqActors], activeEdge: { ...submitEdge, tone: "accent" }, pastEdges: [authEdge] },
      },
    },
    {
      id: "ZV1-step-3",
      kind: "system-processing",
      label: "처리중",
      trigger: "auto",
      duration: 2000,
      screenId: "ZV1-3",
      description: "서버가 제출된 공개값과 증명을 단계적으로 검증합니다",
      processView: {
        kind: "overview",
        description:
          "서버가 공개값(statement)과 증명(proof)을 받아 CRSv로 영지식증명을 검증하고, 시리얼넘버로 이중투표 여부를 확인한 뒤 검증을 통과시킵니다. 평문 투표값은 공개되지 않습니다.",
        compareTable: {
          title: "순서도 단계 설명",
          columns: TABLE_COLS,
          pillColumn: 2,
          rows: [
            ["1", "공개값·증명 수신", "서버", "서버가 공개값(statement)과 증명(proof)을 받습니다.", "검증 입력 확보"],
            ["2", "영지식증명 검증(CRSv)", "서버", "CRSv로 영지식증명이 올바른지 검증합니다.", "표 유효성 확인"],
            ["3", "이중투표 확인(시리얼넘버)", "서버", "시리얼넘버로 이중투표 여부를 확인합니다.", "1인 1표 보장"],
            ["4", "검증 통과", "서버", "검증을 통과시킵니다(평문 비공개).", "유효표 확정"],
          ],
        },
        cards: [
          { label: "처리 위치", value: "서버" },
          { label: "검증", value: "영지식증명(CRSv)", tone: "ok" },
          { label: "이중투표", value: "시리얼넘버 확인" },
        ],
        sequence: { actors: [...seqActors], activeEdge: { ...verifyEdge, tone: "warn" }, pastEdges: [authEdge, submitEdge] },
      },
    },
    {
      id: "ZV1-step-4",
      kind: "system-processing",
      label: "투표성공",
      trigger: "auto",
      duration: 1200,
      screenId: "ZV1-4",
      description: "검증된 투표가 블록체인에 저장된 뒤 DB에 저장됩니다",
      processView: {
        kind: "overview",
        description:
          "검증을 통과한 암호화 투표가 vote-submission 워커(Kafka)를 거쳐 ZKVote 컨트랙트로 블록체인에 먼저 저장되고, 이어 DB에 저장됩니다(블록체인 기준 저장으로 무결성 강화). 서버에서 수행됩니다.",
        compareTable: {
          title: "순서도 단계 설명",
          columns: TABLE_COLS,
          pillColumn: 2,
          rows: [
            ["1", "블록체인 저장", "서버", "vote-submission 워커가 ZKVote 컨트랙트로 블록체인에 먼저 저장합니다.", "위·변조 불가 기록 확보"],
            ["2", "DB 저장", "서버", "이어 DB에 저장해 무결성을 강화합니다(블록체인 기준 저장).", "블록체인 기준 저장으로 무결성 강화"],
          ],
        },
        cards: [
          { label: "처리 위치", value: "서버" },
          { label: "저장 순서", value: "블록체인 → DB", tone: "accent" },
          { label: "상태", value: "저장 완료", tone: "ok" },
        ],
        sequence: { actors: [...seqActors], activeEdge: { ...storeEdge, tone: "ok" }, pastEdges: [authEdge, submitEdge, verifyEdge] },
      },
    },
    {
      id: "ZV1-step-5",
      kind: "result",
      label: "투표완료",
      trigger: "auto",
      duration: 800,
      screenId: "ZV1-5",
      description: "유권자가 완료 화면에서 블록체인 기록 정보를 확인합니다",
      processView: {
        kind: "overview",
        description:
          "투표 완료 화면에서 블록체인 기록 정보(txHash 등)와 영수증(시리얼넘버)을 확인합니다. 이 정보로 본인 표의 반영 여부를 확인할 수 있으나, 무엇을 찍었는지는 드러나지 않습니다.",
        compareTable: {
          title: "순서도 단계 설명",
          columns: TABLE_COLS,
          pillColumn: 2,
          rows: [
            ["1", "투표완료 화면", "스마트폰 web", "투표가 정상 제출됐음을 안내합니다.", "제출 완료 안내"],
            ["2", "블록체인 정보", "스마트폰 web", "블록체인 기록(txHash)·영수증(시리얼넘버)으로 반영 여부를 확인합니다(선택 내용 비공개).", "기록 추적 기준점(선택 내용 비공개)"],
          ],
        },
        cards: [
          { label: "인터페이스", value: "스마트폰 web" },
          { label: "블록체인 정보", value: "txHash 제공" },
          { label: "시리얼넘버", value: "SN-7F3A-29C1" },
        ],
        sequence: { actors: [...seqActors], activeEdge: { ...storeEdge, tone: "ok" }, pastEdges: [authEdge, submitEdge, verifyEdge] },
      },
    },
  ],
};
