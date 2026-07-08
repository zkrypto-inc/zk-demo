import type { Scenario } from "@/scenarios/types";

// zkVoting ZV-1 · 유권자 비밀투표 (스마트폰 웹).
// 출처: zkVoting 투표 프로세스 데모 v1.6 — 유권자(온라인) 시나리오.
// 본인확인·투표값 암호화·영지식증명 생성은 단말(client), 증명 검증·블록체인/DB 저장은 서버.

const seqActors = ["유권자 스마트폰", "서버", "블록체인"] as const;

const authEdge = { from: "유권자 스마트폰", to: "서버", label: "본인확인 · 자격확인(머클트리)" } as const;
const submitEdge = { from: "유권자 스마트폰", to: "서버", label: "암호화 투표 · 영지식증명 제출" } as const;
const verifyEdge = { from: "서버", to: "유권자 스마트폰", label: "영지식증명 검증(CRSv) · 검증 통과" } as const;
const storeEdge = { from: "서버", to: "블록체인", label: "블록체인 저장 → DB 저장" } as const;

export const scenarioZV1: Scenario = {
  id: "ZV-1",
  groupId: "zv-voter",
  name: "비밀투표 참여",
  shortName: "비밀투표",
  actor: "유권자 · 스마트폰 웹",
  actorType: "mobile",
  surface: "app",
  mode: "voter",
  summary:
    "유권자는 스마트폰 웹으로 본인확인 후 투표합니다. 투표값 암호화·영지식증명 생성은 단말에서, 증명 검증·블록체인/DB 저장은 서버에서 수행됩니다.",
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
      footer: "평문 투표값은 단말을 벗어나지 않습니다.",
    },
    {
      id: "ZV1-3",
      layout: "processing",
      title: "서버에서 검증 중",
      subtitle: "잠시만 기다려 주세요",
      status: "검증 중",
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
      status: "검증 완료 · 블록체인·DB에 저장",
      sections: [
        {
          title: "저장",
          fields: [
            { label: "저장 순서", value: "블록체인 → DB", tone: "accent" },
            { label: "상태", value: "저장 완료", tone: "ok" },
          ],
        },
      ],
      actions: [{ id: "to-done", label: "완료 화면", tone: "accent" }],
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
            { label: "영수증 · 시리얼넘버", value: "SN-7F3A-29C1-8E0B", tone: "accent" },
            { label: "블록체인 txHash", value: "0x9f3a4c…e21d77" },
            { label: "블록 높이", value: "#18,442,901" },
          ],
        },
      ],
      footer: "🔒 블록체인 기록으로 반영 여부는 확인되지만, 선택 내용은 공개되지 않습니다.",
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
      description:
        "스마트폰 웹에서 본인확인 정보를 입력해 본인확인에 성공합니다. 서버는 명부(머클트리)로 선거인 자격을 확인하고 증명 생성용 CRSp를 단말로 내려보냅니다.",
      processView: {
        kind: "sequence",
        actors: [...seqActors],
        activeEdge: { ...authEdge, tone: "accent" },
      },
    },
    {
      id: "ZV1-step-2",
      kind: "user-action",
      label: "투표 참여",
      trigger: "user",
      ctaLabel: "투표하기",
      screenId: "ZV1-2",
      description:
        "후보를 선택한 뒤 브라우저 안에서 투표값을 암호화하고(대칭키 MiMC7·CTR, 대칭키는 투표키로 ElGamal), 약정값(Pedersen)·시리얼넘버로 공개값을 만들어 영지식증명을 생성합니다. 모두 단말에서 수행됩니다.",
      processView: {
        kind: "sequence",
        actors: [...seqActors],
        activeEdge: { ...submitEdge, tone: "accent" },
        pastEdges: [authEdge],
      },
    },
    {
      id: "ZV1-step-3",
      kind: "system-processing",
      label: "서버 검증",
      trigger: "auto",
      duration: 2000,
      screenId: "ZV1-3",
      description:
        "서버가 공개값(statement)과 증명(proof)을 받아 CRSv로 영지식증명을 검증하고, 시리얼넘버로 이중투표 여부를 확인한 뒤 검증을 통과시킵니다. 평문 투표값은 공개되지 않습니다.",
      processView: {
        kind: "sequence",
        actors: [...seqActors],
        activeEdge: { ...verifyEdge, tone: "warn" },
        pastEdges: [authEdge, submitEdge],
      },
    },
    {
      id: "ZV1-step-4",
      kind: "system-processing",
      label: "블록체인·DB 저장",
      trigger: "auto",
      duration: 1200,
      screenId: "ZV1-4",
      description:
        "검증을 통과한 암호화 투표가 vote-submission 워커(Kafka)를 거쳐 ZKVote 컨트랙트로 블록체인에 먼저 저장되고, 이어 DB에 저장됩니다(블록체인 기준 저장으로 무결성 강화).",
      processView: {
        kind: "sequence",
        actors: [...seqActors],
        activeEdge: { ...storeEdge, tone: "ok" },
        pastEdges: [authEdge, submitEdge, verifyEdge],
      },
    },
    {
      id: "ZV1-step-5",
      kind: "result",
      label: "투표 완료",
      trigger: "auto",
      duration: 800,
      screenId: "ZV1-5",
      description:
        "완료 화면에서 블록체인 기록(txHash)·영수증(시리얼넘버)으로 본인 표의 반영 여부를 확인합니다. 무엇을 찍었는지는 드러나지 않습니다.",
      processView: {
        kind: "sequence",
        actors: [...seqActors],
        activeEdge: { ...storeEdge, tone: "ok" },
        pastEdges: [authEdge, submitEdge, verifyEdge],
      },
    },
  ],
};
