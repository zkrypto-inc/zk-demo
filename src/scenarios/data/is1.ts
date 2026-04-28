import { mockIds } from "@/mocks/ids";
import { mockHashes } from "@/mocks/hashes";
import type { Scenario } from "@/scenarios/types";

export const scenarioIS1: Scenario = {
  id: "IS-1",
  name: "발행사 등록 및 지갑 생성",
  shortName: "발행사 등록",
  actor: "발행사 관리자",
  actorType: "web",
  mode: "issuer",
  summary: "발행사가 플랫폼에 등록하고 지갑 관리자 구성을 거쳐 발행사 전용 지갑을 개설하는 흐름입니다.",
  screens: [
    {
      id: "IS1-1",
      layout: "form",
      title: "발행사 등록",
      subtitle: "조직 단위 온보딩 시작",
      status: "대기",
      sections: [
        {
          title: "발행사 정보",
          fields: [
            { label: "발행사명", value: "KFIN Corp." },
            { label: "사업자 번호", value: "234-56-78901" },
            { label: "담당자", value: "장민호 (발행사 관리자)" },
            { label: "요청 ID", value: mockIds.is1RequestId },
          ],
        },
      ],
      actions: [{ id: "submit-issuer", label: "발행사 등록 요청", tone: "accent" }],
    },
    {
      id: "IS1-2",
      layout: "processing",
      title: "플랫폼 승인 대기",
      subtitle: "플랫폼 운영자 검토 중",
      status: "승인 대기",
      sections: [
        {
          title: "등록 요청 상태",
          fields: [
            { label: "요청 ID", value: mockIds.is1RequestId },
            { label: "발행사명", value: "KFIN Corp." },
            { label: "플랫폼 승인", value: "검토 중", tone: "warn" },
          ],
        },
      ],
      actions: [{ id: "check-approval", label: "승인 완료 확인", tone: "accent" }],
    },
    {
      id: "IS1-3",
      layout: "form",
      title: "지갑 관리자 설정",
      subtitle: "발행사 측 지갑 관리자 구성",
      status: "진행 중",
      sections: [
        {
          title: "관리자 구성",
          fields: [
            { label: "관리자 1", value: "장민호 (발행사 관리자)" },
            { label: "관리자 2", value: "유현아 (준법감시인)" },
            { label: "관리자 3", value: "박지훈 (리스크)" },
            { label: "구성 완료", value: "3명 확정" },
          ],
        },
      ],
      actions: [{ id: "confirm-admins", label: "관리자 구성 확정", tone: "accent" }],
    },
    {
      id: "IS1-4",
      layout: "processing",
      title: "발행사 지갑 생성",
      subtitle: "Wallet Service MPC Keygen 진행 중",
      status: "처리 중",
      sections: [
        {
          title: "Keygen 상태",
          fields: [
            { label: "관리자 구성", value: "3명 완료", tone: "ok" },
            { label: "처리 상태", value: "분산 키 생성 중", tone: "warn" },
            { label: "Issuer Wallet ID", value: mockIds.issuerWalletId },
          ],
        },
      ],
    },
    {
      id: "IS1-5",
      layout: "result",
      title: "발행사 지갑 생성 완료",
      subtitle: "발행·소각 시나리오로 이동 가능",
      status: "완료",
      sections: [
        {
          title: "개설 결과",
          fields: [
            { label: "Issuer Wallet ID", value: mockIds.issuerWalletId, tone: "accent" },
            { label: "발행사 주소", value: mockHashes.issuerAddress },
            { label: "Key ID", value: mockIds.keyId },
            { label: "관리자 연결", value: "3명 활성", tone: "ok" },
            { label: "상태", value: "운영 준비 완료", tone: "ok" },
          ],
        },
      ],
      actions: [
        { id: "goto-mint", label: "발행 요청 →" },
        { id: "goto-burn", label: "소각 요청 →" },
      ],
    },
  ],
  steps: [
    {
      id: "IS1-S1",
      kind: "user-action",
      label: "발행사 등록",
      trigger: "user",
      ctaLabel: "발행사 등록 요청",
      screenId: "IS1-1",
      description: "발행사 조직 정보를 등록하고 플랫폼 승인 요청을 생성합니다.",
      processView: {
        kind: "overview",
        description: "발행사가 플랫폼에 등록을 요청합니다. 아직 지갑 생성 전이며 조직 단위 온보딩을 시작하는 단계입니다.",
        cards: [
          { label: "발행사명", value: "KFIN Corp." },
          { label: "요청 ID", value: mockIds.is1RequestId },
          { label: "단계", value: "조직 온보딩" },
        ],
      },
    },
    {
      id: "IS1-S2",
      kind: "system-processing",
      label: "플랫폼 승인",
      trigger: "user",
      ctaLabel: "승인 완료 확인",
      screenId: "IS1-2",
      description: "플랫폼 운영자가 발행사 등록 요청을 검토합니다. 승인 완료 후에만 지갑 관리자 설정과 지갑 생성이 가능합니다.",
      processView: {
        kind: "approval",
        description: "플랫폼 운영자가 발행사 등록 요청을 검토합니다. 승인 완료 후에만 발행사 측 지갑 관리자 설정과 지갑 생성이 가능합니다.",
        approvers: [
          { name: "플랫폼 운영자", role: "발행사 등록 심사", status: "approved", note: "서류 검토 완료" },
        ],
      },
    },
    {
      id: "IS1-S3",
      kind: "user-action",
      label: "지갑 관리자 설정",
      trigger: "user",
      ctaLabel: "관리자 구성 확정",
      screenId: "IS1-3",
      description: "발행사 측 지갑 관리자와 역할을 구성합니다. 이 구성이 이후 발행·소각 요청의 승인 흐름 기반이 됩니다.",
      processView: {
        kind: "overview",
        description: "발행사 측 지갑 관리자 구성을 설정합니다. 누가 지갑 생성 이후 운영과 승인에 참여하는지 정하는 단계입니다.",
        cards: [
          { label: "관리자 1", value: "장민호" },
          { label: "관리자 2", value: "유현아 (준법감시인)" },
          { label: "관리자 3", value: "박지훈 (리스크)" },
        ],
      },
    },
    {
      id: "IS1-S4",
      kind: "system-processing",
      label: "발행사 지갑 생성",
      trigger: "auto",
      duration: 1800,
      screenId: "IS1-4",
      description: "Wallet Service가 발행사 전용 지갑의 MPC 키 생성을 수행합니다. 다수 관리자를 전제로 지갑이 안전하게 생성됩니다.",
      processView: {
        kind: "keygen",
        description: "발행사 지갑 생성을 시작하면 Wallet Service의 MPC 과정이 진행됩니다. 여러 관리자를 전제로 지갑이 안전하게 생성됩니다.",
        progress: 80,
        nodes: [
          { label: "Node A", value: "완료", tone: "ok" },
          { label: "Node B", value: "완료", tone: "ok" },
          { label: "Node C", value: "처리 중", tone: "warn" },
        ],
      },
    },
    {
      id: "IS1-S5",
      kind: "result",
      label: "발행사 지갑 생성 완료",
      trigger: "auto",
      duration: 600,
      screenId: "IS1-5",
      description: "발행사 지갑 생성이 완료되었습니다. 이후 발행·소각·준비금 시나리오로 이어집니다.",
      processView: {
        kind: "artifact",
        description: "발행사 지갑이 준비되었고 후속 운영 시나리오로 이동할 수 있습니다. 이후 발행·소각·준비금 시나리오가 이 지갑을 기준으로 이어집니다.",
        items: [
          { label: "Issuer Wallet ID", value: mockIds.issuerWalletId, tone: "accent" },
          { label: "발행사 주소", value: mockHashes.issuerAddress },
          { label: "Key ID", value: mockIds.keyId },
          { label: "관리자 연결", value: "3명 활성", tone: "ok" },
          { label: "상태", value: "운영 준비 완료", tone: "ok" },
        ],
      },
    },
  ],
};
