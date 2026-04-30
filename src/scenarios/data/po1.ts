import { mockIds } from "@/mocks/ids";
import type { Scenario, SequenceContext } from "@/scenarios/types";

const seqActors = ["플랫폼 운영자", "스테이블코인 플랫폼", "연계 조직"] as const;

const operatorSeq = (label: string, tone: "accent" | "ok" = "accent"): SequenceContext => ({
  actors: [...seqActors],
  activeEdge: { from: "플랫폼 운영자", to: "스테이블코인 플랫폼", label, tone },
});

const platformSeq = (label: string, tone: "accent" | "ok" = "accent"): SequenceContext => ({
  actors: [...seqActors],
  activeEdge: { from: "스테이블코인 플랫폼", to: "연계 조직", label, tone },
});

const resultSeq = (): SequenceContext => ({
  actors: [...seqActors],
  activeEdge: { from: "스테이블코인 플랫폼", to: "플랫폼 운영자", label: "운영 준비 완료", tone: "ok" },
});

export const scenarioPO1: Scenario = {
  id: "PO-1",
  name: "플랫폼 운영자 설정",
  shortName: "플랫폼 설정",
  actor: "플랫폼 운영자",
  actorType: "web",
  mode: "platform",
  summary: "tenant를 생성하고 발행사·수탁 운영자·승인권자를 연결하는 초기 설정 흐름입니다.",
  screens: [
    {
      id: "PO1-1",
      layout: "dashboard",
      title: "Tenant 선택",
      subtitle: "운영 단위 선택 또는 신규 생성",
      status: "대기",
      sections: [
        {
          title: "기존 Tenant",
          fields: [
            { label: "Tenant ID", value: mockIds.tenantId },
            { label: "상태", value: "활성", tone: "ok" },
            { label: "생성일", value: "2026-01-15" },
          ],
        },
      ],
      actions: [{ id: "select-tenant", label: "이 Tenant 사용", tone: "accent" }],
    },
    {
      id: "PO1-2",
      layout: "form",
      title: "프로그램 생성",
      subtitle: "Tenant 내 운영 프로그램 정의",
      status: "진행 중",
      sections: [
        {
          title: "프로그램 정보",
          fields: [
            { label: "프로그램명", value: "KRW 스테이블코인" },
            { label: "Program ID", value: mockIds.programId },
            { label: "네트워크", value: "Ethereum Mainnet" },
            { label: "자산 유형", value: "ERC-20 Stablecoin" },
          ],
        },
      ],
      actions: [{ id: "create-program", label: "프로그램 생성", tone: "accent" }],
    },
    {
      id: "PO1-3",
      layout: "form",
      title: "운영 권한 설정",
      subtitle: "플랫폼 운영자 역할 범위 확정",
      status: "진행 중",
      sections: [
        {
          title: "권한 구성",
          fields: [
            { label: "Tenant 관리", value: "허용", tone: "ok" },
            { label: "역할 관리", value: "허용", tone: "ok" },
            { label: "감사 조회", value: "허용", tone: "ok" },
            { label: "자산 직접 이동", value: "차단", tone: "bad" },
          ],
        },
      ],
      actions: [{ id: "confirm-perms", label: "권한 확정", tone: "accent" }],
    },
    {
      id: "PO1-4",
      layout: "dashboard",
      title: "발행사 / 수탁 운영자 지정",
      subtitle: "외부 조직과 역할 연결",
      status: "진행 중",
      sections: [
        {
          title: "역할 연결",
          fields: [
            { label: "발행사", value: "KFIN Corp." },
            { label: "발행사 상태", value: "연결됨", tone: "ok" },
            { label: "수탁 운영자", value: "SafeVault Inc." },
            { label: "수탁 운영자 상태", value: "연결됨", tone: "ok" },
          ],
        },
      ],
      actions: [{ id: "confirm-roles", label: "역할 지정 완료", tone: "accent" }],
    },
    {
      id: "PO1-5",
      layout: "approval",
      title: "승인권자 지정",
      subtitle: "승인 체계 참여자 설정",
      status: "진행 중",
      sections: [
        {
          title: "승인 구성",
          fields: [
            { label: "1차 승인자", value: "김준수 (리스크관리팀)" },
            { label: "2차 승인자 (준법감시인)", value: "박지현 (컴플라이언스)" },
            { label: "다중 승인 방식", value: "2-of-2 필수" },
          ],
        },
      ],
      actions: [{ id: "confirm-approvers", label: "승인 구성 확정", tone: "accent" }],
    },
    {
      id: "PO1-6",
      layout: "result",
      title: "연계 준비 완료",
      subtitle: "프로그램 운영 구조 확인",
      status: "완료",
      sections: [
        {
          title: "프로그램 요약",
          fields: [
            { label: "Tenant ID", value: mockIds.tenantId },
            { label: "Program ID", value: mockIds.programId },
            { label: "발행사", value: "KFIN Corp." },
            { label: "수탁 운영자", value: "SafeVault Inc." },
            { label: "승인 구조", value: "2-of-2 승인" },
            { label: "상태", value: "운영 준비 완료", tone: "ok" },
          ],
        },
      ],
    },
  ],
  steps: [
    {
      id: "PO1-S1",
      kind: "user-action",
      label: "Tenant 생성 또는 선택",
      trigger: "user",
      ctaLabel: "이 Tenant 사용",
      screenId: "PO1-1",
      description: "모든 발행사, 수탁 운영자, 승인자 연결은 이 Tenant를 기준으로 이어집니다.",
      processView: {
        kind: "overview",
        description: "새 금융기관 프로그램을 시작하기 위해 운영 단위를 선택합니다. 기존 Tenant를 재사용하거나 신규로 생성할 수 있습니다.",
        cards: [
          { label: "Tenant ID", value: mockIds.tenantId },
          { label: "상태", value: "활성", tone: "ok" },
          { label: "연결 서비스", value: "Wallet Service + Audit" },
        ],
        sequence: operatorSeq("Tenant 선택"),
      },
    },
    {
      id: "PO1-S2",
      kind: "user-action",
      label: "프로그램 생성",
      trigger: "user",
      ctaLabel: "프로그램 생성",
      screenId: "PO1-2",
      description: "이 단계는 실제 사용자 자산 처리 이전의 운영 구조 설정 단계입니다.",
      processView: {
        kind: "overview",
        description: "Tenant 아래에서 어떤 프로그램을 운영할지 정의합니다. 프로그램은 이후 수탁·발행 시나리오의 상위 컨텍스트가 됩니다.",
        cards: [
          { label: "Program ID", value: mockIds.programId },
          { label: "자산", value: "KRW 스테이블코인" },
          { label: "네트워크", value: "Ethereum" },
        ],
        sequence: operatorSeq("프로그램 생성"),
      },
    },
    {
      id: "PO1-S3",
      kind: "user-action",
      label: "플랫폼 운영 권한 설정",
      trigger: "user",
      ctaLabel: "권한 확정",
      screenId: "PO1-3",
      description: "플랫폼 운영자의 관리 범위와 권한을 설정합니다. Tenant 관리, 역할 관리, 감사 조회 등의 권한을 구분하여 구성합니다.",
      processView: {
        kind: "overview",
        description: "플랫폼 운영자가 어떤 범위까지 관리할지 설정합니다. Tenant 관리·역할 관리·감사 조회 등의 권한을 구분합니다.",
        cards: [
          { label: "Tenant 관리", value: "허용", tone: "ok" },
          { label: "역할 관리", value: "허용", tone: "ok" },
          { label: "자산 직접 이동", value: "차단", tone: "bad" },
        ],
        sequence: operatorSeq("권한 설정"),
      },
    },
    {
      id: "PO1-S4",
      kind: "user-action",
      label: "발행사 / 수탁 운영자 지정",
      trigger: "user",
      ctaLabel: "역할 지정 완료",
      screenId: "PO1-4",
      description: "같은 시스템을 쓰더라도 발행사와 수탁 운영자는 보는 화면과 책임이 다릅니다.",
      processView: {
        kind: "overview",
        description: "외부 조직과 역할을 Tenant에 연결합니다. 발행사와 수탁 운영자를 각각 별도 actor로 구분합니다.",
        cards: [
          { label: "발행사", value: "KFIN Corp.", tone: "ok" },
          { label: "수탁 운영자", value: "SafeVault Inc.", tone: "ok" },
        ],
        sequence: platformSeq("역할 연결"),
      },
    },
    {
      id: "PO1-S5",
      kind: "user-action",
      label: "승인권자 지정",
      trigger: "user",
      ctaLabel: "승인 구성 확정",
      screenId: "PO1-5",
      description: "발행·소각·출금 요청에 참여할 승인권자를 지정합니다. 이 구성이 이후 각 운영 시나리오에서 재사용됩니다.",
      processView: {
        kind: "approval",
        description: "누가 승인 체계에 참여하는지 설정합니다. 이후 수탁 출금·발행·소각 요청에서 이 구성이 재사용됩니다.",
        approvers: [
          { name: "김준수", role: "리스크관리팀 (1차)", status: "approved" },
          { name: "박지현", role: "컴플라이언스 준법감시인 (2차)", status: "approved" },
        ],
      },
    },
    {
      id: "PO1-S6",
      kind: "result",
      label: "연계 준비 완료",
      trigger: "auto",
      duration: 800,
      screenId: "PO1-6",
      description: "플랫폼 운영 구조 설정이 완료되었습니다. 이후 발행사·수탁 운영자·개인 사용자 시나리오로 이동할 수 있습니다.",
      processView: {
        kind: "artifact",
        description: "이 Tenant에서 어떤 조직이 어떤 역할로 운영되는지 요약합니다. 수탁·발행·개인 사용자 시나리오로 이동할 수 있습니다.",
        items: [
          { label: "Tenant ID", value: mockIds.tenantId, tone: "accent" },
          { label: "Program ID", value: mockIds.programId },
          { label: "발행사", value: "KFIN Corp.", tone: "ok" },
          { label: "수탁 운영자", value: "SafeVault Inc.", tone: "ok" },
          { label: "승인 구조", value: "2-of-2 필수" },
          { label: "상태", value: "운영 준비 완료", tone: "ok" },
        ],
        sequence: resultSeq(),
      },
    },
  ],
};
