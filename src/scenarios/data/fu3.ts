import type { Scenario } from "@/scenarios/types";

export const scenarioFU3: Scenario = {
  id: "FU-3",
  groupId: "personal",
  planningId: "FU-3",
  name: "개인 사용자 결과 요약",
  shortName: "결과 요약",
  actor: "개인 사용자 / 운영자",
  actorType: "web",
  mode: "personal",
  summary: "FU-1 지갑 생성과 FU-2 서명 요청의 결과를 한 화면에 묶어 발표 흐름을 닫고, 수탁 운영 시나리오로 자연스럽게 연결합니다.",
  screens: [
    {
      id: "FU3-1",
      layout: "recap",
      actorType: "web",
      webContext: { menuItem: "결과 요약", pageTitle: "개인 사용자 결과 요약", host: "app.zkwallet.io" },
      actor: "개인 사용자 / 발표용 정리 화면",
      title: "FU-1 지갑 생성 → FU-2 서명 요청, 3분 여정 요약",
      recap: {
        eyebrow: "ZKWALLET · 개인사용자 핵심 플로우",
        heading: "FU-1 지갑 생성 → FU-2 서명 요청, 3분 여정 요약",
        badges: ["FU-1 지갑 생성", "FU-2 서명 요청", "수탁 운영으로 연결"],
        panels: [
          {
            title: "FU-1 결과 요약",
            groupTitle: "지갑 생성 결과",
            rows: [
              { label: "Wallet ID", value: "wallet_07KZB3C92", mono: true },
              { label: "지갑 주소", value: "0x7a2c...2c10", mono: true },
              { label: "MPC 키 생성", value: "완료", ok: true },
              { label: "개인키 보관", value: "단일 서버 보관 없음", ok: true },
              { label: "감사 이벤트", value: "audit.wallet.created · 2026-05-13 09:41", mono: true },
            ],
            cta: {
              label: "FU-1 지갑 생성 시나리오 다시 보기",
              target: { type: "scenario", scenarioId: "FU-1" },
            },
          },
          {
            title: "FU-2 결과 요약",
            groupTitle: "서명 요청 결과",
            rows: [
              { label: "거래 요청 ID", value: "tx_FU2_2048", mono: true },
              { label: "서명 요청 상태", value: "완료", ok: true },
              { label: "Signer quorum", value: "2-of-3" },
              { label: "Tx 준비", value: "완료", ok: true },
              { label: "Raw Signature", value: "3044022059d9f7b32b5c6e8a10220...", mono: true },
            ],
            cta: {
              label: "이 거래가 뒤에서 어떻게 처리됐는지 보기 (수탁 운영)",
              target: { type: "actor", actorId: "custody" },
              tone: "accent",
            },
          },
        ],
      },
      sections: [],
    },
  ],
  steps: [
    {
      id: "FU3-step-1",
      kind: "result",
      label: "결과 요약",
      trigger: "user",
      ctaLabel: "다음 단계",
      screenId: "FU3-1",
      description: "FU-1·FU-2 결과를 한 화면으로 정리한 페이지입니다",
      processView: {
        kind: "overview",
        description: "FU-1 지갑 생성과 FU-2 서명 요청 결과를 좌우 패널로 묶어 한 번에 보여줍니다. 우측 CTA로 수탁 운영 시나리오에 진입하면 정책·승인·MPC 서명·감사 로그 흐름을 이어서 확인할 수 있습니다.",
        cards: [
          { label: "FU-1 지갑 생성", value: "완료", tone: "ok" },
          { label: "FU-2 서명 요청", value: "완료", tone: "ok" },
          { label: "후속 흐름", value: "수탁 운영" },
        ],
      },
    },
  ],
};
