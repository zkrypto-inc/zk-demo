import { mockIds } from "@/mocks/ids";
import { mockAmounts } from "@/mocks/amounts";
import type { Scenario, SequenceContext } from "@/scenarios/types";

const seqActors = ["발행사 관리자", "스테이블코인 플랫폼", "zkWallet(Custody)"] as const;
const burnRequestEdge = { from: "발행사 관리자", to: "스테이블코인 플랫폼", label: "상환 요청" };

const burnRequestSeq = (): SequenceContext => ({
  actors: [...seqActors],
  activeEdge: { ...burnRequestEdge, tone: "accent" },
});

const signingSeq = (tone: "warn" | "ok"): SequenceContext => ({
  actors: [...seqActors],
  activeEdge: { from: "스테이블코인 플랫폼", to: "zkWallet(Custody)", label: "서명 요청", tone },
  pastEdges: [burnRequestEdge],
});

const resultSeq = (): SequenceContext => ({
  actors: [...seqActors],
  activeEdge: { from: "스테이블코인 플랫폼", to: "발행사 관리자", label: "상환 완료", tone: "ok" },
  pastEdges: [burnRequestEdge],
});

export const scenarioFS3: Scenario = {
  id: "FS-3",
  name: "상환 요청",
  shortName: "상환",
  actor: "발행사 관리자",
  actorType: "web",
  mode: "issuer",
  summary: "상환 요청 생성 후 2인 승인을 거쳐 Wallet Service 서명으로 상환이 실행되는 흐름입니다.",
  screens: [
    {
      id: "FS3-1",
      layout: "form",
      title: "상환 요청 생성",
      subtitle: "상환 요청",
      status: "대기",
      sections: [
        {
          title: "상환 정보",
          fields: [
            { label: "소각 수량", value: mockAmounts.burnAmount },
            { label: "코인 심볼", value: "KRW" },
          ],
        },
      ],
      actions: [{ id: "submit-burn", label: "상환 요청 생성", tone: "accent" }],
    },
    {
      id: "FS3-3",
      layout: "approval",
      title: "1차 승인 대기",
      subtitle: "Approval Service — 1차 검토",
      status: "승인 대기",
      sections: [
        {
          title: "승인 현황",
          fields: [
            { label: "1차 승인자", value: "발행사 관리자 1" },
            { label: "상태", value: "검토 중", tone: "warn" },
            { label: "2차 승인자", value: "발행사 관리자 2" },
            { label: "2차 상태", value: "대기 중" },
          ],
        },
      ],
      actions: [{ id: "confirm-1st", label: "1차 승인 완료 확인", tone: "accent" }],
    },
    {
      id: "FS3-4",
      layout: "approval",
      title: "2차 승인 대기",
      subtitle: "Approval Group 완료 조건",
      status: "승인 대기",
      sections: [
        {
          title: "승인 현황",
          fields: [
            { label: "1차 승인 (발행사 관리자 1)", value: "완료", tone: "ok" },
            { label: "2차 승인자", value: "발행사 관리자 2" },
            { label: "상태", value: "검토 중", tone: "warn" },
          ],
        },
      ],
      actions: [{ id: "confirm-2nd", label: "2차 승인 완료 확인", tone: "accent" }],
    },
    {
      id: "FS3-5",
      layout: "processing",
      title: "Wallet Service 서명 요청",
      subtitle: "상환 실행 직전 보안 처리",
      status: "처리 중",
      sections: [
        {
          title: "서명 진행",
          fields: [
            { label: "승인 상태", value: "2-of-2 완료", tone: "ok" },
            { label: "Sign ID", value: mockIds.signId },
            { label: "서명 상태", value: "생성 중", tone: "warn" },
          ],
        },
      ],
    },
    {
      id: "FS3-6",
      layout: "result",
      title: "결과 기록",
      subtitle: "상환 완료 및 이력 저장",
      status: "완료",
      sections: [
        {
          title: "상환 결과",
          fields: [
            { label: "소각 수량", value: mockAmounts.burnAmount, tone: "bad" },
            { label: "소각 후 잔량", value: mockAmounts.circulatingAfterBurn },
            { label: "코인 심볼", value: "KRW" },
          ],
        },
      ],
    },
  ],
  steps: [
    {
      id: "FS3-S1",
      kind: "user-action",
      label: "상환 요청 생성",
      trigger: "user",
      ctaLabel: "상환 요청 생성",
      screenId: "FS3-1",
      description: "상환할 수량을 입력하여 상환 요청을 생성합니다. 발행과 동일한 승인 흐름이 적용됩니다.",
      processView: {
        kind: "overview",
        description: "어떤 수량을 상환할지 정의합니다. 발행과 유사하지만 반대 방향 흐름입니다.",
        cards: [
          { label: "소각 수량", value: mockAmounts.burnAmount },
          { label: "코인 심볼", value: "KRW" },
        ],
        sequence: burnRequestSeq(),
      },
    },
    {
      id: "FS3-S3",
      kind: "system-processing",
      label: "1차 승인",
      trigger: "user",
      ctaLabel: "1차 승인 완료 확인",
      screenId: "FS3-3",
      description: "1차 승인자가 상환 요청을 검토합니다. 승인 결과는 요청 이력에 즉시 반영됩니다.",
      processView: {
        kind: "approval",
        description: "상환 요청이 Approval Service의 첫 번째 승인 라인으로 전달되었습니다. 아직 서명 단계 전입니다.",
        approvers: [
          { name: "발행사 관리자 1", role: "1차 승인", status: "approved" },
          { name: "발행사 관리자 2", role: "2차 승인", status: "waiting" },
        ],
      },
    },
    {
      id: "FS3-S4",
      kind: "system-processing",
      label: "2차 승인",
      trigger: "user",
      ctaLabel: "2차 승인 완료 확인",
      screenId: "FS3-4",
      description: "2차 승인자가 요청을 최종 검토합니다. 두 승인이 완료되면 서명 요청을 진행할 수 있습니다.",
      processView: {
        kind: "approval",
        description: "두 번째 승인까지 완료되어야 상환 서명 요청이 열립니다. 운영 통제 모델이 발행과 대칭입니다.",
        approvers: [
          { name: "발행사 관리자 1", role: "1차 승인", status: "approved" },
          { name: "발행사 관리자 2", role: "2차 승인", status: "pending", note: "검토 중" },
        ],
      },
    },
    {
      id: "FS3-S5",
      kind: "system-processing",
      label: "Wallet Service 서명 요청",
      trigger: "auto",
      duration: 1800,
      screenId: "FS3-5",
      description: "두 승인이 완료된 후 상환 실행을 위한 MPC 서명이 진행됩니다.",
      processView: {
        kind: "overview",
        description: "상환 실행을 위한 보안 서명 단계가 진행됩니다. 기술 처리 전체보다 실행 전 상태를 강조합니다.",
        cards: [
          { label: "승인 정책", value: "2-of-2 완료", tone: "ok" },
          { label: "서명 상태", value: "진행 중", tone: "warn" },
          { label: "처리 대상", value: "상환 실행" },
        ],
        sequence: signingSeq("warn"),
      },
    },
    {
      id: "FS3-S6",
      kind: "result",
      label: "결과 기록",
      trigger: "auto",
      duration: 600,
      screenId: "FS3-6",
      description: "상환 결과가 기록되고 유통량이 갱신됩니다. 발행 대비 감소한 수량을 이력에서 확인할 수 있습니다.",
      processView: {
        kind: "artifact",
        description: "상환 결과가 기록되고 이력으로 남습니다. 발행 대비 어떤 값이 감소했는지 확인할 수 있습니다.",
        items: [
          { label: "소각 수량", value: mockAmounts.burnAmount, tone: "bad" },
          { label: "소각 후 잔량", value: mockAmounts.circulatingAfterBurn },
          { label: "코인 심볼", value: "KRW" },
        ],
        sequence: resultSeq(),
      },
    },
  ],
};
