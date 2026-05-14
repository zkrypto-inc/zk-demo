import type { Scenario, SequenceContext } from "@/scenarios/types";

const setupActors = ["서비스 운영자", "zkPasskey Admin", "온체인 검증 컨트랙트"] as const;
const userActors = ["개인 사용자", "Web2 Provider", "zkPasskey 앱"] as const;
const recoveryActors = ["새 기기", "zkPasskey 앱", "온체인 검증 컨트랙트"] as const;

const setupSeq: SequenceContext = {
  actors: [...setupActors],
  activeEdge: { from: "서비스 운영자", to: "zkPasskey Admin", label: "복구 정책 저장", tone: "accent" },
};

const providerSeq: SequenceContext = {
  actors: [...userActors],
  activeEdge: { from: "Web2 Provider", to: "zkPasskey 앱", label: "신원 확인 결과 반환", tone: "accent" },
  pastEdges: [
    { from: "개인 사용자", to: "Web2 Provider", label: "Google / Apple 로그인", tone: "accent" },
  ],
};

const anchorSeq: SequenceContext = {
  actors: [...userActors],
  activeEdge: { from: "zkPasskey 앱", to: "zkPasskey 앱", label: "Anchor 생성", tone: "ok" },
  pastEdges: [
    { from: "Web2 Provider", to: "zkPasskey 앱", label: "3개 신원 확인", tone: "accent" },
  ],
};

const proofSeq: SequenceContext = {
  actors: [...recoveryActors],
  activeEdge: { from: "zkPasskey 앱", to: "zkPasskey 앱", label: "k개 신원 증명 생성", tone: "accent" },
  pastEdges: [
    { from: "새 기기", to: "zkPasskey 앱", label: "새 공개키 생성", tone: "accent" },
  ],
};

const verifySeq: SequenceContext = {
  actors: [...recoveryActors],
  activeEdge: { from: "zkPasskey 앱", to: "온체인 검증 컨트랙트", label: "proof 제출 / 공개키 갱신", tone: "ok" },
  pastEdges: [
    { from: "새 기기", to: "zkPasskey 앱", label: "새 공개키 생성", tone: "accent" },
    { from: "zkPasskey 앱", to: "zkPasskey 앱", label: "k개 신원 증명 생성", tone: "accent" },
  ],
};

