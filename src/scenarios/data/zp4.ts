import type { Scenario, SequenceContext } from "@/scenarios/types";

const eventActors = ["거래소 앱", "거래소 원장", "zkPoL 서버"] as const;
const proofActors = ["거래소 원장", "zkPoL 서버", "관제 Dashboard"] as const;
const sidecarActors = ["zkPoL 서버", "관제 Dashboard", "운영 시스템 (Sidecar)"] as const;

const eventIngestSeq: SequenceContext = {
  actors: [...eventActors],
  activeEdge: { from: "거래소 원장", to: "zkPoL 서버", label: "ledger_change_event 2건 전달", tone: "warn" },
  pastEdges: [
    { from: "거래소 앱", to: "거래소 원장", label: "BTC 출금 요청 접수", tone: "accent" },
  ],
};

const proofBlockedSeq: SequenceContext = {
  actors: [...proofActors],
  activeEdge: { from: "zkPoL 서버", to: "관제 Dashboard", label: "proof blocked / duplicate candidate", tone: "bad" },
  pastEdges: [
    { from: "거래소 원장", to: "zkPoL 서버", label: "중복 원장 이벤트 유입", tone: "warn" },
    { from: "zkPoL 서버", to: "zkPoL 서버", label: "부채 증명 생성 실패", tone: "bad" },
  ],
};

const proofGenerateSeq: SequenceContext = {
  actors: [...proofActors],
  activeEdge: { from: "zkPoL 서버", to: "zkPoL 서버", label: "부채 증명 생성 중", tone: "accent" },
  pastEdges: [
    { from: "거래소 원장", to: "zkPoL 서버", label: "중복 원장 이벤트 유입", tone: "warn" },
  ],
};

const sidecarSeq: SequenceContext = {
  actors: [...sidecarActors],
  activeEdge: { from: "관제 Dashboard", to: "운영 시스템 (Sidecar)", label: "지급 차단 요청", tone: "bad" },
  pastEdges: [
    { from: "zkPoL 서버", to: "관제 Dashboard", label: "proof blocked", tone: "bad" },
  ],
};

const duplicateEventRows = [
  {
    event_id: "evt_8801",
    source_tx_id: "withdraw_20260511_001",
    account_id: "acc_017",
    token: "BTC",
    delta: "-0.5 BTC",
    occurred_at: "10:04:22",
    fingerprint: "fp_a91c",
    verdict: "original",
  },
  {
    event_id: "evt_8802",
    source_tx_id: "withdraw_20260511_001",
    account_id: "acc_017",
    token: "BTC",
    delta: "-0.5 BTC",
    occurred_at: "10:04:22",
    fingerprint: "fp_a91c",
    verdict: "duplicate candidate",
  },
];

