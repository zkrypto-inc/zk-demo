import { mockIds } from "@/mocks/ids";
import { mockAmounts } from "@/mocks/amounts";
import { mockHashes } from "@/mocks/hashes";
import type { Scenario } from "@/scenarios/types";

export const scenarioFU2: Scenario = {
  id: "FU-2",
  name: "거래 서명 요청",
  shortName: "서명 요청",
  actor: "개인 사용자",
  actorType: "mobile",
  mode: "personal",
  summary: "개인 사용자가 TX를 요청했을 때 Wallet Service가 signer quorum을 구성하고 raw signature를 반환하는 흐름입니다.",
  screens: [
    {
      id: "FU2-1",
      layout: "form",
      title: "거래 요청",
      subtitle: "보낼 금액과 주소를 입력하세요",
      status: "대기",
      sections: [
        {
          title: "거래 정보",
          fields: [
            { label: "자산", value: "KRW 스테이블코인" },
            { label: "금액", value: mockAmounts.userTxAmount },
            { label: "받는 주소", value: mockHashes.recipientAddress },
          ],
        },
      ],
      actions: [{ id: "submit-tx", label: "서명 요청", tone: "accent" }],
    },
    {
      id: "FU2-2",
      layout: "processing",
      title: "본인 확인",
      subtitle: "거래 요청 전 사용자 검증",
      status: "처리 중",
      sections: [
        {
          title: "검증 상태",
          fields: [
            { label: "검증 방식", value: "생체인증" },
            { label: "상태", value: "인증 중", tone: "warn" },
          ],
        },
      ],
    },
    {
      id: "FU2-3",
      layout: "processing",
      title: "서명 준비 중",
      subtitle: "보안 처리 구성 중",
      status: "처리 중",
      sections: [
        {
          title: "서명 상태",
          fields: [
            { label: "검증", value: "완료", tone: "ok" },
            { label: "서명 준비", value: "보안 처리 구성 중", tone: "warn" },
          ],
        },
      ],
    },
    {
      id: "FU2-4",
      layout: "processing",
      title: "서명 조합 중",
      subtitle: "잠시만 기다려주세요",
      status: "처리 중",
      sections: [
        {
          title: "처리 상태",
          fields: [
            { label: "처리", value: "서명 조합 진행 중", tone: "warn" },
            { label: "Sign ID", value: mockIds.signId },
          ],
        },
      ],
    },
    {
      id: "FU2-5",
      layout: "result",
      title: "거래 승인 완료",
      subtitle: "서명이 준비되었습니다",
      status: "완료",
      sections: [
        {
          title: "거래 결과",
          fields: [
            { label: "금액", value: mockAmounts.userTxAmount },
            { label: "받는 주소", value: mockHashes.recipientAddress },
            { label: "Sign ID", value: mockIds.signId, tone: "accent" },
            { label: "상태", value: "서명 완료", tone: "ok" },
          ],
        },
      ],
      footer: "최종 거래 제출은 앱 플랫폼이 처리합니다.",
    },
  ],
  steps: [
    {
      id: "FU2-S1",
      kind: "user-action",
      label: "거래 요청 생성",
      trigger: "user",
      ctaLabel: "서명 요청",
      screenId: "FU2-1",
      description: "거래 대상과 금액을 입력하여 서명 요청을 생성합니다. 아직 실행 전이며 사용자 인증 단계가 이어집니다.",
      processView: {
        kind: "overview",
        description: "사용자가 어떤 거래를 보내려는지 정의합니다. 아직 실행 전이며 요청을 만드는 단계입니다.",
        cards: [
          { label: "금액", value: mockAmounts.userTxAmount },
          { label: "받는 주소", value: mockHashes.recipientAddress },
          { label: "단계", value: "요청 생성" },
        ],
      },
    },
    {
      id: "FU2-S2",
      kind: "system-processing",
      label: "사용자 검증",
      trigger: "auto",
      duration: 1200,
      screenId: "FU2-2",
      description: "요청자 본인 여부를 생체인증으로 확인합니다. 인증이 완료된 이후에만 서명 처리 단계로 진행됩니다.",
      processView: {
        kind: "overview",
        description: "요청자가 실제 사용자 본인인지 확인합니다. 인증 성공 후 다음 단계로 넘어갑니다.",
        cards: [
          { label: "검증 방식", value: "생체인증" },
          { label: "상태", value: "인증 진행 중", tone: "warn" },
        ],
      },
    },
    {
      id: "FU2-S3",
      kind: "system-processing",
      label: "Signer Quorum 구성",
      trigger: "auto",
      duration: 1000,
      screenId: "FU2-3",
      description: "MPC 서명에 참여할 Signer 노드 구성이 시작됩니다. 임계값 서명 방식으로 특정 노드 단독으로는 서명이 불가능합니다.",
      processView: {
        kind: "keygen",
        description: "서명에 필요한 보안 처리 구성이 준비됩니다. 앱에는 서명 준비 상태가 표시됩니다.",
        progress: 40,
        nodes: [
          { label: "Signer 1", value: "선정 완료", tone: "ok" },
          { label: "Signer 2", value: "선정 완료", tone: "ok" },
          { label: "Signer 3", value: "선정 중", tone: "warn" },
        ],
      },
    },
    {
      id: "FU2-S4",
      kind: "system-processing",
      label: "Partial Signature 생성",
      trigger: "auto",
      duration: 1500,
      screenId: "FU2-4",
      description: "각 Signer 노드가 부분 서명(Partial Signature)을 생성하고 조합합니다. 완전한 서명은 조합이 완료된 후 생성됩니다.",
      processView: {
        kind: "keygen",
        description: "서명 조합 과정이 진행 중입니다. 보안 처리가 단계적으로 이뤄지는 느낌만 전달하면 충분합니다.",
        progress: 75,
        nodes: [
          { label: "Signer 1", value: "partial sig 완료", tone: "ok" },
          { label: "Signer 2", value: "partial sig 완료", tone: "ok" },
          { label: "Signer 3", value: "조합 중", tone: "warn" },
        ],
      },
    },
    {
      id: "FU2-S5",
      kind: "result",
      label: "Raw Signature 반환",
      trigger: "auto",
      duration: 600,
      screenId: "FU2-5",
      description: "서명 결과가 반환되었습니다. 앱에서 거래 상태와 서명 이력을 확인할 수 있습니다.",
      processView: {
        kind: "artifact",
        description: "서명 결과가 준비되었습니다. 상위 플랫폼이 이후 제출을 이어받는다는 경계를 짧게 보여줍니다.",
        items: [
          { label: "Sign ID", value: mockIds.signId, tone: "accent" },
          { label: "금액", value: mockAmounts.userTxAmount },
          { label: "Public Key", value: mockHashes.publicKey },
          { label: "상태", value: "서명 완료", tone: "ok" },
          { label: "최종 제출", value: "상위 플랫폼 처리" },
        ],
      },
    },
  ],
};
