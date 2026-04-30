import { mockIds } from "@/mocks/ids";
import { mockAmounts } from "@/mocks/amounts";
import { mockHashes } from "@/mocks/hashes";
import type { Scenario, SequenceContext } from "@/scenarios/types";

const seqActors = ["법인 사용자", "수탁사", "zkWallet(Custody)"] as const;
const seqPastBase = [{ from: "법인 사용자", to: "수탁사", label: "수탁 입금 요청" }];

const depositRequestSeq = (): SequenceContext => ({
  actors: [...seqActors],
  activeEdge: { from: "법인 사용자", to: "수탁사", label: "수탁 입금 요청", tone: "accent" },
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

export const scenarioCU2: Scenario = {
  id: "CU-2",
  name: "수탁용 입금",
  shortName: "수탁 입금",
  actor: "법인 사용자",
  actorType: "web",
  mode: "custody",
  summary: "수탁 내역을 등록하고 관리자 승인을 거쳐 온체인 입금 tx가 전송되는 흐름입니다.",
  screens: [
    {
      id: "CU2-1",
      layout: "form",
      title: "수탁 내역 등록",
      subtitle: "입금할 자산과 수량을 등록합니다",
      status: "대기",
      sections: [
        {
          title: "입금 정보",
          fields: [
            { label: "자산", value: "KRW 스테이블코인" },
            { label: "입금 수량", value: mockAmounts.depositAmount },
            { label: "사유", value: "초기 수탁 자산 납입" },
          ],
        },
      ],
      actions: [{ id: "submit-deposit", label: "수탁 요청", tone: "accent" }],
    },
    {
      id: "CU2-2",
      layout: "approval",
      title: "1차 승인",
      subtitle: "Approval Service — 1차 검토",
      status: "승인 대기",
      sections: [
        {
          title: "승인 상태",
          fields: [
            { label: "요청 ID", value: mockIds.requestId },
            { label: "1차 승인자", value: "이수민 (대표)" },
            { label: "상태", value: "검토 중", tone: "warn" },
            { label: "2차 승인자", value: "최종원 (CFO)" },
            { label: "2차 상태", value: "대기 중", tone: "neutral" },
          ],
        },
      ],
      actions: [{ id: "confirm-first-approval", label: "1차 승인 완료 확인", tone: "accent" }],
    },
    {
      id: "CU2-3",
      layout: "approval",
      title: "2차 승인",
      subtitle: "Approval Service — 2차 검토",
      status: "승인 대기",
      sections: [
        {
          title: "승인 상태",
          fields: [
            { label: "요청 ID", value: mockIds.requestId },
            { label: "1차 승인 (이수민)", value: "완료", tone: "ok" },
            { label: "2차 승인자", value: "최종원 (CFO)" },
            { label: "상태", value: "검토 중", tone: "warn" },
            { label: "Approval Group", value: "2-of-2 필수" },
          ],
        },
      ],
      actions: [{ id: "confirm-second-approval", label: "2차 승인 완료 확인", tone: "accent" }],
    },
    {
      id: "CU2-4",
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
      id: "CU2-4b",
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
      id: "CU2-4c",
      layout: "processing",
      title: "서명 생성 완료",
      subtitle: "서명 완료 — 온체인 전송 중",
      status: "진행 중",
      sections: [
        {
          title: "서명 상태",
          fields: [
            { label: "서명 상태", value: "완료", tone: "ok" },
            { label: "Sign ID", value: mockIds.signId },
            { label: "Tx 전송", value: "브로드캐스트 중", tone: "warn" },
          ],
        },
      ],
    },
    {
      id: "CU2-5",
      layout: "result",
      title: "입금 이력 확인",
      subtitle: "입금 완료",
      status: "완료",
      sections: [
        {
          title: "입금 결과",
          fields: [
            { label: "Tx Hash", value: mockHashes.txHash, tone: "accent" },
            { label: "입금 수량", value: mockAmounts.depositAmount },
            { label: "상태", value: "입금 완료", tone: "ok" },
          ],
        },
      ],
    },
  ],
  steps: [
    {
      id: "CU2-S1",
      kind: "user-action",
      label: "수탁 내역 등록",
      trigger: "user",
      ctaLabel: "수탁 요청",
      screenId: "CU2-1",
      description: "어떤 자산을 어떤 수량으로 수탁 입금할지 요청을 생성합니다. 온체인 전송 기반으로 처리됩니다.",
      processView: {
        kind: "overview",
        description: "어떤 자산을 어떤 수량으로 수탁 입금할지 등록합니다. 실제 온체인 전송형 요청으로 처리됩니다.",
        cards: [
          { label: "자산", value: "KRW 스테이블코인" },
          { label: "입금 수량", value: mockAmounts.depositAmount },
        ],
        sequence: depositRequestSeq(),
      },
    },
    {
      id: "CU2-S2",
      kind: "system-processing",
      label: "1차 승인",
      trigger: "user",
      ctaLabel: "1차 승인 완료 확인",
      screenId: "CU2-2",
      description: "1차 승인자가 수탁 입금 요청을 검토합니다. 승인 완료 후 2차 승인 단계로 넘어갑니다.",
      processView: {
        kind: "approval",
        description: "1차 승인자가 수탁 입금 요청을 검토합니다. 아직 Wallet Service 서명과 tx 전송 단계로는 넘어가지 않습니다.",
        approvers: [
          { name: "이수민", role: "대표 (1차 승인)", status: "pending", note: "검토 중" },
          { name: "최종원", role: "CFO (2차 승인)", status: "waiting" },
        ],
      },
    },
    {
      id: "CU2-S3",
      kind: "system-processing",
      label: "2차 승인",
      trigger: "user",
      ctaLabel: "2차 승인 완료 확인",
      screenId: "CU2-3",
      description: "2차 승인자가 수탁 입금 요청을 최종 검토합니다. 2인 승인이 모두 완료되어야 Wallet Service 서명과 온체인 전송이 진행됩니다.",
      processView: {
        kind: "approval",
        description: "2차 승인자가 수탁 입금 요청을 검토합니다. 승인 완료 후 Wallet Service 서명과 tx 전송 단계가 열립니다.",
        approvers: [
          { name: "이수민", role: "대표 (1차 승인)", status: "approved" },
          { name: "최종원", role: "CFO (2차 승인)", status: "pending", note: "검토 중" },
        ],
      },
    },
    {
      id: "CU2-S4",
      kind: "system-processing",
      label: "서명 생성 시작",
      trigger: "auto",
      duration: 1200,
      screenId: "CU2-4",
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
      id: "CU2-S4b",
      kind: "system-processing",
      label: "서명 생성 진행",
      trigger: "auto",
      duration: 1500,
      screenId: "CU2-4b",
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
      id: "CU2-S4c",
      kind: "system-processing",
      label: "서명 생성 완료",
      trigger: "auto",
      duration: 800,
      screenId: "CU2-4c",
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
      id: "CU2-S5",
      kind: "result",
      label: "입금 이력 확인",
      trigger: "auto",
      duration: 600,
      screenId: "CU2-5",
      description: "수탁 입금 처리가 완료되었습니다. Tx Hash를 기준으로 온체인 이력을 확인할 수 있습니다.",
      processView: {
        kind: "artifact",
        description: "입금 결과가 기록되었습니다. Tx Hash를 기준으로 온체인 이력을 확인할 수 있습니다.",
        items: [
          { label: "Tx Hash", value: mockHashes.txHash, tone: "accent" },
          { label: "입금 수량", value: mockAmounts.depositAmount },
          { label: "상태", value: "입금 완료", tone: "ok" },
        ],
      },
    },
  ],
};