const duplicateEventTable = {
  columns: [
    { key: "event_id", label: "event_id", width: "minmax(92px, 0.8fr)" },
    { key: "source_tx_id", label: "source_tx_id", width: "minmax(180px, 1.6fr)" },
    { key: "account_id", label: "account_id", width: "minmax(90px, 0.8fr)" },
    { key: "token", label: "token", width: "minmax(60px, 0.55fr)" },
    { key: "delta", label: "delta", width: "minmax(84px, 0.8fr)" },
    { key: "occurred_at", label: "occurred_at", width: "minmax(92px, 0.8fr)" },
    { key: "fingerprint", label: "fingerprint", width: "minmax(82px, 0.75fr)" },
    { key: "verdict", label: "판정", width: "minmax(150px, 1.2fr)" },
  ],
  rows: duplicateEventRows,
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
  summary: "같은 사용자의 BTC 원장 이벤트가 중복 유입되면 zkPoL이 부채 증명 생성 전에 후보를 감지하고, 증명 실패와 지급 차단 조치까지 이어지는 흐름입니다.",
  screens: [
    {
      id: "ZP4-1",
      layout: "result",
      actorType: "mobile",
      actor: "개인 사용자 / 거래소 앱",
      title: "BTC 출금 요청 접수",
      subtitle: "사용자에게는 정상 접수 상태로 표시됩니다",
      status: "접수 완료",
      sections: [
        {
          title: "출금 요청",
          fields: [
            { label: "요청 ID", value: "withdraw_20260511_001" },
            { label: "계정", value: "acc_017" },
            { label: "자산", value: "BTC" },
            { label: "수량", value: "0.5 BTC" },
            { label: "상태", value: "출금 요청 접수", tone: "ok" },
          ],
        },
      ],
      actions: [{ id: "confirm-withdrawal", label: "확인", tone: "accent" }],
    },
    {
      id: "ZP4-2",
      layout: "dashboard",
      webContext: { menuItem: "이상 이벤트", pageTitle: "이상징후 관제", host: "ops.zkpol.io" },
      actor: "리스크 운영자 / 관제 웹 대시보드",
      title: "이상 이벤트 후보 탐지",
      subtitle: "동일한 BTC 출금 이벤트가 두 번 유입된 후보를 확인합니다",
      status: "investigation_needed",
      sections: [
        {
          title: "후보 요약",
          fields: [
            { label: "감지 유형", value: "duplicate candidate", tone: "warn" },
            { label: "대상 토큰", value: "BTC" },
            { label: "영향 계정 수", value: "1" },
            { label: "예상 영향 금액", value: "0.5 BTC", tone: "warn" },
            { label: "상태", value: "investigation_needed", tone: "warn" },
            { label: "다음 단계", value: "증명 실패 여부 확인" },
          ],
        },
        {
          title: "중복 후보 이벤트",
          fields: [],
          table: duplicateEventTable,
        },
      ],
    },
    {
      id: "ZP4-3",
      layout: "processing",
      webContext: { menuItem: "증명 배치", pageTitle: "이상징후 관제", host: "ops.zkpol.io" },
      actor: "리스크 운영자 / 관제 웹 대시보드",
      title: "고객 부채 증명 생성",
      subtitle: "중복 후보 이벤트가 포함된 배치의 부채 증명을 생성하는 중입니다",
      status: "생성 중",
      sections: [
        {
          title: "증명 생성 진행",
          fields: [
            { label: "생성 상태", value: "증명 생성 중...", tone: "accent" },
          ],
        },
      ],
    },
    {
      id: "ZP4-4",
      layout: "dashboard",
      webContext: { menuItem: "증명 실패", pageTitle: "이상징후 관제", host: "ops.zkpol.io" },
      actor: "보안관제 / 관제 웹 대시보드",
      title: "Proof Blocked",
      subtitle: "동일 거래가 중복 입력되어 부채 증명 생성이 차단되었습니다",
      status: "proof blocked",
      sections: [
        {
          title: "증명 실패 비교",
          fields: [
            { label: "batch_id", value: "batch_20260511_1005_BTC" },
            { label: "old_sum", value: "12,500 BTC" },
            { label: "delta_sum", value: "-1.0 BTC", tone: "bad" },
            { label: "expected_new_sum", value: "12,499 BTC" },
            { label: "actual_new_sum", value: "12,499.5 BTC" },
            { label: "diff", value: "+0.5 BTC", tone: "bad" },
            { label: "root cause candidate", value: "duplicate withdrawal event", tone: "bad" },
          ],
        },
        {
          title: "중복 거래 내역",
          fields: [],
          table: duplicateEventTable,
        },
      ],
      actions: [{ id: "open-case", label: "Case 열기", tone: "bad" }],
    },
    {
      id: "ZP4-5",
      layout: "dashboard",
      webContext: { menuItem: "증명 실패", pageTitle: "이상징후 관제", host: "ops.zkpol.io" },
      actor: "보안관제 / 사고대응 담당자",
      title: "Case 원인 확인",
      subtitle: "Proof Blocked Case에서 중복 이벤트와 영향 범위를 확인합니다",
      status: "investigating",
      sections: [
        {
          title: "Case 상세",
          fields: [
            { label: "case_id", value: "case_001" },
            { label: "batch_id", value: "batch_20260511_1005_BTC" },
            { label: "candidate_events", value: "2" },
            { label: "source_tx_id", value: "withdraw_20260511_001" },
            { label: "affected_accounts", value: "1" },
            { label: "diff", value: "+0.5 BTC", tone: "bad" },
            { label: "담당자", value: "risk_ops_01" },
            { label: "상태", value: "investigating", tone: "warn" },
          ],
        },
        {
          title: "조치 방향",
          fields: [
            { label: "선택된 조치", value: "지급 차단", tone: "bad" },
            { label: "대상 요청", value: "withdraw_20260511_001" },
            { label: "추가 선택지", value: "이벤트 제외 / 추가 확인" },
            { label: "Last Error", value: "proof blocked / duplicate candidate", tone: "bad" },
          ],
        },
        {
          title: "Case 근거 이벤트",
          fields: [],
          table: duplicateEventTable,
        },
      ],
      actions: [{ id: "block-payout", label: "지급 차단", tone: "bad" }],
    },
    {
      id: "ZP4-6",
      layout: "dashboard",
      webContext: { menuItem: "지급 차단", pageTitle: "이상징후 관제", host: "ops.zkpol.io" },
      actor: "운영 시스템 / 감사자",
      title: "지급 차단 및 감사 로그",
      subtitle: "Sidecar 조치 반영 상태와 감사 가능한 이력을 확인합니다",
      status: "applied",
      sections: [
        {
          title: "Sidecar Action Status",
          fields: [
            { label: "case_id", value: "case_001" },
            { label: "action", value: "payout_blocked", tone: "bad" },
            { label: "target_request", value: "withdraw_20260511_001" },
            { label: "target_account", value: "acc_017" },
            { label: "sidecar_status", value: "applied", tone: "ok" },
            { label: "applied_at", value: "2026-05-11 10:05" },
            { label: "audit_log", value: "saved", tone: "ok" },
          ],
        },
        {
          title: "감사 추적 타임라인",
          fields: [],
          table: {
            wrap: true,
            columns: [
              { key: "time", label: "time", width: "96px" },
              { key: "event", label: "event", width: "150px" },
              { key: "detail", label: "detail", width: "minmax(0, 1fr)" },
            ],
            rows: [
              { time: "10:04:22", event: "duplicate candidate", detail: "evt_8801 / evt_8802가 같은 source_tx_id와 fingerprint를 공유" },
              { time: "10:05:00", event: "proof blocked", detail: "batch_20260511_1005_BTC에서 diff +0.5 BTC 발생" },
              { time: "10:05:18", event: "case opened", detail: "case_001을 열고 risk_ops_01에게 배정" },
              { time: "10:05:41", event: "payout blocked", detail: "sidecar가 withdraw_20260511_001 지급 차단을 적용" },
            ],
          },
        },
      ],
    },
  ],
  steps: [
    {
      id: "ZP4-step-1",
      kind: "user-action",
      label: "BTC 출금 요청",
      trigger: "user",
      ctaLabel: "확인",
      screenId: "ZP4-1",
      description: "사용자가 BTC 출금 요청을 확인합니다. 사용자 화면에서는 정상 접수로 보이지만 같은 원장 이벤트가 중복 유입될 준비 상태입니다.",
      processView: {
        kind: "overview",
        description: "사용자 앱에서는 단일 BTC 출금 요청만 보입니다. 이후 관제 화면에서는 같은 source_tx_id를 가진 이벤트가 두 번 들어왔는지 확인합니다.",
        cards: [
          { label: "요청 ID", value: "withdraw_20260511_001" },
          { label: "계정", value: "acc_017" },
          { label: "자산 변동", value: "-0.5 BTC" },
        ],
      },
    },
    {
      id: "ZP4-step-2",
      kind: "system-processing",
      label: "중복 후보 감지",
      trigger: "auto",
      duration: 2000,
      screenId: "ZP4-2",
      description: "거래소 원장에서 같은 source_tx_id와 fingerprint를 가진 BTC 이벤트 두 건이 zkPoL 서버로 유입됩니다.",
      processView: {
        kind: "sequence",
        actors: [...eventActors],
        activeEdge: eventIngestSeq.activeEdge,
        pastEdges: eventIngestSeq.pastEdges,
        description: "동일 사용자의 BTC 출금 이벤트가 두 번 들어오면 zkPoL은 증명 실패 확정 전에 duplicate candidate로 먼저 표시합니다.",
      },
    },
    {
      id: "ZP4-step-3",
      kind: "system-processing",
      label: "부채 증명 생성",
      trigger: "auto",
      duration: 4000,
      screenId: "ZP4-3",
      description: "중복 후보 이벤트가 포함된 배치를 바탕으로 고객 부채 증명을 생성합니다.",
      processView: {
        kind: "liability-proof",
        description: "상시 대사와 같은 방식으로 고객별 이전 커밋먼트에 거래 변동값을 반영해 새 커밋먼트를 만들고, 이 값들로 부채 증명 proof를 구성합니다.",
        formula: "sum(old_values) + delta = sum(new_values)",
        rows: [
          { user: "acc_017", oldValue: "cm_acc017_old", delta: "-0.5", newValue: "cm_acc017_new_a" },
          { user: "acc_017", oldValue: "cm_acc017_old", delta: "-0.5", newValue: "cm_acc017_new_b" },
          { user: "acc_024", oldValue: "cm_acc024_old", delta: "0", newValue: "cm_acc024_new" },
        ],
        footnote: "같은 source_tx_id의 BTC 출금 변동값이 두 번 들어와 delta가 중복 반영됩니다. 다음 단계에서 이 중복으로 인해 expected_new_sum과 actual_new_sum이 어긋납니다.",
        sequence: proofGenerateSeq,
      },
    },
    {
      id: "ZP4-step-4",
      kind: "user-action",
      label: "Proof Blocked",
      trigger: "user",
      ctaLabel: "Case 열기",
      screenId: "ZP4-4",
      description: "중복 이벤트 때문에 부채 합계가 맞지 않아 증명 생성이 차단됩니다. 담당자는 Case를 열어 원인을 확인합니다.",
      processView: {
        kind: "audit",
        description: "중복 출금 이벤트가 delta_sum에 두 번 반영되면서 expected_new_sum과 actual_new_sum이 어긋나고, proof blocked 상태로 전환됩니다.",
        logs: [
          "[batch] batch_20260511_1005_BTC 시작",
          "[event] evt_8801 withdraw_20260511_001 acc_017 BTC -0.5 BTC original",
          "[event] evt_8802 withdraw_20260511_001 acc_017 BTC -0.5 BTC duplicate candidate",
          "[circuit] expected_new_sum: 12,499 BTC",
          "[circuit] actual_new_sum: 12,499.5 BTC",
          "[alert] proof blocked — root cause candidate: duplicate withdrawal event",
        ],
        summary: [
          { label: "배치 ID", value: "batch_20260511_1005_BTC" },
          { label: "diff", value: "+0.5 BTC", tone: "bad" },
          { label: "상태", value: "proof blocked", tone: "bad" },
        ],
        sequence: proofBlockedSeq,
      },
    },
    {
      id: "ZP4-step-5",
      kind: "user-action",
      label: "Case 확인",
      trigger: "user",
      ctaLabel: "지급 차단",
      screenId: "ZP4-5",
      description: "담당자가 Case 상세에서 중복 이벤트 2건과 영향 범위를 확인하고 지급 차단 조치를 선택합니다.",
      processView: {
        kind: "approval",
        description: "Case는 proof blocked 결과와 중복 이벤트 근거를 하나로 묶습니다. 담당자는 이벤트 제외, 추가 확인, 지급 차단 중 운영 조치를 선택합니다.",
        approvers: [
          { name: "risk_ops_01", role: "사고대응 담당자", status: "pending", note: "중복 이벤트 근거 확인" },
          { name: "sidecar_ops", role: "운영 시스템", status: "waiting", note: "지급 차단 명령 대기" },
          { name: "audit_log", role: "감사 기록 시스템", status: "waiting", note: "조치 이력 저장 대기" },
        ],
      },
    },
    {
      id: "ZP4-step-6",
      kind: "result",
      label: "차단 조치 완료",
      trigger: "auto",
      duration: 2000,
      screenId: "ZP4-6",
      description: "운영 시스템이 지급 차단을 반영하고, Case 판단과 Sidecar 조치 이력이 감사 로그로 저장됩니다.",
      processView: {
        kind: "artifact",
        description: "zkPoL은 중복 이벤트와 증명 실패 근거를 제공하고, 실제 지급 차단은 Sidecar 또는 상위 운영 시스템에서 적용합니다.",
        items: [
          { label: "조치 유형", value: "payout_blocked", tone: "bad" },
          { label: "대상 요청", value: "withdraw_20260511_001" },
          { label: "대상 계정", value: "acc_017" },
          { label: "Sidecar 반영", value: "applied", tone: "ok" },
          { label: "감사 로그", value: "saved", tone: "ok" },
        ],
        sequence: sidecarSeq,
      },
    },
  ],
};
