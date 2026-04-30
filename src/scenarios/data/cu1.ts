import { mockIds } from "@/mocks/ids";
import { mockHashes } from "@/mocks/hashes";
import type { Scenario, SequenceContext } from "@/scenarios/types";

const seqActors = ["사용자", "수탁사", "zkWallet(Custody)"] as const;
const seqPastBase = [{ from: "사용자", to: "수탁사", label: "수탁 등록" }];

const keygenSeq = (tone: "warn" | "ok"): SequenceContext => ({
  actors: [...seqActors],
  activeEdge: { from: "수탁사", to: "zkWallet(Custody)", label: "지갑 생성/키 생성", tone },
  pastEdges: seqPastBase,
});

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
      actor: "고객(수탁 요청자)",
      title: "수탁 정보 등록",
      subtitle: "수탁 등록 요청 시작",
      status: "대기",
      sections: [
        {
          title: "법인 정보",
          fields: [
            { label: "법인명", value: "대한자산운용 주식회사" },
            { label: "사업자 번호", value: "123-45-67890" },
          ],
        },
        {
          title: "수탁 관리자 구성",
          fields: [
            { label: "관리자 1", value: "이수민 (대표)" },
            { label: "관리자 2", value: "최종원 (CFO)" },
            { label: "관리자 3", value: "박지영 (준법감시)" },
            { label: "관리자 수", value: "3명" },
            { label: "최소 승인자 수", value: "2명" },
          ],
        },
      ],
      actions: [{ id: "submit-cu1", label: "수탁 등록 요청", tone: "accent" }],
    },
    {
      id: "CU1-2",
      layout: "approval",
      actor: "수탁사(수탁 관리자)",
      title: "플랫폼 수탁 승인",
      subtitle: "운영 플랫폼 검토 중",
      status: "승인 대기",
      sections: [
        {
          title: "등록 요청 상태",
          fields: [
            { label: "법인명", value: "대한자산운용 주식회사" },
            { label: "플랫폼 승인", value: "검토 중", tone: "warn" },
            { label: "예상 완료", value: "당일 내" },
          ],
        },
      ],
      actions: [
        { id: "approve-custody", label: "승인", tone: "accent" },
        { id: "reject-custody", label: "거절", tone: "bad" },
      ],
    },
    {
      id: "CU1-3",
      layout: "dashboard",
      actor: "수탁사(수탁 관리자)",
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
      actor: "고객(수탁 요청자)",
      title: "보안 키 생성 시작",
      subtitle: "Wallet Service MPC 키 생성",
      status: "처리 중",
      sections: [
        {
          title: "키 생성 상태",
          fields: [
            { label: "처리", value: "MPC 연산 처리 중", tone: "warn" },
            { label: "안내", value: "잠시만 기다려주세요" },
          ],
        },
      ],
    },
    {
      id: "CU1-4b",
      layout: "processing",
      actor: "고객(수탁 요청자)",
      title: "키 생성 진행 중",
      subtitle: "지갑 준비 중 — 완료까지 잠시 기다려주세요",
      status: "처리 중",
      sections: [
        {
          title: "처리 상태",
          fields: [
            { label: "처리 상태", value: "안전하게 키 생성 중", tone: "warn" },
          ],
        },
      ],
    },
    {
      id: "CU1-4c",
      layout: "processing",
      actor: "고객(수탁 요청자)",
      title: "키 생성 완료",
      subtitle: "키 생성이 완료되었습니다",
      status: "진행 중",
      sections: [
        {
          title: "연결 상태",
          fields: [
            { label: "지갑 상태", value: "준비 완료", tone: "ok" },
            { label: "계정 연결", value: "완료", tone: "ok" },
            { label: "Custody Wallet ID", value: mockIds.custodyWalletId },
          ],
        },
      ],
    },
    {
      id: "CU1-5",
      layout: "result",
      actor: "고객(수탁 요청자)",
      title: "수탁 지갑 개설 완료",
      subtitle: "이후 수탁 입금·출금 시나리오로 이동",
      status: "완료",
      sections: [
        {
          title: "개설 결과",
          fields: [
            { label: "지갑 주소", value: mockHashes.custodyAddress, tone: "accent" },
            { label: "최소 승인 수", value: "2명" },
            { label: "관리자 수", value: "3명" },
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
        description: "법인 사용자가 수탁 등록을 요청하고 수탁 관리자 3명을 지정합니다. 아직 지갑 생성 전이며 조직과 관리자 구성을 완료하는 단계입니다.",
        cards: [
          { label: "법인명", value: "대한자산운용 주식회사" },
          { label: "관리자 수", value: "3명" },
          { label: "최소 승인자 수", value: "2명" },
        ],
        sequence: {
          actors: [...seqActors],
          activeEdge: { from: "사용자", to: "수탁사", label: "수탁 등록", tone: "accent" },
          pastEdges: [],
        },
      },
    },
    {
      id: "CU1-S2",
      kind: "system-processing",
      label: "플랫폼 수탁 승인",
      trigger: "user",
      ctaLabel: "승인",
      screenId: "CU1-2",
      description: "수탁사가 수탁 등록 요청을 검토하고 해당 수탁 건을 승인 또는 거절합니다. 승인이 완료되어야만 지갑 생성 단계로 진행됩니다.",
      processView: {
        kind: "approval",
        description: "수탁 관리자가 수탁 등록 요청을 검토합니다. 승인 완료 후에만 수탁 전용 지갑 생성 요청이 열립니다.",
        approvers: [
          { name: "수탁사", role: "수탁 건 승인", status: "pending", note: "승인 또는 거절 가능" },
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
        description: "플랫폼 승인 이후 수탁 전용 지갑 생성을 요청합니다. 수탁이 승인될 때 수탁 건마다 전용 지갑이 생성됩니다.",
        cards: [
          { label: "승인 상태", value: "완료", tone: "ok" },
          { label: "지갑 유형", value: "수탁 전용 MPC" },
          { label: "Custody Wallet ID", value: mockIds.custodyWalletId },
        ],
        sequence: {
          actors: [...seqActors],
          activeEdge: { from: "수탁사", to: "zkWallet(Custody)", label: "지갑 생성/키 생성", tone: "accent" },
          pastEdges: seqPastBase,
        },
      },
    },
    {
      id: "CU1-S4",
      kind: "system-processing",
      label: "보안 키 생성 시작",
      trigger: "auto",
      duration: 1200,
      screenId: "CU1-4",
      description: "Wallet Service가 MPC 기반 보안 키 생성을 시작합니다. 개인 키는 단일 서버에 보관되지 않습니다.",
      processView: {
        kind: "keygen",
        description: "보안 키 생성이 시작되었습니다. 관리자 노드가 세션을 시작하고 노드들이 대기 중입니다.",
        progress: 20,
        nodes: [
          { label: "관리자 노드", value: "세션 시작", tone: "accent" },
          { label: "노드 1", value: "대기 중", tone: "warn" },
          { label: "노드 2", value: "대기 중", tone: "warn" },
          { label: "노드 3", value: "대기 중", tone: "warn" },
        ],
        sequence: keygenSeq("warn"),
      },
    },
    {
      id: "CU1-S5",
      kind: "system-processing",
      label: "키 생성 진행 중",
      trigger: "auto",
      duration: 1500,
      screenId: "CU1-4b",
      description: "수탁 전용 지갑 키 생성이 진행 중입니다. 관리자 노드가 세션을 조율하며 모든 노드가 분산 키 생성에 참여합니다.",
      processView: {
        kind: "keygen",
        description: "관리자 노드가 세션을 조율하며 모든 노드가 키 생성에 참여하고 있습니다.",
        progress: 65,
        nodes: [
          { label: "관리자 노드", value: "세션 조율 중", tone: "accent" },
          { label: "노드 1", value: "처리 중", tone: "warn" },
          { label: "노드 2", value: "처리 중", tone: "warn" },
          { label: "노드 3", value: "처리 중", tone: "warn" },
        ],
        sequence: keygenSeq("warn"),
      },
    },
    {
      id: "CU1-S6",
      kind: "system-processing",
      label: "키 생성 완료",
      trigger: "auto",
      duration: 800,
      screenId: "CU1-4c",
      description: "키 생성이 완료되고 수탁 전용 지갑이 계정에 연결됩니다. 즉시 사용 가능한 상태로 전환됩니다.",
      processView: {
        kind: "keygen",
        description: "키 생성이 완료되었습니다. 모든 노드의 부분 키가 생성되어 수탁 전용 지갑이 준비되었습니다.",
        progress: 100,
        nodes: [
          { label: "관리자 노드", value: "완료", tone: "accent" },
          { label: "노드 1", value: "완료", tone: "ok" },
          { label: "노드 2", value: "완료", tone: "ok" },
          { label: "노드 3", value: "완료", tone: "ok" },
        ],
        sequence: keygenSeq("ok"),
      },
    },
    {
      id: "CU1-S7",
      kind: "result",
      label: "수탁 지갑 생성 완료",
      trigger: "auto",
      duration: 600,
      screenId: "CU1-5",
      description: "수탁 전용 지갑 개설이 완료되었습니다. 이후 입금·출금 운영 시나리오로 이어집니다.",
      processView: {
        kind: "artifact",
        description: "수탁 지갑이 개설되었고 이후 운영 시나리오로 연결됩니다.",
        items: [
          { label: "지갑 주소", value: mockHashes.custodyAddress, tone: "accent" },
          { label: "최소 승인 수", value: "2명" },
          { label: "관리자 수", value: "3명" },
        ],
        sequence: {
          actors: [...seqActors],
          activeEdge: { from: "zkWallet(Custody)", to: "수탁사", label: "지갑 주소 발급", tone: "ok" },
          pastEdges: seqPastBase,
        },
      },
    },
  ],
};
