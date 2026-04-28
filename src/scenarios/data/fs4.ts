import { mockIds } from "@/mocks/ids";
import { mockAmounts } from "@/mocks/amounts";
import type { Scenario } from "@/scenarios/types";

export const scenarioFS4: Scenario = {
  id: "FS-4",
  name: "준비금 유동성 관리",
  shortName: "준비금 관리",
  actor: "발행사 관리자",
  actorType: "web",
  mode: "issuer",
  summary: "준비금·유동성 요청이 감사 가능한 형태로 기록되고 이력으로 남는 흐름입니다.",
  screens: [
    {
      id: "FS4-1",
      layout: "form",
      title: "요청 생성",
      subtitle: "준비금·유동성 관리 요청 시작",
      status: "대기",
      sections: [
        {
          title: "요청 정보",
          fields: [
            { label: "요청 유형", value: "유동성 충전" },
            { label: "입출금 금액", value: mockAmounts.liquidityAmount },
            { label: "요청 ID", value: mockIds.liquidityRequestId },
            { label: "노트", value: "2분기 준비금 유동성 공급" },
          ],
        },
      ],
      actions: [{ id: "submit-liquidity", label: "요청 생성", tone: "accent" }],
    },
    {
      id: "FS4-2",
      layout: "form",
      title: "사유 기록",
      subtitle: "감사 목적 사유 등록",
      status: "진행 중",
      sections: [
        {
          title: "사유 및 증빙",
          fields: [
            { label: "요청 사유", value: "준비금 비율 유지를 위한 충전" },
            { label: "관련 규정", value: "내규 제15조" },
            { label: "첨부 증빙", value: "reserve_proof_Q2.pdf" },
          ],
        },
      ],
      actions: [{ id: "confirm-reason", label: "사유 등록 완료", tone: "accent" }],
    },
    {
      id: "FS4-3",
      layout: "approval",
      title: "발행사 / 플랫폼 승인",
      subtitle: "병렬 승인 진행 중",
      status: "승인 대기",
      sections: [
        {
          title: "승인 현황",
          fields: [
            { label: "발행사 승인", value: "완료", tone: "ok" },
            { label: "플랫폼 승인", value: "검토 중", tone: "warn" },
            { label: "순서 제약", value: "없음 (병렬 승인)" },
          ],
        },
      ],
      actions: [{ id: "confirm-approval", label: "플랫폼 승인 완료 확인", tone: "accent" }],
    },
    {
      id: "FS4-4",
      layout: "processing",
      title: "원화계좌 입출금 처리",
      subtitle: "승인 완료 후 계좌 처리",
      status: "처리 중",
      sections: [
        {
          title: "계좌 처리",
          fields: [
            { label: "출금 계좌", value: "KB국민은행 ***-***-****" },
            { label: "입금 계좌", value: "신한은행 ***-***-****" },
            { label: "처리 금액", value: mockAmounts.liquidityAmount },
            { label: "처리 상태", value: "진행 중", tone: "warn" },
          ],
        },
      ],
      actions: [{ id: "confirm-transfer", label: "처리 완료 확인", tone: "accent" }],
    },
    {
      id: "FS4-5",
      layout: "dashboard",
      title: "Audit Log 기록",
      subtitle: "요청·승인·처리 전체 기록",
      status: "진행 중",
      sections: [
        {
          title: "감사 기록",
          fields: [
            { label: "요청 ID", value: mockIds.liquidityRequestId },
            { label: "Audit Event ID", value: mockIds.auditEventId },
            { label: "기록 항목", value: "요청·사유·승인·처리" },
          ],
        },
      ],
      actions: [{ id: "view-history", label: "이력 확인", tone: "accent" }],
    },
    {
      id: "FS4-6",
      layout: "result",
      title: "이력 확인",
      subtitle: "운영 이력 및 결과 조회",
      status: "완료",
      sections: [
        {
          title: "이력 목록",
          fields: [
            { label: "요청 ID", value: mockIds.liquidityRequestId },
            { label: "금액", value: mockAmounts.liquidityAmount },
            { label: "상태", value: "처리 완료", tone: "ok" },
            { label: "Audit Event ID", value: mockIds.auditEventId },
          ],
        },
      ],
    },
  ],
  steps: [
    {
      id: "FS4-S1",
      kind: "user-action",
      label: "요청 생성",
      trigger: "user",
      ctaLabel: "요청 생성",
      screenId: "FS4-1",
      description: "유동성 충전 또는 준비금 관리를 위한 요청을 생성합니다. 요청 유형과 금액을 정의하는 단계입니다.",
      processView: {
        kind: "overview",
        description: "준비금 또는 유동성 관리 요청을 시작합니다. 아직 실행이 아니라 요청 생성 단계입니다.",
        cards: [
          { label: "요청 유형", value: "유동성 충전" },
          { label: "금액", value: mockAmounts.liquidityAmount },
          { label: "요청 ID", value: mockIds.liquidityRequestId },
        ],
      },
    },
    {
      id: "FS4-S2",
      kind: "user-action",
      label: "사유 기록",
      trigger: "user",
      ctaLabel: "사유 등록 완료",
      screenId: "FS4-2",
      description: "요청 사유와 증빙 파일을 등록합니다. 등록된 정보는 이후 감사 조회 시 이력으로 활용됩니다.",
      processView: {
        kind: "overview",
        description: "요청 사유와 증빙 파일을 등록합니다. 등록된 정보는 이력에서 조회할 수 있습니다.",
        cards: [
          { label: "사유", value: "준비금 비율 유지" },
          { label: "관련 규정", value: "내규 제15조" },
          { label: "증빙", value: "첨부 완료", tone: "ok" },
        ],
      },
    },
    {
      id: "FS4-S3",
      kind: "system-processing",
      label: "발행사 / 플랫폼 승인",
      trigger: "user",
      ctaLabel: "플랫폼 승인 완료 확인",
      screenId: "FS4-3",
      description: "발행사와 플랫폼 운영자가 병렬로 승인을 진행합니다. 승인 순서는 고정되지 않으며 두 조직 모두 완료해야 다음 단계로 진행됩니다.",
      processView: {
        kind: "approval",
        description: "두 조직의 승인 상태를 병렬적으로 보여줍니다. 승인 순서가 고정되지 않은 구조입니다.",
        approvers: [
          { name: "발행사 (KFIN Corp.)", role: "발행사 승인", status: "approved" },
          { name: "플랫폼 운영자", role: "플랫폼 승인", status: "pending", note: "검토 중" },
        ],
      },
    },
    {
      id: "FS4-S4",
      kind: "system-processing",
      label: "원화계좌 입출금 처리",
      trigger: "user",
      ctaLabel: "처리 완료 확인",
      screenId: "FS4-4",
      description: "양측 승인 완료 후 사전 등록된 원화계좌를 통해 실제 입출금 처리가 이루어집니다.",
      processView: {
        kind: "overview",
        description: "승인이 끝난 뒤 실제 원화계좌 처리로 이어집니다. 은행 처리 또는 외부 계좌 처리가 연결됩니다.",
        cards: [
          { label: "처리 금액", value: mockAmounts.liquidityAmount },
          { label: "출금 계좌", value: "사전 등록 완료", tone: "ok" },
          { label: "처리 상태", value: "진행 중", tone: "warn" },
        ],
      },
    },
    {
      id: "FS4-S5",
      kind: "system-processing",
      label: "Audit Log 기록",
      trigger: "user",
      ctaLabel: "이력 확인",
      screenId: "FS4-5",
      description: "처리된 요청, 승인 내역, 실행 결과가 모두 감사 로그로 기록됩니다.",
      processView: {
        kind: "audit",
        description: "요청과 승인과 처리가 모두 기록됩니다. 이후 감사자가 무엇을 보게 되는지 연결해 줍니다.",
        logs: [
          `[완료] 요청 생성 · req=${mockIds.liquidityRequestId}`,
          `[완료] 사유 기록`,
          `[완료] 발행사 승인 · KFIN Corp.`,
          `[완료] 플랫폼 승인`,
          `[완료] 원화계좌 처리 · ${mockAmounts.liquidityAmount}`,
        ],
      },
    },
    {
      id: "FS4-S6",
      kind: "result",
      label: "이력 확인",
      trigger: "auto",
      duration: 600,
      screenId: "FS4-6",
      description: "요청 처리 결과와 감사 이벤트를 확인합니다.",
      processView: {
        kind: "audit",
        description: "운영 이력과 결과가 남아 있는 상태를 보여줍니다.",
        logs: [
          `[완료] 요청 생성 · req=${mockIds.liquidityRequestId}`,
          `[완료] 사유 기록`,
          `[완료] 발행사 승인 · KFIN Corp.`,
          `[완료] 플랫폼 승인`,
          `[완료] 원화계좌 처리 · ${mockAmounts.liquidityAmount}`,
          `[완료] 감사 이벤트 기록 · ${mockIds.auditEventId}`,
        ],
        summary: [
          { label: "요청 ID", value: mockIds.liquidityRequestId },
          { label: "금액", value: mockAmounts.liquidityAmount },
          { label: "상태", value: "처리 완료", tone: "ok" },
        ],
      },
    },
  ],
};
