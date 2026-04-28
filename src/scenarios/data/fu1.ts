import { mockIds } from "@/mocks/ids";
import { mockHashes } from "@/mocks/hashes";
import type { Scenario } from "@/scenarios/types";

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
      sections: [
        {
          title: "안내",
          fields: [
            { label: "지갑 유형", value: "개인 지갑" },
            { label: "보안 방식", value: "분산 보안 처리" },
            { label: "안내", value: "개인키는 단일 서버에 저장되지 않습니다" },
          ],
        },
      ],
      actions: [{ id: "start-keygen", label: "지갑 만들기", tone: "accent" }],
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
            { label: "처리", value: "분산 보안 처리 중", tone: "warn" },
            { label: "안내", value: "잠시만 기다려주세요" },
          ],
        },
      ],
    },
    {
      id: "FU1-3",
      layout: "processing",
      title: "생성 진행 중",
      subtitle: "지갑 준비 중 — 완료까지 잠시 기다려주세요",
      status: "처리 중",
      sections: [
        {
          title: "진행 상태",
          fields: [
            { label: "진행률", value: "72%" },
            { label: "예상 완료", value: "수 초 내" },
          ],
        },
      ],
    },
    {
      id: "FU1-4",
      layout: "processing",
      title: "지갑 연결 완료",
      subtitle: "계정에 지갑이 연결되었습니다",
      status: "진행 중",
      sections: [
        {
          title: "연결 상태",
          fields: [
            { label: "지갑 상태", value: "준비 완료", tone: "ok" },
            { label: "계정 연결", value: "완료", tone: "ok" },
            { label: "Wallet ID", value: mockIds.walletId },
          ],
        },
      ],
    },
    {
      id: "FU1-5",
      layout: "result",
      title: "지갑 준비 완료",
      subtitle: "주소와 잔액이 확인됩니다",
      status: "완료",
      sections: [
        {
          title: "지갑 정보",
          fields: [
            { label: "지갑 주소", value: mockHashes.userAddress },
            { label: "Wallet ID", value: mockIds.walletId, tone: "accent" },
            { label: "잔액", value: "0 KRW" },
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
      ctaLabel: "지갑 만들기",
      screenId: "FU1-1",
      description: "가장 중요한 CTA가 분명해야 합니다. 보안 구조 전체보다 생성 시작 상태만 이해하면 됩니다.",
      processView: {
        kind: "overview",
        description: "지갑 생성을 시작합니다. 사용자는 보안 구조 전체보다 생성 시작 상태만 이해하면 됩니다.",
        cards: [
          { label: "지갑 유형", value: "개인 지갑" },
          { label: "보안 방식", value: "MPC 기반 분산 처리" },
          { label: "Wallet ID", value: mockIds.walletId },
        ],
      },
    },
    {
      id: "FU1-S2",
      kind: "system-processing",
      label: "보안 키 생성 시작",
      trigger: "auto",
      duration: 1200,
      screenId: "FU1-2",
      description: "사용자는 기술명을 몰라도 안전하게 준비 중이라는 감각을 가져가면 됩니다.",
      processView: {
        kind: "keygen",
        description: "보안 키 생성이 시작되었습니다. 앱에는 지갑 준비 상태가 단계별로 표시됩니다.",
        progress: 20,
        nodes: [
          { label: "Node 1", value: "초기화 중", tone: "warn" },
          { label: "Node 2", value: "대기 중" },
          { label: "Node 3", value: "대기 중" },
        ],
      },
    },
    {
      id: "FU1-S3",
      kind: "system-processing",
      label: "생성 진행 상태 확인",
      trigger: "auto",
      duration: 1500,
      screenId: "FU1-3",
      description: "지갑 생성 진행률과 예상 완료 상태를 확인합니다.",
      processView: {
        kind: "keygen",
        description: "지갑 생성이 진행 중입니다. 단계형 로딩 또는 상태 카드로 표현됩니다.",
        progress: 72,
        nodes: [
          { label: "Node 1", value: "완료", tone: "ok" },
          { label: "Node 2", value: "완료", tone: "ok" },
          { label: "Node 3", value: "처리 중", tone: "warn" },
        ],
      },
    },
    {
      id: "FU1-S4",
      kind: "system-processing",
      label: "지갑 연결 완료",
      trigger: "auto",
      duration: 800,
      screenId: "FU1-4",
      description: "이 단계부터 사용자는 실제 지갑을 가진 것으로 인식합니다.",
      processView: {
        kind: "keygen",
        description: "지갑이 계정에 연결되었습니다. 사용 가능한 상태로 바뀌었음을 보여줍니다.",
        progress: 100,
        nodes: [
          { label: "Node 1", value: "완료", tone: "ok" },
          { label: "Node 2", value: "완료", tone: "ok" },
          { label: "Node 3", value: "완료", tone: "ok" },
        ],
      },
    },
    {
      id: "FU1-S5",
      kind: "result",
      label: "주소 매핑 완료",
      trigger: "auto",
      duration: 600,
      screenId: "FU1-5",
      description: "결과가 명확하게 보이는 종료 화면이 필요합니다.",
      processView: {
        kind: "artifact",
        description: "지갑 정보가 사용자 화면에 표시됩니다. 최종 결과 화면으로 마무리됩니다.",
        items: [
          { label: "Wallet ID", value: mockIds.walletId, tone: "accent" },
          { label: "지갑 주소", value: mockHashes.userAddress },
          { label: "Key ID", value: mockIds.keyId },
          { label: "상태", value: "사용 가능", tone: "ok" },
        ],
      },
    },
  ],
};
