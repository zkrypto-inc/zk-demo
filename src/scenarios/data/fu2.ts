import { mockIds } from "@/mocks/ids";
import { mockAmounts } from "@/mocks/amounts";
import { mockHashes } from "@/mocks/hashes";
import type { Scenario, SequenceContext } from "@/scenarios/types";

const seqActors = ["사용자", "스테이블코인 플랫폼", "zkWallet(Custody)"] as const;
const seqPastBase = [{ from: "사용자", to: "스테이블코인 플랫폼", label: "거래 요청" }];

// S2~S4: SC→WalletService "서명 요청" 유지하며 tone 변경
const signingSeq = (tone: "warn" | "ok"): SequenceContext => ({
  actors: [...seqActors],
  activeEdge: { from: "스테이블코인 플랫폼", to: "zkWallet(Custody)", label: "서명 요청", tone },
  pastEdges: seqPastBase,
});

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
            { label: "코인 심볼", value: "KRW 스테이블코인" },
            { label: "금액", value: mockAmounts.userTxAmount },
            { label: "받는 주소", value: mockHashes.recipientAddress },
          ],
        },
      ],
      actions: [{ id: "submit-tx", label: "거래 요청", tone: "accent" }],
    },
    {
      id: "FU2-2",
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
      id: "FU2-3",
      layout: "processing",
      title: "서명 생성 진행 중",
      subtitle: "서명 진행중.",
      status: "처리 중",
      sections: [
        {
          title: "서명 상태",
          fields: [
            { label: "처리", value: "서명 진행중.", tone: "warn" },
          ],
        },
      ],
    },
    {
      id: "FU2-4",
      layout: "processing",
      title: "서명 생성 완료",
      subtitle: "threshold 서명을 통한 분산 서명 완료",
      status: "진행 중",
      sections: [
        {
          title: "서명 결과",
          fields: [
            { label: "서명 상태", value: "완료", tone: "ok" },
            { label: "Sign ID", value: mockIds.signId },
          ],
        },
      ],
    },
    {
      id: "FU2-5",
      layout: "processing",
      title: "트랜잭션 실행",
      subtitle: "블록체인에 트랜잭션을 제출하는 중",
      status: "처리 중",
      sections: [
        {
          title: "제출 상태",
          fields: [
            { label: "처리", value: "tx 제출 중", tone: "warn" },
          ],
        },
      ],
    },
    {
      id: "FU2-6",
      layout: "result",
      title: "거래가 완료되었어요!",
      subtitle: "거래 내역을 확인하세요",
      status: "완료",
      sections: [
        {
          title: "거래 결과",
          fields: [
            { label: "Tx Hash", value: mockHashes.txHash, tone: "accent" },
            { label: "Raw Signature", value: mockHashes.rawSignature },
            { label: "금액", value: mockAmounts.userTxAmount },
            { label: "코인 심볼", value: "KRW" },
          ],
        },
      ],
    },
  ],
  steps: [
    {
      id: "FU2-S1",
      kind: "user-action",
      label: "거래 요청 생성",
      trigger: "user",
      ctaLabel: "거래 요청",
      screenId: "FU2-1",
      description: "거래 대상과 금액을 입력하여 거래 요청을 생성합니다. 아직 실행 전이며 서명 단계가 이어집니다.",
      processView: {
        kind: "sequence",
        actors: [...seqActors],
        activeEdge: { from: "스테이블코인 플랫폼", to: "zkWallet(Custody)", label: "서명 요청", tone: "accent" },
        pastEdges: seqPastBase,
      },
    },
    {
      id: "FU2-S2",
      kind: "system-processing",
      label: "서명 생성 시작",
      trigger: "auto",
      duration: 1200,
      screenId: "FU2-2",
      description: "MPC 서명에 참여할 Signer 노드 구성이 시작됩니다. 임계값 서명 방식으로 특정 노드 단독으로는 서명이 불가능합니다.",
      processView: {
        kind: "keygen",
        description: "MPC 서명에 참여할 Signer 노드 구성이 시작됩니다. 임계값 서명 방식으로 특정 노드 단독으로는 서명이 불가능합니다.",
        progress: 20,
        nodes: [
          { label: "관리자 노드", value: "세션 시작", tone: "accent" },
          { label: "노드 1", value: "대기 중", tone: "warn" },
          { label: "노드 2", value: "대기 중", tone: "warn" },
          { label: "노드 3", value: "대기 중", tone: "neutral" },
        ],
        sequence: signingSeq("warn"),
      },
    },
    {
      id: "FU2-S3",
      kind: "system-processing",
      label: "서명 생성 진행",
      trigger: "auto",
      duration: 1500,
      screenId: "FU2-3",
      description: "서명에 필요한 노드 1, 2가 부분 서명(Partial Signature)을 생성합니다. 노드 3은 이번 서명에 참여하지 않습니다.",
      processView: {
        kind: "keygen",
        description: "서명에 필요한 노드 1, 2가 부분 서명(Partial Signature)을 생성합니다. 노드 3은 이번 서명에 참여하지 않습니다.",
        progress: 65,
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
      id: "FU2-S4",
      kind: "system-processing",
      label: "서명 생성 완료",
      trigger: "auto",
      duration: 800,
      screenId: "FU2-4",
      description: "threshold 서명을 통한 분산 서명 완료. 노드 1, 2의 부분 서명이 조합되어 최종 서명이 생성됩니다.",
      processView: {
        kind: "keygen",
        description: "threshold 서명을 통한 분산 서명 완료. 노드 1, 2의 부분 서명이 조합되어 최종 서명이 생성됩니다.",
        progress: 100,
        nodes: [
          { label: "관리자 노드", value: "완료", tone: "accent" },
          { label: "노드 1", value: "완료", tone: "ok" },
          { label: "노드 2", value: "완료", tone: "ok" },
          { label: "노드 3", value: "대기 중", tone: "neutral" },
        ],
        sequence: signingSeq("ok"),
      },
    },
    {
      id: "FU2-S5",
      kind: "system-processing",
      label: "트랜잭션 실행",
      trigger: "auto",
      duration: 1000,
      screenId: "FU2-5",
      description: "서명이 완료된 트랜잭션을 블록체인에 제출합니다.",
      processView: {
        kind: "overview",
        description: "서명이 완료된 트랜잭션을 블록체인에 제출합니다.",
        cards: [
          { label: "서명 상태", value: "완료", tone: "ok" },
          { label: "Sign ID", value: mockIds.signId },
          { label: "제출 상태", value: "tx 전송 중", tone: "warn" },
        ],
        sequence: {
          actors: [...seqActors],
          activeEdge: { from: "zkWallet(Custody)", to: "스테이블코인 플랫폼", label: "서명 반환", tone: "ok" },
          pastEdges: seqPastBase,
        },
      },
    },
    {
      id: "FU2-S6",
      kind: "result",
      label: "거래 내역 확인",
      trigger: "auto",
      duration: 600,
      screenId: "FU2-6",
      description: "거래가 완료되었습니다. Tx Hash와 서명 내역을 확인할 수 있습니다.",
      processView: {
        kind: "artifact",
        description: "거래가 완료되었습니다. Tx Hash와 서명 내역을 확인할 수 있습니다.",
        items: [
          { label: "Tx Hash", value: mockHashes.txHash, tone: "accent" },
          { label: "Raw Signature", value: mockHashes.rawSignature },
          { label: "금액", value: mockAmounts.userTxAmount },
          { label: "코인 심볼", value: "KRW" },
        ],
        sequence: {
          actors: [...seqActors],
          activeEdge: { from: "스테이블코인 플랫폼", to: "사용자", label: "거래 완료", tone: "ok" },
          pastEdges: seqPastBase,
        },
      },
    },
  ],
};
