import { mockIds } from "@/mocks/ids";
import { mockAmounts } from "@/mocks/amounts";
import { mockHashes } from "@/mocks/hashes";
import type { Scenario } from "@/scenarios/types";

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
            { label: "수탁 지갑", value: mockIds.custodyWalletId },
            { label: "사유", value: "초기 수탁 자산 납입" },
          ],
        },
      ],
      actions: [{ id: "submit-deposit", label: "입금 등록", tone: "accent" }],
    },
    {
      id: "CU2-2",
      layout: "approval",
      title: "수탁 관리자 승인",
      subtitle: "Approval Service — 2인 승인 대기",
      status: "승인 대기",
      sections: [
        {
          title: "승인 현황",
          fields: [
            { label: "요청 ID", value: mockIds.requestId },
            { label: "1차 승인 (이수민)", value: "완료", tone: "ok" },
            { label: "2차 승인 (최종원)", value: "대기 중", tone: "warn" },
            { label: "Approval Group", value: "2-of-2 필수" },
          ],
        },
      ],
      actions: [{ id: "check-approval", label: "승인 완료 확인", tone: "accent" }],
    },
    {
      id: "CU2-3",
      layout: "processing",
      title: "서명 생성 및 Tx 전송",
      subtitle: "Wallet Service 서명 → 온체인 전송",
      status: "처리 중",
      sections: [
        {
          title: "전송 상태",
          fields: [
            { label: "승인 상태", value: "완료", tone: "ok" },
            { label: "서명 상태", value: "생성 완료", tone: "ok" },
            { label: "Sign ID", value: mockIds.signId },
            { label: "Tx 전송", value: "브로드캐스트 중", tone: "warn" },
          ],
        },
      ],
      actions: [{ id: "confirm-tx", label: "Tx 확인", tone: "accent" }],
    },
    {
      id: "CU2-4",
      layout: "result",
      title: "입금 이력 확인",
      subtitle: "입금 완료 및 감사 추적 가능",
      status: "완료",
      sections: [
        {
          title: "입금 결과",
          fields: [
            { label: "Tx Hash", value: mockHashes.txHash, tone: "accent" },
            { label: "입금 수량", value: mockAmounts.depositAmount },
            { label: "Request ID", value: mockIds.requestId },
            { label: "Audit Event ID", value: mockIds.auditEventId },
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
      ctaLabel: "입금 등록",
      screenId: "CU2-1",
      description: "단순 주소 조회가 아니라 실제 입금 요청을 만드는 단계로 보이게 해야 합니다.",
      processView: {
        kind: "overview",
        description: "어떤 자산을 어떤 수량으로 수탁 입금할지 등록합니다. 실제 온체인 전송형 요청으로 처리됩니다.",
        cards: [
          { label: "자산", value: "KRW 스테이블코인" },
          { label: "입금 수량", value: mockAmounts.depositAmount },
          { label: "수탁 지갑", value: mockIds.custodyWalletId },
        ],
      },
    },
    {
      id: "CU2-S2",
      kind: "system-processing",
      label: "수탁 관리자 승인",
      trigger: "user",
      ctaLabel: "승인 완료 확인",
      screenId: "CU2-2",
      description: "이 단계는 업무 승인과 MPC 서명을 분리해 보여주는 핵심 화면입니다.",
      processView: {
        kind: "approval",
        description: "수탁 관리자 2명이 입금 요청을 승인합니다. 승인 완료 후에만 Wallet Service 서명과 tx 전송 단계가 열립니다.",
        approvers: [
          { name: "이수민", role: "대표 (1차 승인)", status: "approved" },
          { name: "최종원", role: "CFO (2차 승인)", status: "pending", note: "검토 중" },
        ],
      },
    },
    {
      id: "CU2-S3",
      kind: "system-processing",
      label: "서명 생성 / Tx 전송",
      trigger: "auto",
      duration: 2000,
      screenId: "CU2-3",
      description: "승인된 입금 요청에 대해 서명과 전송 상태를 확인합니다.",
      processView: {
        kind: "overview",
        description: "승인 완료 후 Wallet Service가 서명을 생성하고, 상위 플랫폼이 실제 온체인 tx를 전송합니다. 수탁 입금은 온체인 전송으로 처리됩니다.",
        cards: [
          { label: "승인 상태", value: "완료", tone: "ok" },
          { label: "Sign ID", value: mockIds.signId, tone: "accent" },
          { label: "Tx 전송", value: "상위 플랫폼 담당" },
        ],
      },
    },
    {
      id: "CU2-S4",
      kind: "result",
      label: "입금 이력 확인",
      trigger: "auto",
      duration: 600,
      screenId: "CU2-4",
      description: "이 화면은 수탁 입금이 실행되었고 감사 추적이 가능하다는 점을 보여주는 종료 화면입니다.",
      processView: {
        kind: "audit",
        description: "입금 결과와 이력이 남아 있는 상태를 보여줍니다. 이후 감사나 운영 조회 시 Tx Hash와 Audit Event ID를 기준으로 추적합니다.",
        logs: [
          `[완료] 수탁 입금 등록 · req=${mockIds.requestId}`,
          `[완료] 1차 승인 · 이수민`,
          `[완료] 2차 승인 · 최종원`,
          `[완료] Wallet Service 서명 · sign=${mockIds.signId}`,
          `[완료] 온체인 tx 브로드캐스트 · tx=${mockHashes.txHash}`,
        ],
        summary: [
          { label: "Tx Hash", value: mockHashes.txHash, tone: "accent" },
          { label: "Audit Event ID", value: mockIds.auditEventId },
          { label: "상태", value: "입금 완료", tone: "ok" },
        ],
      },
    },
  ],
};
