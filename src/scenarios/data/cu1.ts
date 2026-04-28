import { mockIds } from "@/mocks/ids";
import { mockHashes } from "@/mocks/hashes";
import type { Scenario } from "@/scenarios/types";

export const scenarioCU1: Scenario = {
  id: "CU-1",
  name: "수탁 등록 및 지갑 개설",
  shortName: "수탁 개설",
  actor: "수탁 운영자",
  actorType: "web",
  mode: "custody",
  summary: "법인 사용자 등록 후 수탁 승인을 거쳐 MPC 기반 전용 지갑을 개설하는 흐름입니다.",
  screens: [
    {
      id: "CU1-1",
      layout: "form",
      title: "법인 사용자 등록 및 관리자 지정",
      subtitle: "수탁 등록 요청 시작",
      status: "대기",
      sections: [
        {
          title: "법인 정보",
          fields: [
            { label: "법인명", value: "대한자산운용 주식회사" },
            { label: "사업자 번호", value: "123-45-67890" },
            { label: "담당자", value: "이수민" },
          ],
        },
        {
          title: "수탁 관리자 구성",
          fields: [
            { label: "관리자 1", value: "이수민 (대표)" },
            { label: "관리자 2", value: "최종원 (CFO)" },
            { label: "관리자 수", value: "2명" },
          ],
        },
      ],
      actions: [{ id: "submit-cu1", label: "수탁 등록 요청", tone: "accent" }],
    },
    {
      id: "CU1-2",
      layout: "approval",
      title: "플랫폼 수탁 승인 대기",
      subtitle: "운영 플랫폼 검토 중",
      status: "승인 대기",
      sections: [
        {
          title: "등록 요청 상태",
          fields: [
            { label: "요청 ID", value: mockIds.requestId },
            { label: "법인명", value: "대한자산운용 주식회사" },
            { label: "플랫폼 승인", value: "검토 중", tone: "warn" },
            { label: "예상 완료", value: "당일 내" },
          ],
        },
      ],
      actions: [{ id: "check-approval", label: "승인 완료 확인", tone: "accent" }],
    },
    {
      id: "CU1-3",
      layout: "dashboard",
      title: "수탁 전용 지갑 생성 요청",
      subtitle: "승인 완료 — 지갑 개설 가능",
      status: "승인 완료",
      sections: [
        {
          title: "개설 요청",
          fields: [
            { label: "플랫폼 승인", value: "완료", tone: "ok" },
            { label: "지갑 유형", value: "수탁 전용 (MPC 기반)" },
            { label: "Custody Wallet ID", value: mockIds.custodyWalletId },
          ],
        },
      ],
      actions: [{ id: "create-wallet", label: "수탁 지갑 생성", tone: "accent" }],
    },
    {
      id: "CU1-4",
      layout: "processing",
      title: "보안 키 생성 진행 중",
      subtitle: "Wallet Service MPC Keygen",
      status: "처리 중",
      sections: [
        {
          title: "Keygen 상태",
          fields: [
            { label: "처리 상태", value: "진행 중", tone: "warn" },
            { label: "보안 처리", value: "분산 키 생성 (MPC)" },
            { label: "예상 완료", value: "수 초 내" },
          ],
        },
      ],
    },
    {
      id: "CU1-5",
      layout: "result",
      title: "수탁 지갑 개설 완료",
      subtitle: "이후 수탁 입금·출금 시나리오로 이동",
      status: "완료",
      sections: [
        {
          title: "개설 결과",
          fields: [
            { label: "Custody Wallet ID", value: mockIds.custodyWalletId, tone: "accent" },
            { label: "지갑 주소", value: mockHashes.custodyAddress },
            { label: "Key ID", value: mockIds.keyId },
            { label: "관리자 연결", value: "2명 활성", tone: "ok" },
            { label: "상태", value: "운영 준비 완료", tone: "ok" },
          ],
        },
      ],
      actions: [
        { id: "goto-deposit", label: "수탁 입금 →" },
        { id: "goto-withdraw", label: "수탁 출금 →" },
      ],
    },
  ],
  steps: [
    {
      id: "CU1-S1",
      kind: "user-action",
      label: "법인 사용자 등록 및 수탁 관리자 지정",
      trigger: "user",
      ctaLabel: "수탁 등록 요청",
      screenId: "CU1-1",
      description: "법인 정보와 지갑 운영 참여자를 등록합니다. 이후 승인 완료 시 수탁 전용 지갑을 생성할 수 있습니다.",
      processView: {
        kind: "overview",
        description: "법인 사용자가 수탁 등록을 요청하고 수탁 관리자 2명을 지정합니다. 아직 지갑 생성 전이며 조직과 관리자 구성을 완료하는 단계입니다.",
        cards: [
          { label: "법인명", value: "대한자산운용 주식회사" },
          { label: "관리자 수", value: "2명" },
          { label: "요청 ID", value: mockIds.requestId },
        ],
      },
    },
    {
      id: "CU1-S2",
      kind: "system-processing",
      label: "플랫폼 수탁 승인",
      trigger: "user",
      ctaLabel: "승인 완료 확인",
      screenId: "CU1-2",
      description: "이 단계는 수탁 등록과 지갑 개설 사이의 운영 통제 지점을 보여주는 역할을 합니다.",
      processView: {
        kind: "approval",
        description: "플랫폼이 수탁 등록 요청을 검토하고 승인합니다. 승인 완료 후에만 수탁 전용 지갑 생성 요청이 열립니다.",
        approvers: [
          { name: "플랫폼 운영자", role: "수탁 등록 검토", status: "approved", note: "법인 서류 확인 완료" },
        ],
      },
    },
    {
      id: "CU1-S3",
      kind: "user-action",
      label: "수탁 전용 지갑 생성 요청",
      trigger: "user",
      ctaLabel: "수탁 지갑 생성",
      screenId: "CU1-3",
      description: "승인된 수탁 건에 대해 전용 지갑 생성을 요청합니다. 생성 요청 후 보안 처리 상태가 이어집니다.",
      processView: {
        kind: "overview",
        description: "플랫폼 승인 이후 수탁 전용 지갑 생성을 요청합니다. SDS 기준으로 수탁이 승인될 때 수탁 건마다 전용 지갑이 생성됩니다.",
        cards: [
          { label: "승인 상태", value: "완료", tone: "ok" },
          { label: "지갑 유형", value: "수탁 전용 MPC" },
          { label: "Custody Wallet ID", value: mockIds.custodyWalletId },
        ],
      },
    },
    {
      id: "CU1-S4",
      kind: "system-processing",
      label: "Keygen",
      trigger: "auto",
      duration: 1800,
      screenId: "CU1-4",
      description: "이 단계가 수탁 시나리오 안에서 zkMPC의 핵심 가치를 직접 보여주는 구간입니다.",
      processView: {
        kind: "keygen",
        description: "Wallet Service가 MPC 기반 keygen을 수행합니다. 수탁 전용 지갑이 분산 보안 처리로 안전하게 준비됩니다.",
        progress: 72,
        nodes: [
          { label: "Node 1", value: "완료", tone: "ok" },
          { label: "Node 2", value: "완료", tone: "ok" },
          { label: "Node 3", value: "처리 중", tone: "warn" },
          { label: "Key 조합", value: "대기 중" },
        ],
      },
    },
    {
      id: "CU1-S5",
      kind: "result",
      label: "수탁 지갑 생성 완료",
      trigger: "auto",
      duration: 600,
      screenId: "CU1-5",
      description: "이 화면은 수탁 온보딩의 종료 화면이자 이후 입금·출금 시나리오의 출발점입니다.",
      processView: {
        kind: "artifact",
        description: "수탁 지갑이 개설되었고 이후 운영 시나리오로 연결됩니다. 등록 완료와 지갑 준비 완료가 함께 끝난 상태입니다.",
        items: [
          { label: "Custody Wallet ID", value: mockIds.custodyWalletId, tone: "accent" },
          { label: "지갑 주소", value: mockHashes.custodyAddress },
          { label: "Key ID", value: mockIds.keyId },
          { label: "관리자 연결", value: "2명 활성", tone: "ok" },
          { label: "상태", value: "운영 준비 완료", tone: "ok" },
        ],
      },
    },
  ],
};
