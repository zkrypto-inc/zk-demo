import { mockIds } from "@/mocks/ids";
import { mockHashes } from "@/mocks/hashes";
import type { Scenario } from "@/scenarios/types";

const seqActors = ["사용자", "스테이블코인 플랫폼", "zkWallet(Custody)"] as const;
const seqPastBase = [{ from: "사용자", to: "스테이블코인 플랫폼", label: "가입" }];

export const scenarioFU1: Scenario = {
  id: "FU-1",
  name: "지갑 생성 → Keygen",
  shortName: "지갑 생성",
  actor: "개인 사용자",
  actorType: "mobile",
  mode: "personal",
  summary: "개인 사용자가 슈퍼앱에서 지갑을 생성하고 주소 발급 상태를 확인하는 흐름입니다.",
  screens: [
    {
      id: "FU1-1",
      layout: "cta",
      title: "새 지갑 만들기",
      subtitle: "지갑 생성을 시작합니다",
      status: "대기",
      sections: [],
      actions: [{ id: "start-keygen", label: "지갑 개설", tone: "accent" }],
    },
    {
      id: "FU1-2",
      layout: "processing",
      title: "보안 키 생성 중",
      subtitle: "안전하게 지갑을 준비하는 중",
      status: "처리 중",
      sections: [
        {
          title: "처리 상태",
          fields: [
            { label: "처리", value: "MPC 연산 처리 중", tone: "warn" },
            { label: "안내", value: "잠시만 기다려주세요" },
          ],
        },
      ],
    },
    {
      id: "FU1-3",
      layout: "processing",
      title: "키 생성 진행 중",
      subtitle: "지갑 준비 중 — 완료까지 잠시 기다려주세요",
      status: "처리 중",
      sections: [
        {
          title: "진행 상태",
          fields: [
            { label: "처리 상태", value: "안전하게 키 생성 중", tone: "warn" },
          ],
        },
      ],
    },
    {
      id: "FU1-4",
      layout: "processing",
      title: "키 생성 완료",
      subtitle: "키 생성이 완료되었습니다",
      status: "진행 중",
      sections: [
        {
          title: "키 생성 결과",
          fields: [
            { label: "지갑 상태", value: "준비 완료", tone: "ok" },
            { label: "키 생성", value: "완료", tone: "ok" },
            { label: "Wallet ID", value: mockIds.walletId },
          ],
        },
      ],
    },
    {
      id: "FU1-5",
      layout: "result",
      title: "지갑 개설 완료",
      subtitle: "주소와 잔액이 확인됩니다",
      status: "완료",
      sections: [
        {
          title: "지갑 정보",
          fields: [
            { label: "지갑 주소", value: mockHashes.userAddress },
            { label: "Wallet ID", value: mockIds.walletId, tone: "accent" },
            { label: "잔액", value: "0 KRW" },
            { label: "코인", value: "KRW" },
            { label: "상태", value: "사용 가능", tone: "ok" },
          ],
        },
      ],
    },
  ],
  steps: [
    {
      id: "FU1-S1",
      kind: "user-action",
      label: "지갑 생성 요청",
      trigger: "user",
      ctaLabel: "지갑 개설",
      screenId: "FU1-1",
      description: "지갑 생성 요청을 시작합니다. 내부적으로 MPC 기반 분산 키 생성 프로세스가 시작됩니다.",
      processView: {
        kind: "overview",
        description: "지갑 생성을 시작합니다.",
        cardsPosition: "aboveSequence",
        cards: [
          { label: "지갑 유형", value: "개인 지갑" },
          { label: "보안 방식", value: "MPC 기반 분산 처리" },
        ],
        sequence: {
          actors: [...seqActors],
          activeEdge: { from: "스테이블코인 플랫폼", to: "zkWallet(Custody)", label: "지갑 생성/키 생성", tone: "accent" },
          pastEdges: seqPastBase,
        },
      },
    },
    {
      id: "FU1-S2",
      kind: "system-processing",
      label: "보안 키 생성 시작",
      trigger: "auto",
      duration: 1200,
      screenId: "FU1-2",
      description: "Wallet Service가 MPC 기반 보안 키 생성을 시작합니다. 개인 키는 단일 서버에 보관되지 않습니다.",
      processView: {
        kind: "keygen",
        description: "보안 키 생성이 시작되었습니다. 앱에는 지갑 준비 상태가 단계별로 표시됩니다.",
        progress: 20,
        showProgress: false,
        nodes: [
          { label: "관리자 노드", value: "세션 시작", tone: "accent" },
          { label: "노드 1", value: "대기 중", tone: "warn" },
          { label: "노드 2", value: "대기 중", tone: "warn" },
          { label: "노드 3", value: "대기 중", tone: "warn" },
        ],
      },
    },
    {
      id: "FU1-S3",
      kind: "system-processing",
      label: "키 생성 진행 중",
      trigger: "auto",
      duration: 1500,
      screenId: "FU1-3",
      description: "지갑 생성 진행률과 예상 완료 상태를 확인합니다.",
      processView: {
        kind: "keygen",
        description: "지갑 생성이 진행 중입니다. 단계형 로딩 또는 상태 카드로 표현됩니다.",
        progress: 72,
        showProgress: false,
        nodes: [
          { label: "관리자 노드", value: "세션 조율 중", tone: "accent" },
          { label: "노드 1", value: "처리 중", tone: "warn" },
          { label: "노드 2", value: "처리 중", tone: "warn" },
          { label: "노드 3", value: "처리 중", tone: "warn" },
        ],
      },
    },
    {
      id: "FU1-S4",
      kind: "system-processing",
      label: "키 생성 완료",
      trigger: "auto",
      duration: 800,
      screenId: "FU1-4",
      description: "키 생성이 완료되고 지갑이 사용할 준비 상태로 전환됩니다.",
      processView: {
        kind: "keygen",
        description: "키 생성이 완료되었습니다. 사용 가능한 상태로 바뀌었음을 보여줍니다.",
        progress: 100,
        showProgress: false,
        nodes: [
          { label: "관리자 노드", value: "완료", tone: "accent" },
          { label: "노드 1", value: "완료", tone: "ok" },
          { label: "노드 2", value: "완료", tone: "ok" },
          { label: "노드 3", value: "완료", tone: "ok" },
        ],
      },
    },
    {
      id: "FU1-S5",
      kind: "result",
      label: "지갑 개설 완료",
      trigger: "auto",
      duration: 600,
      screenId: "FU1-5",
      description: "지갑 개설이 완료되었습니다. Wallet ID와 지갑 주소가 발급됩니다.",
      processView: {
        kind: "artifact",
        description: "지갑 정보가 사용자 화면에 표시됩니다. 최종 결과 화면으로 마무리됩니다.",
        items: [
          { label: "Wallet ID", value: mockIds.walletId, tone: "accent" },
          { label: "지갑 주소", value: mockHashes.userAddress },
          { label: "Key ID", value: mockIds.keyId },
          { label: "코인", value: "KRW" },
          { label: "상태", value: "사용 가능", tone: "ok" },
        ],
        sequence: {
          actors: [...seqActors],
          activeEdge: { from: "zkWallet(Custody)", to: "스테이블코인 플랫폼", label: "지갑 주소 발급", tone: "ok" },
          pastEdges: seqPastBase,
        },
      },
    },
  ],
};
