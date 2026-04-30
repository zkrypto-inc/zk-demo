import { mockIds } from "@/mocks/ids";
import { mockAmounts } from "@/mocks/amounts";
import { mockHashes } from "@/mocks/hashes";
import type { Scenario, SequenceContext } from "@/scenarios/types";

const seqActors = ["수탁 운영자", "수탁사", "zkWallet(Custody)"] as const;
const seqPastBase = [{ from: "수탁 운영자", to: "수탁사", label: "출금 요청" }];

const withdrawRequestSeq = (): SequenceContext => ({
  actors: [...seqActors],
  activeEdge: { from: "수탁 운영자", to: "수탁사", label: "출금 요청", tone: "accent" },
});

const signingSeq = (tone: "warn" | "ok"): SequenceContext => ({
  actors: [...seqActors],
  activeEdge: { from: "수탁사", to: "zkWallet(Custody)", label: "서명 요청", tone },
  pastEdges: seqPastBase,
});

const signatureReturnSeq = (tone: "warn" | "ok"): SequenceContext => ({
  actors: [...seqActors],
  activeEdge: { from: "zkWallet(Custody)", to: "수탁사", label: "서명 반환", tone },
  pastEdges: seqPastBase,
});

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
      title: "1차 승인",
      subtitle: "Approval Service — 1차 검토",
      status: "승인 대기",
      sections: [
        {
          title: "승인 상태",
          fields: [
            { label: "요청 ID", value: mockIds.cu3RequestId },
            { label: "1차 승인자", value: "이수민 (대표)" },
            { label: "상태", value: "검토 중", tone: "warn" },
            { label: "2차 승인자", value: "최종원 (CFO)" },
            { label: "2차 상태", value: "대기 중", tone: "neutral" },
          ],
        },
      ],
      actions: [{ id: "confirm-first-approve", label: "1차 승인 완료 확인", tone: "accent" }],
    },
    {
      id: "CU3-3",
      layout: "approval",
      title: "2차 승인 / Policy 검토",
      subtitle: "Approval Service — 2차 검토",
      status: "승인 대기",
      sections: [
        {
          title: "승인 상태",
          fields: [
            { label: "요청 ID", value: mockIds.cu3RequestId },
            { label: "1차 승인 (이수민)", value: "완료", tone: "ok" },
            { label: "2차 승인자", value: "최종원 (CFO)" },
            { label: "상태", value: "검토 중", tone: "warn" },
            { label: "Policy 버전", value: "v3.2" },
          ],
        },
      ],
      actions: [{ id: "confirm-second-approve", label: "2차 승인 완료 확인", tone: "accent" }],
    },
    {
      id: "CU3-4",
      layout: "processing",
      title: "서명 생성 시작",
      subtitle: "서명 시작..",
      status: "처리 중",
      sections: [
        {
          title: "서명 상태",
          fields: [
            { label: "처리", value: "서명 시작..", tone: "warn" },
            { label: "안내", value: "잠시만 기다려주세요" },
          ],
        },
      ],
    },
    {
      id: "CU3-4b",
      layout: "processing",
      title: "서명 생성 진행 중",
      subtitle: "서명 진행 중",
      status: "처리 중",
      sections: [
        {
          title: "서명 상태",
          fields: [
            { label: "처리", value: "서명 진행 중", tone: "warn" },
          ],
        },
      ],
    },
    {
      id: "CU3-4c",
      layout: "processing",
      title: "서명 생성 완료",
      subtitle: "서명 완료",
      status: "진행 중",
      sections: [
        {
          title: "서명 상태",
          fields: [
            { label: "서명 상태", value: "완료", tone: "ok" },
            { label: "Sign ID", value: mockIds.signId },
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
        sequence: withdrawRequestSeq(),
      },
    },
    {
      id: "CU3-S2",
      kind: "system-processing",
      label: "1차 승인",
      trigger: "user",
      ctaLabel: "1차 승인 완료 확인",
      screenId: "CU3-2",
      description: "1차 승인자가 출금 요청을 검토합니다. 승인 완료 후 2차 승인과 정책 검토 단계로 넘어갑니다.",
      processView: {
        kind: "approval",
        description: "1차 승인자가 출금 요청을 검토합니다. 아직 Wallet Service 서명 단계로는 넘어가지 않습니다.",
        approvers: [
          { name: "이수민", role: "대표 (1차 승인)", status: "pending", note: "검토 중" },
          { name: "최종원", role: "CFO (2차 승인)", status: "waiting" },
        ],
      },
    },
    {
      id: "CU3-S3",
      kind: "system-processing",
      label: "2차 승인 / Policy 검토",
      trigger: "user",
      ctaLabel: "2차 승인 완료 확인",
      screenId: "CU3-3",
      description: "2차 승인자가 출금 요청을 최종 검토하고 정책 조건을 확인합니다. 2인 승인이 모두 완료되어야 Wallet Service 서명 요청으로 넘어갑니다.",
      processView: {
        kind: "approval",
        description: "2차 승인과 정책 검토가 함께 진행됩니다. 승인 완료 후에만 Wallet Service 서명 요청이 열립니다.",
        approvers: [
          { name: "이수민", role: "대표 (1차 승인)", status: "approved" },
          { name: "최종원", role: "CFO (2차 승인)", status: "pending", note: "Policy v3.2 검토 중" },
        ],
      },
    },
    {
      id: "CU3-S4",
      kind: "system-processing",
      label: "서명 생성 시작",
      trigger: "auto",
      duration: 1200,
      screenId: "CU3-4",
      description: "MPC 서명에 참여할 Signer 노드 구성이 시작됩니다. 임계값 서명 방식으로 특정 노드 단독으로는 서명이 불가능합니다.",
      processView: {
        kind: "keygen",
        description: "MPC 서명에 참여할 Signer 노드 구성이 시작됩니다. 임계값 서명 방식으로 특정 노드 단독으로는 서명이 불가능합니다.",
        progress: 20,
        showProgress: false,
        nodes: [
          { label: "관리자 노드", value: "세션 시작", tone: "accent" },
          { label: "노드 1", value: "대기 중", tone: "neutral" },
          { label: "노드 2", value: "대기 중", tone: "neutral" },
          { label: "노드 3", value: "대기 중", tone: "neutral" },
        ],
        sequence: signingSeq("warn"),
      },
    },
    {
      id: "CU3-S4b",
      kind: "system-processing",
      label: "서명 생성 진행",
      trigger: "auto",
      duration: 1500,
      screenId: "CU3-4b",
      description: "서명에 필요한 노드 1, 2가 부분 서명(Partial Signature)을 생성합니다. 노드 3은 이번 서명에 참여하지 않습니다.",
      processView: {
        kind: "keygen",
        description: "서명에 필요한 노드 1, 2가 부분 서명(Partial Signature)을 생성합니다. 노드 3은 이번 서명에 참여하지 않습니다.",
        progress: 65,
        showProgress: false,
        nodes: [
          { label: "관리자 노드", value: "세션 조율 중", tone: "accent" },
          { label: "노드 1", value: "처리 중", tone: "warn" },
          { label: "노드 2", value: "처리 중", tone: "warn" },
          { label: "노드 3", value: "대기 중", tone: "neutral" },
        ],
        sequence: signingSeq("warn"),
      },
    },
    {
      id: "CU3-S4c",
      kind: "system-processing",
      label: "서명 생성 완료",
      trigger: "auto",
      duration: 800,
      screenId: "CU3-4c",
      description: "threshold 서명을 통한 분산 서명 완료. 노드 1, 2의 부분 서명이 조합되어 최종 서명이 생성됩니다.",
      processView: {
        kind: "keygen",
        description: "threshold 서명을 통한 분산 서명 완료. 노드 1, 2의 부분 서명이 조합되어 최종 서명이 생성됩니다.",
        progress: 100,
        showProgress: false,
        nodes: [
          { label: "관리자 노드", value: "완료", tone: "accent" },
          { label: "노드 1", value: "완료", tone: "ok" },
          { label: "노드 2", value: "완료", tone: "ok" },
          { label: "노드 3", value: "대기 중", tone: "neutral" },
        ],
        sequence: signatureReturnSeq("ok"),
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
        sequence: signatureReturnSeq("ok"),
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
