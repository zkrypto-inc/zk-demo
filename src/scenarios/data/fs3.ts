import { mockIds } from "@/mocks/ids";
import { mockAmounts } from "@/mocks/amounts";
import type { Scenario } from "@/scenarios/types";

export const scenarioFS3: Scenario = {
  id: "FS-3",
  name: "소각 요청",
  shortName: "소각",
  actor: "발행사 관리자",
  actorType: "web",
  mode: "issuer",
  summary: "소각 요청 생성 후 2인 승인을 거쳐 Wallet Service 서명으로 소각이 실행되는 흐름입니다.",
  screens: [
    {
      id: "FS3-1",
      layout: "form",
      title: "소각 요청 생성",
      subtitle: "소각 의도 정의 및 제출",
      status: "대기",
      sections: [
        {
          title: "소각 정보",
          fields: [
            { label: "소각 수량", value: mockAmounts.burnAmount },
            { label: "소각 사유", value: "상환 처리" },
            { label: "요청 ID", value: mockIds.burnRequestId },
          ],
        },
      ],
      actions: [{ id: "submit-burn", label: "소각 요청 생성", tone: "accent" }],
    },
    {
      id: "FS3-2",
      layout: "dashboard",
      title: "대상 수량 확인",
      subtitle: "소각 수량 검증",
      status: "진행 중",
      sections: [
        {
          title: "수량 확인",
          fields: [
            { label: "소각 수량", value: mockAmounts.burnAmount },
            { label: "현재 유통량", value: mockAmounts.issueAmount },
            { label: "소각 후 잔량", value: mockAmounts.circulatingAfterBurn },
          ],
        },
      ],
      actions: [{ id: "confirm-amount", label: "수량 확인 완료", tone: "accent" }],
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
            { label: "1차 승인자", value: "유현아 (준법감시인)" },
            { label: "상태", value: "검토 중", tone: "warn" },
            { label: "2차 승인자", value: "박지훈 (리스크)" },
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
            { label: "1차 승인 (유현아)", value: "완료", tone: "ok" },
            { label: "2차 승인자", value: "박지훈 (리스크)" },
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
      subtitle: "소각 실행 직전 보안 처리",
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
      subtitle: "소각 완료 및 이력 저장",
      status: "완료",
      sections: [
        {
          title: "소각 결과",
          fields: [
            { label: "소각 수량", value: mockAmounts.burnAmount, tone: "bad" },
            { label: "소각 후 잔량", value: mockAmounts.circulatingAfterBurn },
            { label: "Sign ID", value: mockIds.signId },
            { label: "요청 ID", value: mockIds.burnRequestId },
            { label: "상태", value: "소각 완료", tone: "ok" },
          ],
        },
      ],
    },
  ],
  steps: [
    {
      id: "FS3-S1",
      kind: "user-action",
      label: "소각 요청 생성",
      trigger: "user",
      ctaLabel: "소각 요청 생성",
      screenId: "FS3-1",
      description: "소각할 수량과 사유를 입력하여 소각 요청을 생성합니다. 발행과 동일한 승인 흐름이 적용됩니다.",
      processView: {
        kind: "overview",
        description: "어떤 수량을 어떤 이유로 소각할지 정의합니다. 발행과 유사하지만 반대 방향 흐름입니다.",
        cards: [
          { label: "소각 수량", value: mockAmounts.burnAmount },
          { label: "요청 ID", value: mockIds.burnRequestId },
          { label: "방향", value: "발행 ↔ 소각 대칭 흐름" },
        ],
      },
    },
    {
      id: "FS3-S2",
      kind: "user-action",
      label: "대상 수량 확인",
      trigger: "user",
      ctaLabel: "수량 확인 완료",
      screenId: "FS3-2",
      description: "소각 대상과 수량을 최종 확인합니다. 현재 유통량과 소각 후 잔량이 함께 표시됩니다.",
      processView: {
        kind: "overview",
        description: "소각 대상과 수량이 맞는지 확인합니다. 현재 유통량과 소각 후 잔량이 함께 표시됩니다.",
        cards: [
          { label: "현재 유통량", value: mockAmounts.issueAmount },
          { label: "소각 수량", value: mockAmounts.burnAmount, tone: "bad" },
          { label: "소각 후 잔량", value: mockAmounts.circulatingAfterBurn },
        ],
      },
    },
    {
      id: "FS3-S3",
      kind: "system-processing",
      label: "1차 승인",
      trigger: "user",
      ctaLabel: "1차 승인 완료 확인",
      screenId: "FS3-3",
      description: "1차 승인자가 소각 요청을 검토합니다. 승인 결과는 요청 이력에 즉시 반영됩니다.",
      processView: {
        kind: "approval",
        description: "소각 요청이 Approval Service의 첫 번째 승인 라인으로 전달되었습니다. 아직 서명 단계 전입니다.",
        approvers: [
          { name: "유현아", role: "준법감시인 (1차)", status: "approved" },
          { name: "박지훈", role: "리스크관리 (2차)", status: "waiting" },
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
        description: "두 번째 승인까지 완료되어야 소각 서명 요청이 열립니다. 운영 통제 모델이 발행과 대칭입니다.",
        approvers: [
          { name: "유현아", role: "준법감시인 (1차)", status: "approved" },
          { name: "박지훈", role: "리스크관리 (2차)", status: "pending", note: "검토 중" },
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
      description: "두 승인이 완료된 후 소각 실행을 위한 MPC 서명이 진행됩니다.",
      processView: {
        kind: "keygen",
        description: "소각 실행을 위한 보안 서명 단계가 진행됩니다. 기술 처리 전체보다 실행 전 상태를 강조합니다.",
        progress: 55,
        nodes: [
          { label: "Signer 1", value: "partial sig", tone: "ok" },
          { label: "Signer 2", value: "조합 중", tone: "warn" },
          { label: "Signer 3", value: "대기 중" },
        ],
      },
    },
    {
      id: "FS3-S6",
      kind: "result",
      label: "결과 기록",
      trigger: "auto",
      duration: 600,
      screenId: "FS3-6",
      description: "소각 결과가 기록되고 유통량이 갱신됩니다. 발행 대비 감소한 수량을 이력에서 확인할 수 있습니다.",
      processView: {
        kind: "audit",
        description: "소각 결과가 기록되고 이력으로 남습니다. 발행 대비 어떤 값이 감소했는지 확인할 수 있습니다.",
        logs: [
          `[완료] 소각 요청 생성 · req=${mockIds.burnRequestId}`,
          `[완료] 수량 확인 · ${mockAmounts.burnAmount}`,
          `[완료] 1차 승인 · 유현아`,
          `[완료] 2차 승인 · 박지훈`,
          `[완료] Wallet Service 서명 · sign=${mockIds.signId}`,
          `[완료] 소각 완료 · 잔량 ${mockAmounts.circulatingAfterBurn}`,
        ],
        summary: [
          { label: "소각 수량", value: mockAmounts.burnAmount, tone: "bad" },
          { label: "소각 후 잔량", value: mockAmounts.circulatingAfterBurn },
          { label: "상태", value: "소각 완료", tone: "ok" },
        ],
      },
    },
  ],
};
