import type { Scenario, SequenceContext } from "@/scenarios/types";

const seqActors = ["거래소 원장", "zkPoRL 서버", "Sidecar / 운영 시스템"] as const;

const anomalySeq: SequenceContext = {
  actors: [...seqActors],
  activeEdge: { from: "zkPoRL 서버", to: "Sidecar / 운영 시스템", label: "payout_blocked 명령", tone: "bad" },
  pastEdges: [
    { from: "거래소 원장", to: "zkPoRL 서버", label: "이상 이벤트 유입" },
    { from: "zkPoRL 서버", to: "zkPoRL 서버", label: "Proof 생성 실패 (blocked)", tone: "bad" },
  ],
};

export const scenarioZP4: Scenario = {
  id: "ZP-4",
  groupId: "risk",
  planningId: "ZP-4",
  name: "거래소 이상징후 차단",
  shortName: "이상징후 차단",
  actor: "보안관제 / 사고대응",
  actorType: "web",
  mode: "incident",
  summary: "이상 원장 이벤트가 유입되어 PoL Proof 생성이 실패(proof blocked)하면, 담당자가 케이스를 확인하고 지급 차단 조치를 실행하는 흐름입니다.",
  screens: [
    {
      id: "ZP4-1",
      layout: "result",
      actor: "개인 사용자 / 거래소 앱",
      title: "정상 출금 처리 완료",
      subtitle: "사용자에게는 정상 처리 결과로 표시됩니다",
      status: "처리 완료",
      sections: [
        {
          title: "출금 결과",
          fields: [
            { label: "요청 ID", value: "req_001" },
            { label: "자산", value: "BTC" },
            { label: "수량", value: "0.5 BTC" },
            { label: "상태", value: "출금 요청 접수", tone: "ok" },
          ],
        },
      ],
    },
    {
      id: "ZP4-2",
      layout: "dashboard",
      actor: "보안관제 / 관제 웹 대시보드",
      title: "이상 거래 후보 감지",
      subtitle: "누락·중복·잔고 불일치 후보가 탐지됩니다",
      status: "조사 필요",
      sections: [
        {
          title: "이상 후보 요약",
          fields: [
            { label: "자산", value: "BTC" },
            { label: "후보 유형", value: "중복 / 누락 / 잔고 불일치" },
            { label: "영향 계정 수", value: "2" },
            { label: "추정 차이", value: "-0.5 BTC", tone: "bad" },
            { label: "상태", value: "investigation_needed", tone: "warn" },
          ],
        },
      ],
    },
    {
      id: "ZP4-3",
      layout: "dashboard",
      actor: "보안관제 / 관제 웹 대시보드",
      title: "PoL 증명 실패 — Proof Blocked",
      subtitle: "합계 불일치로 Proof 생성이 차단됐습니다",
      status: "Proof Blocked",
      sections: [
        {
          title: "실패 정보",
          fields: [
            { label: "배치 ID", value: "batch_20260511_1005_BTC" },
            { label: "기대 new_sum", value: "12,510 BTC" },
            { label: "실제 new_sum", value: "12,509.5 BTC" },
            { label: "차이", value: "-0.5 BTC", tone: "bad" },
            { label: "last_error", value: "proof blocked", tone: "bad" },
          ],
        },
        {
          title: "원인 후보",
          fields: [
            { label: "중복 이벤트", value: "후보 2건" },
            { label: "누락 이벤트", value: "후보 1건" },
            { label: "잔고 불일치", value: "후보 2건" },
          ],
        },
      ],
    },
    {
      id: "ZP4-4",
      layout: "approval",
      actor: "보안관제 / 관제 웹 대시보드",
      title: "담당자 케이스 확인",
      subtitle: "이벤트 목록·중복·누락 탭을 검토하고 조치를 선택합니다",
      status: "조사 중",
      sections: [
        {
          title: "케이스 정보",
          fields: [
            { label: "케이스 ID", value: "case_001" },
            { label: "배치 ID", value: "batch_20260511_1005_BTC" },
            { label: "후보 이벤트", value: "3건" },
            { label: "영향 계정", value: "2개" },
            { label: "담당자", value: "risk_ops_01" },
            { label: "상태", value: "investigating", tone: "warn" },
          ],
        },
        {
          title: "조치 방향",
          fields: [
            { label: "Option 1", value: "지급 차단 (payout_blocked)" },
            { label: "Option 2", value: "추가 확인 (hold)" },
            { label: "Option 3", value: "정상 처리 (clear)" },
          ],
        },
      ],
      actions: [
        { id: "block", label: "지급 차단", tone: "bad" },
        { id: "hold", label: "추가 확인", tone: "warn" },
      ],
    },
    {
      id: "ZP4-5",
      layout: "result",
      actor: "거래소 Sidecar / 감사자",
      title: "지급 차단 조치 완료",
      subtitle: "Sidecar가 조치를 반영하고 감사 이력이 기록됩니다",
      status: "차단 완료",
      sections: [
        {
          title: "조치 결과",
          fields: [
            { label: "케이스 ID", value: "case_001" },
            { label: "조치 유형", value: "payout_blocked", tone: "bad" },
            { label: "차단 대상 요청", value: "req_001" },
            { label: "차단 대상 계정", value: "acc_001" },
            { label: "Sidecar 상태", value: "applied", tone: "ok" },
            { label: "적용 시각", value: "2026-05-11 10:05" },
          ],
        },
        {
          title: "감사 이력",
          fields: [
            { label: "감사 케이스 ID", value: "audit_case_001" },
            { label: "Audit Log 저장", value: "완료", tone: "ok" },
            { label: "감사 상태", value: "reviewable", tone: "ok" },
          ],
        },
      ],
    },
  ],
  steps: [
    {
      id: "ZP4-step-1",
      kind: "user-action",
      label: "정상 처리 화면",
      trigger: "user",
      ctaLabel: "다음 단계",
      screenId: "ZP4-1",
      description: "사용자에게는 정상 출금 접수로 표시됩니다. 내부적으로는 이상 이벤트가 유입됩니다",
      processView: {
        kind: "overview",
        description: "사용자 화면에는 정상 출금 접수로 표시됩니다. 이상 이벤트는 내부적으로 유입되지만 사용자에게는 노출되지 않습니다.",
        cards: [
          { label: "사용자 표시 상태", value: "출금 요청 접수", tone: "ok" },
          { label: "내부 상태", value: "이상 이벤트 유입 중", tone: "warn" },
        ],
      },
    },
    {
      id: "ZP4-step-2",
      kind: "system-processing",
      label: "이상 후보 감지",
      trigger: "auto",
      duration: 2000,
      screenId: "ZP4-2",
      description: "운영자 대시보드에 중복·누락·잔고 불일치 후보 요약이 표시됩니다",
      processView: {
        kind: "sequence",
        actors: [...seqActors],
        activeEdge: { from: "거래소 원장", to: "zkPoRL 서버", label: "이상 이벤트 유입", tone: "bad" },
        description: "원장에서 이상 이벤트(중복·누락·잔고 불일치)가 유입됩니다. 운영자 대시보드에 후보 요약이 표시됩니다.",
      },
    },
    {
      id: "ZP4-step-3",
      kind: "system-processing",
      label: "Proof 생성 실패",
      trigger: "auto",
      duration: 2500,
      screenId: "ZP4-3",
      description: "합계 불일치로 BatchCircuit Proof 생성이 실패(proof blocked)합니다",
      processView: {
        kind: "audit",
        description: "sum(old) + delta ≠ sum(new) 불일치로 Proof 생성이 차단됩니다. 알림이 생성되고 케이스가 등록됩니다.",
        logs: [
          "[batch] batch_20260511_1005_BTC 시작",
          "[circuit] old_sum: 12,500 BTC 로드",
          "[circuit] delta 집계: +10 BTC",
          "[circuit] expected_new_sum: 12,510 BTC",
          "[circuit] actual_new_sum: 12,509.5 BTC",
          "[circuit] diff: -0.5 BTC → 정합성 실패",
          "[alert] proof blocked — 케이스 등록: case_001",
        ],
        summary: [
          { label: "배치 ID", value: "batch_20260511_1005_BTC" },
          { label: "차이", value: "-0.5 BTC", tone: "bad" },
          { label: "상태", value: "proof blocked", tone: "bad" },
        ],
      },
    },
    {
      id: "ZP4-step-4",
      kind: "user-action",
      label: "케이스 확인 및 차단 선택",
      trigger: "user",
      ctaLabel: "지급 차단",
      screenId: "ZP4-4",
      description: "담당자가 케이스를 확인하고 지급 차단 조치를 선택합니다",
      processView: {
        kind: "approval",
        description: "담당자가 중복·누락·잔고 불일치 후보 탭을 검토합니다. 지급 차단 / 추가 확인 / 정상 처리 중 방향을 선택합니다.",
        approvers: [
          { name: "risk_ops_01", role: "보안관제 담당자", status: "approved", note: "케이스 확인 완료 → 지급 차단 선택" },
          { name: "audit_log", role: "감사 기록 시스템", status: "pending", note: "조치 후 자동 기록" },
        ],
      },
    },
    {
      id: "ZP4-step-5",
      kind: "result",
      label: "차단 조치 완료",
      trigger: "auto",
      duration: 2000,
      screenId: "ZP4-5",
      description: "Sidecar가 지급 차단을 반영하고 감사 이력이 기록됩니다",
      processView: {
        kind: "artifact",
        description: "PoL 결과가 실제 운영 통제 조치로 이어집니다. Sidecar가 payout_blocked를 적용하고 감사 이력이 남습니다.",
        items: [
          { label: "조치 유형", value: "payout_blocked", tone: "bad" },
          { label: "Sidecar 상태", value: "applied", tone: "ok" },
          { label: "차단 계정", value: "acc_001" },
          { label: "감사 케이스", value: "audit_case_001", tone: "ok" },
          { label: "Audit Log", value: "저장 완료", tone: "ok" },
        ],
        sequence: anomalySeq,
      },
    },
  ],
};
