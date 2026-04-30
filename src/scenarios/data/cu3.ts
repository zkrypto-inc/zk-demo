import { mockIds } from "@/mocks/ids";
import { mockAmounts } from "@/mocks/amounts";
import { mockHashes } from "@/mocks/hashes";
import type { Scenario } from "@/scenarios/types";

export const scenarioCU3: Scenario = {
  id: "CU-3",
  name: "수탁용 출금",
  shortName: "수탁 출금",
  actor: "수탁 운영자",
  actorType: "web",
  mode: "custody",
  summary: "출금 요청·승인을 거쳐 Wallet Service 서명으로 이어지는 출금 흐름입니다.",
  screens: [
    {
      id: "CU3-1",
      layout: "form",
      title: "출금 요청 생성",
      subtitle: "수탁 출금 신청",
      status: "대기",
      sections: [
        {
          title: "출금 정보",
          fields: [
            { label: "요청 ID", value: mockIds.cu3RequestId },
            { label: "출금 수량", value: mockAmounts.withdrawAmount },
            { label: "목적지 주소", value: mockHashes.withdrawalAddress },
            { label: "자산", value: "KRW 스테이블코인" },
            { label: "사유", value: "법인 자금 회수" },
          ],
        },
      ],
      actions: [{ id: "submit-withdraw", label: "출금 요청 제출", tone: "accent" }],
    },
    {
      id: "CU3-2",
      layout: "approval",
      title: "승인 / Policy 검토",
      subtitle: "Approval Service 검토 중",
      status: "승인 대기",
      sections: [
        {
          title: "승인 상태",
          fields: [
            { label: "요청 ID", value: mockIds.cu3RequestId },
            { label: "1차 승인 (이수민)", value: "완료", tone: "ok" },
            { label: "2차 승인 (최종원)", value: "대기 중", tone: "warn" },
            { label: "Policy 버전", value: "v3.2" },
          ],
        },
      ],
      actions: [{ id: "confirm-approve", label: "2차 승인 완료 확인", tone: "accent" }],
    },
    {
      id: "CU3-4",
      layout: "processing",
      title: "Wallet Service 서명 요청",
      subtitle: "zkMPC 서명 생성 중",
      status: "처리 중",
      sections: [
        {
          title: "서명 진행",
          fields: [
            { label: "승인 상태", value: "완료", tone: "ok" },
            { label: "Sign ID", value: mockIds.signId },
            { label: "서명 상태", value: "partial signature 조합 중", tone: "warn" },
          ],
        },
      ],
    },
    {
      id: "CU3-5",
      layout: "processing",
      title: "Tx 제출",
      subtitle: "서명 완료 — 상위 플랫폼 브로드캐스트",
      status: "처리 중",
      sections: [
        {
          title: "Tx 전송",
          fields: [
            { label: "Sign ID", value: mockIds.signId, tone: "ok" },
            { label: "Tx Hash", value: mockHashes.cu3TxHash },
            { label: "전송 상태", value: "브로드캐스트 완료", tone: "ok" },
          ],
        },
      ],
      actions: [{ id: "view-history", label: "출금 이력 확인", tone: "accent" }],
    },
    {
      id: "CU3-6",
      layout: "result",
      title: "출금 이력 확인",
      subtitle: "출금 완료",
      status: "완료",
      sections: [
        {
          title: "출금 결과",
          fields: [
            { label: "Tx Hash", value: mockHashes.cu3TxHash, tone: "accent" },
            { label: "Raw Signature", value: mockHashes.rawSignature },
          ],
        },
      ],
    },
  ],
  steps: [
    {
      id: "CU3-S1",
      kind: "user-action",
      label: "출금 요청 생성",
      trigger: "user",
      ctaLabel: "출금 요청 제출",
      screenId: "CU3-1",
      description: "출금 요청을 생성합니다. 요청 생성 후 승인, 주소 확인, 서명, 전송 상태가 순서대로 기록됩니다.",
      processView: {
        kind: "overview",
        description: "법인 사용자 또는 운영자가 출금 요청을 생성합니다. 아직 실행 전이며 상위 플랫폼이 정책과 승인 요건을 검토하는 단계가 이어집니다.",
        cards: [
          { label: "출금 수량", value: mockAmounts.withdrawAmount },
          { label: "목적지", value: mockHashes.withdrawalAddress },
          { label: "요청 ID", value: mockIds.cu3RequestId },
        ],
      },
    },
    {
      id: "CU3-S2",
      kind: "system-processing",
      label: "승인 / Policy 검토",
      trigger: "user",
      ctaLabel: "2차 승인 완료 확인",
      screenId: "CU3-2",
      description: "상위 플랫폼이 정책 검토 및 2인 승인을 처리합니다. approver_id와 policy_version이 감사 증빙에 활용됩니다.",
      processView: {
        kind: "approval",
        description: "상위 플랫폼이 정책과 승인 요건을 검토합니다. 2인 승인이 모두 완료되어야 다음 단계로 넘어갑니다.",
        approvers: [
          { name: "이수민", role: "대표 (1차 승인)", status: "approved" },
          { name: "최종원", role: "CFO (2차 승인)", status: "pending", note: "검토 중" },
        ],
      },
    },
    {
      id: "CU3-S4",
      kind: "system-processing",
      label: "Wallet Service 서명 요청",
      trigger: "auto",
      duration: 1800,
      screenId: "CU3-4",
      description: "승인이 완료된 출금 요청의 서명을 Wallet Service에서 생성합니다. unsigned tx가 전달되면 분산 서명 처리 후 raw signature가 반환됩니다.",
      processView: {
        kind: "overview",
        description: "승인 완료 후 unsigned tx 또는 sign payload가 Wallet Service로 전달됩니다. Wallet Service가 서명 세션을 만들고 raw signature를 반환합니다.",
        cards: [
          { label: "승인 상태", value: "2-of-2 완료", tone: "ok" },
          { label: "서명 상태", value: "생성 중", tone: "warn" },
          { label: "반환값", value: "raw signature" },
        ],
      },
    },
    {
      id: "CU3-S5",
      kind: "system-processing",
      label: "Tx 제출",
      trigger: "auto",
      duration: 1000,
      screenId: "CU3-5",
      description: "서명 완료 후 전송 상태와 Tx Hash가 기록됩니다.",
      processView: {
        kind: "overview",
        description: "상위 플랫폼이 최종 tx를 조립하고 온체인에 브로드캐스트합니다. 결과 tx hash가 기록됩니다.",
        cards: [
          { label: "Sign ID", value: mockIds.signId, tone: "ok" },
          { label: "Tx Hash", value: mockHashes.cu3TxHash, tone: "accent" },
          { label: "브로드캐스트", value: "상위 플랫폼 담당" },
        ],
      },
    },
    {
      id: "CU3-S6",
      kind: "result",
      label: "출금 이력 확인",
      trigger: "auto",
      duration: 600,
      screenId: "CU3-6",
      description: "출금 결과가 기록됩니다. Tx Hash와 Raw Signature로 처리 결과를 확인할 수 있습니다.",
      processView: {
        kind: "artifact",
        description: "출금 결과가 기록되었습니다. Tx Hash와 Raw Signature로 처리 결과를 확인합니다.",
        items: [
          { label: "Tx Hash", value: mockHashes.cu3TxHash, tone: "accent" },
          { label: "Raw Signature", value: mockHashes.rawSignature },
        ],
      },
    },
  ],
};