export const scenarioZK1: Scenario = {
  id: "ZK-1",
  groupId: "passkey-recovery",
  planningId: "ZK-1~3",
  displayId: "ZK-1~3",
  surface: "mixed",
  name: "Web2 신원 기반 계정 복구",
  shortName: "Web2 신원 계정 복구",
  actor: "서비스 운영자 / 개인 사용자",
  actorType: "web",
  mode: "personal",
  summary: "운영자가 복구 정책을 설정하고, 사용자가 Web2 신원을 Anchor로 등록한 뒤 새 기기에서 ZK Proof로 계정 공개키를 갱신하는 흐름입니다.",
  screens: [
    {
      id: "ZK1-1",
      layout: "dashboard",
      actorType: "web",
      webContext: { menuItem: "설정", pageTitle: "계정 복구 정책", host: "admin.zkpasskey.io" },
      actor: "서비스 운영자 / 웹 관리자 콘솔",
      title: "복구 정책 및 신원 제공자 설정",
      subtitle: "계정 복구에 사용할 제공자와 k-of-n 기준을 설정합니다",
      status: "설정 완료",
      sections: [
        {
          title: "복구 정책",
          fields: [
            { label: "복구 조건", value: "3-of-6", tone: "accent" },
            { label: "허용 신원 수", value: "6개" },
            { label: "필요 확인 수", value: "3개 이상" },
            { label: "정책 상태", value: "활성", tone: "ok" },
          ],
        },
        {
          title: "허용 OP 목록",
          fields: [
            { label: "Google", value: "허용", tone: "ok" },
            { label: "Apple", value: "허용", tone: "ok" },
            { label: "Kakao", value: "허용", tone: "ok" },
            { label: "Naver", value: "허용", tone: "ok" },
            { label: "Microsoft", value: "허용", tone: "ok" },
            { label: "GitHub", value: "허용", tone: "ok" },
          ],
        },
        {
          title: "검증 정보",
          fields: [
            { label: "검증키 등록", value: "완료", tone: "ok" },
            { label: "OP root", value: "등록 완료", tone: "ok" },
            { label: "운영 상세", value: "CRS / pk / vk 접힘" },
          ],
        },
      ],
    },
    {
      id: "ZK1-2",
      layout: "form",
      actorType: "mobile",
      actor: "개인 사용자 / zkPasskey 앱",
      title: "Web2 신원 연결",
      subtitle: "복구에 사용할 기존 로그인 계정을 연결합니다",
      status: "연결 중",
      sections: [
        {
          title: "연결된 복구 수단",
          fields: [
            { label: "Google", value: "연결 완료", tone: "ok" },
            { label: "Apple", value: "연결 완료", tone: "ok" },
            { label: "GitHub", value: "연결 완료", tone: "ok" },
            { label: "등록된 복구 수단", value: "3개", tone: "accent" },
          ],
        },
        {
          title: "개인정보 보호",
          fields: [
            { label: "JWT 원문", value: "사용자 화면에 표시하지 않음" },
            { label: "내부 검증", value: "issuer / audience / subject 확인 완료", tone: "ok" },
          ],
        },
      ],
      footer: "로그인 계정의 원문 토큰 값은 화면에 노출되지 않습니다.",
      actions: [{ id: "connect-identities", label: "연결 완료", tone: "accent" }],
    },
    {
      id: "ZK1-3",
      layout: "result",
      actorType: "mobile",
      actor: "개인 사용자 / zkPasskey 앱",
      title: "계정 보호 설정 완료",
      subtitle: "연결된 신원이 하나의 Anchor로 등록되었습니다",
      status: "계정 보호 활성",
      sections: [
        {
          title: "Anchor 등록 결과",
          fields: [
            { label: "Anchor 생성", value: "완료", tone: "ok" },
            { label: "초기 공개키", value: "pk_user_8f21 등록", tone: "ok" },
            { label: "복구 기준", value: "3-of-6" },
            { label: "개별 로그인 정보", value: "비공개" },
          ],
        },
      ],
      footer: "Google, Apple 같은 개별 신원은 블록체인 주소와 직접 연결되어 보이지 않습니다.",
      actions: [{ id: "start-recovery", label: "복구 요청 시작", tone: "accent" }],
    },
    {
      id: "ZK1-4",
      layout: "form",
      actorType: "mobile",
      actor: "개인 사용자 / 새 기기",
      title: "계정 복구 요청",
      subtitle: "새 기기에서 사용할 보안 키를 만들고 복구를 시작합니다",
      status: "복구 준비",
      sections: [
        {
          title: "새 기기 등록",
          fields: [
            { label: "복구 사유", value: "기기 분실 / 키 교체" },
            { label: "새 보안 키", value: "생성 완료", tone: "ok" },
            { label: "새 공개키", value: "pk_user_new_42b9", tone: "accent" },
            { label: "본인 확인", value: "연결된 로그인으로 진행" },
          ],
        },
      ],
      footer: "복구가 완료되면 새 공개키가 기존 계정의 제어키로 등록됩니다.",
      actions: [{ id: "generate-proof", label: "본인 확인 진행", tone: "accent" }],
    },
    {
      id: "ZK1-5",
      layout: "processing",
      actorType: "mobile",
      actor: "시스템 자동 처리 / 개인 사용자",
      title: "복구 증명 생성",
      subtitle: "개별 로그인 정보를 공개하지 않고 복구 조건 충족을 증명합니다",
      status: "증명 생성 중",
      animateProcessing: true,
      sections: [
        {
          title: "k-of-n 확인",
          fields: [
            { label: "필요한 신원 확인 수", value: "3개" },
            { label: "확인 완료", value: "3개", tone: "ok" },
            { label: "k-of-n 충족", value: "3-of-6", tone: "ok" },
            { label: "Anchor 매칭", value: "완료", tone: "ok" },
            { label: "복구 증명", value: "생성 중...", tone: "accent" },
          ],
        },
      ],
    },
    {
      id: "ZK1-6",
      layout: "result",
      actorType: "mobile",
      actor: "개인 사용자 / 온체인 검증 계층",
      title: "계정 복구 완료",
      subtitle: "온체인 검증이 완료되어 새 공개키가 활성화되었습니다",
      status: "복구 완료",
      sections: [
        {
          title: "검증 결과",
          fields: [
            { label: "온체인 검증", value: "완료", tone: "ok" },
            { label: "새 공개키", value: "pk_user_new_42b9 활성화", tone: "ok" },
            { label: "계정 사용", value: "새 기기에서 가능", tone: "ok" },
            { label: "기존 로그인 정보", value: "비공개 유지" },
          ],
        },
      ],
      footer: "실패 시에는 허용되지 않은 제공자, 만료된 인증, 재사용 공격 등 쉬운 이유로 안내합니다.",
      actions: [{ id: "use-account", label: "계정 사용하기", tone: "accent" }],
    },
  ],
  steps: [
    {
      id: "ZK1-step-1",
      kind: "user-action",
      label: "복구 정책 설정",
      trigger: "user",
      ctaLabel: "다음 단계",
      screenId: "ZK1-1",
      description: "서비스 운영자가 계정 복구에 사용할 신원 제공자와 3-of-6 복구 정책을 설정합니다.",
      processView: {
        kind: "overview",
        description: "운영자는 6개 허용 신원 중 3개 이상 확인되면 복구를 허용하도록 정책을 설정합니다. CRS, pk/vk, OP root 같은 운영 상세는 검증 정보로 요약합니다.",
        cards: [
          { label: "복구 조건", value: "3-of-6", tone: "accent" },
          { label: "허용 OP", value: "Google / Apple / Kakao / Naver / Microsoft / GitHub" },
          { label: "검증키", value: "등록 완료", tone: "ok" },
        ],
        sequence: setupSeq,
      },
    },
    {
      id: "ZK1-step-2",
      kind: "user-action",
      label: "Web2 신원 연결",
      trigger: "user",
      ctaLabel: "연결 완료",
      screenId: "ZK1-2",
      description: "사용자가 Google, Apple, GitHub 계정을 복구 수단으로 연결합니다.",
      processView: {
        kind: "overview",
        description: "앱은 각 Web2 제공자에서 유효한 로그인 결과를 확인하고 복구용 인증 정보를 준비합니다. JWT 원문과 aud, iss, sub 같은 내부 값은 사용자 화면에 노출하지 않습니다.",
        cards: [
          { label: "Google", value: "연결 완료", tone: "ok" },
          { label: "Apple", value: "연결 완료", tone: "ok" },
          { label: "GitHub", value: "연결 완료", tone: "ok" },
        ],
        sequence: providerSeq,
      },
    },
    {
      id: "ZK1-step-3",
      kind: "user-action",
      label: "Anchor 등록",
      trigger: "user",
      ctaLabel: "복구 요청 시작",
      screenId: "ZK1-3",
      description: "연결된 여러 Web2 신원을 하나의 Anchor로 압축하고 초기 공개키와 함께 등록합니다.",
      processView: {
        kind: "artifact",
        description: "Anchor는 나중에 복구 자격을 확인할 기준값입니다. 개별 Google, Apple, GitHub 계정이 온체인 주소와 직접 연결되어 보이지 않도록 등록합니다.",
        items: [
          { label: "Anchor", value: "anchor_7c2f...a91d", tone: "ok" },
          { label: "초기 공개키", value: "pk_user_8f21", tone: "ok" },
          { label: "계정 보호", value: "활성", tone: "ok" },
        ],
        sequence: anchorSeq,
      },
    },
    {
      id: "ZK1-step-4",
      kind: "user-action",
      label: "복구 요청",
      trigger: "user",
      ctaLabel: "본인 확인 진행",
      screenId: "ZK1-4",
      description: "사용자가 새 기기에서 새 보안 키를 만들고 계정 복구를 요청합니다.",
      processView: {
        kind: "overview",
        description: "기기 분실이나 키 교체 상황에서 새 공개키를 만들고, 기존 계정의 제어권을 새 키로 갱신하기 위한 본인 확인 단계로 넘어갑니다.",
        cards: [
          { label: "새 기기", value: "등록 준비", tone: "accent" },
          { label: "새 공개키", value: "pk_user_new_42b9" },
          { label: "복구 상태", value: "본인 확인 대기" },
        ],
      },
    },
    {
      id: "ZK1-step-5",
      kind: "system-processing",
      label: "k개 신원 증명 생성",
      trigger: "auto",
      duration: 3500,
      screenId: "ZK1-5",
      description: "필요한 신원 3개가 확인되었음을 ZK Proof로 생성합니다.",
      processView: {
        kind: "step-list",
        description: "개별 계정 정보를 공개하지 않고 복구 조건을 만족했다는 사실만 증명합니다. 회로는 k개 신원 조건 충족에 필요한 값을 만들고, 최종 검증은 온체인에서 수행됩니다.",
        title: "복구 증명 생성 단계",
        progress: 100,
        progressLabel: "증명 생성 진행 중",
        steps: [
          { label: "JWT 유효성 확인", value: "허용 OP / 만료 시간 / 대상 서비스 확인", state: "done" },
          { label: "Anchor 매칭", value: "등록된 Anchor와 연결된 신원 집합 확인", state: "done" },
          { label: "k-of-n 충족", value: "3-of-6 조건 만족", state: "done" },
          { label: "복구 Proof 생성", value: "개별 신원 비공개 상태로 proof 생성", state: "active" },
        ],
        sequence: proofSeq,
      },
    },
    {
      id: "ZK1-step-6",
      kind: "result",
      label: "공개키 갱신 완료",
      trigger: "auto",
      duration: 2000,
      screenId: "ZK1-6",
      description: "온체인 검증을 통과해 계정 공개키가 새 키로 갱신됩니다.",
      processView: {
        kind: "artifact",
        description: "생성된 복구 증명을 온체인에서 검증하고, 성공하면 기존 계정 공개키를 새 공개키로 갱신합니다. 실패 케이스는 Invalid Aud, Expired Token, Replay Attack, Index Attack 등으로 분리해 안내할 수 있습니다.",
        items: [
          { label: "검증 상태", value: "완료", tone: "ok" },
          { label: "이전 공개키", value: "pk_user_8f21" },
          { label: "새 공개키", value: "pk_user_new_42b9", tone: "ok" },
          { label: "계정 상태", value: "새 기기에서 사용 가능", tone: "ok" },
        ],
        sequence: verifySeq,
      },
    },
  ],
};
