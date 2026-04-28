import { mockIds } from "@/mocks/ids";
import { mockAmounts } from "@/mocks/amounts";
import type { Scenario } from "@/scenarios/types";

export const scenarioFS2: Scenario = {
  id: "FS-2",
  name: "발행 요청",
  shortName: "발행",
  actor: "발행사 관리자",
  actorType: "web",
  mode: "issuer",
  summary: "발행 요청 생성 후 2인 승인을 거쳐 Wallet Service 서명 연계로 발행이 실행되는 흐름입니다.",
  screens: [
    {
      id: "FS2-1",
      layout: "form",
      title: "발행 요청 생성",
      subtitle: "발행 의도 정의 및 제출",
      status: "대기",
      sections: [
        {
          title: "발행 정보",
          fields: [
            { label: "발행 수량", value: mockAmounts.issueAmount },
            { label: "발행일자", value: "2026-05-01" },
            { label: "요청 ID", value: mockIds.issueRequestId },
            { label: "사유", value: "1분기 유동성 공급" },
          ],
        },
      ],
      actions: [{ id: "submit-mint", label: "발행 요청 생성", tone: "accent" }],
    },
    {
      id: "FS2-2",
      layout: "form",
      title: "준비금 내역 등록",
      subtitle: "발행 요청과 준비금 연결",
      status: "진행 중",
      sections: [
        {
          title: "준비금 정보",
          fields: [
            { label: "준비금 총액", value: mockAmounts.reserveAmount },
            { label: "발행 수량", value: mockAmounts.issueAmount },
            { label: "증빙 파일", value: "reserve_report_Q1.pdf" },
            { label: "연결 상태", value: "매핑 완료", tone: "ok" },
          ],
        },
      ],
      actions: [{ id: "confirm-reserve", label: "준비금 등록 완료", tone: "accent" }],
    },
    {
      id: "FS2-3",
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
      id: "FS2-4",
      layout: "approval",
      title: "2차 승인 대기",
      subtitle: "Approval Group 완료 조건 확인",
      status: "승인 대기",
      sections: [
        {
          title: "승인 현황",
          fields: [
            { label: "1차 승인 (유현아)", value: "완료", tone: "ok" },
            { label: "2차 승인자", value: "박지훈 (리스크)" },
            { label: "상태", value: "검토 중", tone: "warn" },
            { label: "Approval Group", value: "2-of-2 (1/2 완료)" },
          ],
        },
      ],
      actions: [{ id: "confirm-2nd", label: "2차 승인 완료 확인", tone: "accent" }],
    },
    {
      id: "FS2-5",
      layout: "processing",
      title: "Wallet Service 서명 요청",
      subtitle: "승인 완료 — 실행 단계",
      status: "처리 중",
      sections: [
        {
          title: "서명 진행",
          fields: [
            { label: "승인 상태", value: "2-of-2 완료", tone: "ok" },
            { label: "Sign ID", value: mockIds.signId },
            { label: "서명 상태", value: "생성 중", tone: "warn" },
            { label: "요청 ID", value: mockIds.issueRequestId },
          ],
        },
      ],
    },
    {
      id: "FS2-6",
      layout: "result",
      title: "발행 실행 / 결과 기록",
      subtitle: "발행 완료 및 이력 저장",
      status: "완료",
      sections: [
        {
          title: "발행 결과",
          fields: [
            { label: "발행 수량", value: mockAmounts.issueAmount, tone: "ok" },
            { label: "Sign ID", value: mockIds.signId },
            { label: "요청 ID", value: mockIds.issueRequestId },
            { label: "Audit Event ID", value: mockIds.auditEventId },
            { label: "상태", value: "발행 완료", tone: "ok" },
          ],
        },
      ],
    },
  ],
  steps: [
    {
      id: "FS2-S1",
      kind: "user-action",
      label: "발행 요청 생성",
      trigger: "user",
      ctaLabel: "발행 요청 생성",
      screenId: "FS2-1",
      description: "사용자는 이 단계에서 발행 의도를 만들고 제출 준비를 합니다.",
      processView: {
        kind: "overview",
        description: "어떤 발행을 요청하는지 정의합니다. 아직 승인 전이며 요청 객체를 만드는 단계입니다.",
        cards: [
          { label: "발행 수량", value: mockAmounts.issueAmount },
          { label: "요청 ID", value: mockIds.issueRequestId },
          { label: "단계", value: "요청 생성" },
        ],
      },
    },
    {
      id: "FS2-S2",
      kind: "user-action",
      label: "준비금 내역 등록",
      trigger: "user",
      ctaLabel: "준비금 등록 완료",
      screenId: "FS2-2",
      description: "발행 요청과 준비금 증빙 정보를 연결합니다. 등록 완료 후 승인 단계로 진행합니다.",
      processView: {
        kind: "overview",
        description: "발행 요청과 준비금 내역이 연결됩니다. 금액과 증빙이 일치하는지 확인하는 단계입니다.",
        cards: [
          { label: "준비금 총액", value: mockAmounts.reserveAmount },
          { label: "발행 수량", value: mockAmounts.issueAmount },
          { label: "연결 상태", value: "매핑 완료", tone: "ok" },
        ],
      },
    },
    {
      id: "FS2-S3",
      kind: "system-processing",
      label: "1차 승인",
      trigger: "user",
      ctaLabel: "1차 승인 완료 확인",
      screenId: "FS2-3",
      description: "이 단계의 핵심은 업무 승인이 먼저 진행된다는 점을 보여주는 것입니다.",
      processView: {
        kind: "approval",
        description: "요청이 Approval Service로 전달되고 첫 번째 승인자 검토가 시작됩니다. 아직 Wallet Service 서명 단계로는 넘어가지 않습니다.",
        approvers: [
          { name: "유현아", role: "준법감시인 (1차)", status: "approved" },
          { name: "박지훈", role: "리스크관리 (2차)", status: "waiting" },
        ],
      },
    },
    {
      id: "FS2-S4",
      kind: "system-processing",
      label: "2차 승인",
      trigger: "user",
      ctaLabel: "2차 승인 완료 확인",
      screenId: "FS2-4",
      description: "두 명의 승인이 모두 끝나야 다음 단계의 Wallet Service 서명 요청으로 넘어갑니다.",
      processView: {
        kind: "approval",
        description: "두 번째 승인자까지 승인해야 서명 요청이 열립니다. 준법 또는 리스크 관점의 최종 확인 단계입니다.",
        approvers: [
          { name: "유현아", role: "준법감시인 (1차)", status: "approved" },
          { name: "박지훈", role: "리스크관리 (2차)", status: "pending", note: "검토 중" },
        ],
      },
    },
    {
      id: "FS2-S5",
      kind: "system-processing",
      label: "Wallet Service 서명 요청",
      trigger: "auto",
      duration: 1800,
      screenId: "FS2-5",
      description: "사용자는 이 단계를 실행 직전 보안 처리 정도로 이해하면 충분합니다.",
      processView: {
        kind: "keygen",
        description: "승인 완료 후 발행 실행을 위한 보안 서명 단계가 진행됩니다. SC Lifecycle이 Wallet Service에 전자서명 요청을 보냅니다.",
        progress: 65,
        nodes: [
          { label: "Signer 1", value: "partial sig", tone: "ok" },
          { label: "Signer 2", value: "partial sig", tone: "ok" },
          { label: "Signer 3", value: "조합 중", tone: "warn" },
        ],
      },
    },
    {
      id: "FS2-S6",
      kind: "result",
      label: "발행 실행 / 결과 기록",
      trigger: "auto",
      duration: 600,
      screenId: "FS2-6",
      description: "마지막 단계에서는 발행 성공 여부와 이력 저장을 함께 보여줘야 합니다.",
      processView: {
        kind: "audit",
        description: "발행이 실행되고 결과가 기록됩니다. 이후 감사 추적이 가능합니다.",
        logs: [
          `[완료] 발행 요청 생성 · req=${mockIds.issueRequestId}`,
          `[완료] 준비금 연결 · ${mockAmounts.reserveAmount}`,
          `[완료] 1차 승인 · 유현아`,
          `[완료] 2차 승인 · 박지훈`,
          `[완료] Wallet Service 서명 · sign=${mockIds.signId}`,
          `[완료] 발행 완료 · ${mockAmounts.issueAmount}`,
        ],
        summary: [
          { label: "발행 수량", value: mockAmounts.issueAmount, tone: "ok" },
          { label: "Sign ID", value: mockIds.signId },
          { label: "상태", value: "발행 완료", tone: "ok" },
        ],
      },
    },
  ],
};
