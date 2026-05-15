import type { Scenario, SequenceContext } from "@/scenarios/types";

const policySeq: SequenceContext = {
  actors: ["개인 사용자", "ZKPasskey 앱"],
  activeEdge: { from: "개인 사용자", to: "ZKPasskey 앱", label: "생성/복구 정책 설정", tone: "accent" },
};

const providerLoginSeq: SequenceContext = {
  actors: ["ZKPasskey 앱", "카카오 app", "Google app"],
  activeEdge: { from: "ZKPasskey 앱", to: "카카오 app", label: "로그인 요청", tone: "accent" },
  extraActiveEdges: [
    { from: "ZKPasskey 앱", to: "Google app", label: "로그인 요청", tone: "accent" },
  ],
};

const providerVerifySeq: SequenceContext = {
  actors: ["ZKPasskey 앱", "카카오 app", "Google app"],
  activeEdge: { from: "ZKPasskey 앱", to: "카카오 app", label: "신원 확인 요청", tone: "accent" },
  extraActiveEdges: [
    { from: "ZKPasskey 앱", to: "Google app", label: "신원 확인 요청", tone: "accent" },
  ],
};

const creationProofSeq: SequenceContext = {
  actors: ["ZKPasskey 앱", "Proof Engine"],
  activeEdge: { from: "ZKPasskey 앱", to: "Proof Engine", label: "영지식 증명 생성", tone: "accent" },
};

const recoveryProofSeq: SequenceContext = {
  actors: ["ZKPasskey 앱", "Proof Engine"],
  activeEdge: { from: "ZKPasskey 앱", to: "Proof Engine", label: "영지식 증명 생성", tone: "accent" },
};

const anchorSeq: SequenceContext = {
  actors: ["ZKPasskey 앱", "블록체인"],
  activeEdge: { from: "ZKPasskey 앱", to: "블록체인", label: "앵커 등록 완료", tone: "ok" },
};

const recoveryRequestSeq: SequenceContext = {
  actors: ["개인 사용자", "ZKPasskey 앱"],
  activeEdge: { from: "개인 사용자", to: "ZKPasskey 앱", label: "복구 요청", tone: "accent" },
};

const recoveryRegisterSeq: SequenceContext = {
  actors: ["ZKPasskey 앱", "블록체인"],
  activeEdge: { from: "ZKPasskey 앱", to: "블록체인", label: "영지식 증명 검증 및 계정 등록", tone: "ok" },
};

export const scenarioZK1: Scenario = {
  id: "ZK-1",
  groupId: "passkey-user",
  displayId: "ZK-1",
  surface: "app",
  name: "ZKPasskey 계정 생성",
  shortName: "지갑 개설",
  actor: "개인 사용자",
  actorType: "mobile",
  mode: "personal",
  summary: "개인 사용자가 앱에서 복구 기준 t/n을 정하고 Web2 신원을 연결한 뒤 ZK 증명으로 지갑 계정을 활성화합니다.",
  screens: [
    {
      id: "ZK1-1",
      layout: "form",
      actorType: "mobile",
      actor: "개인 사용자 / ZKPasskey 앱",
      title: "생성/복구 정책 설정",
      subtitle: "지갑 생성과 복구에 공통으로 사용할 기준을 정합니다.",
      status: "정책 설정",
      sections: [
        {
          title: "복구 기준",
          fields: [
            { label: "최소 필요 수 t", value: "2", tone: "accent" },
            { label: "전체 신원 수 n", value: "3", tone: "accent" },
          ],
        },
      ],
      actions: [{ id: "set-policy", label: "다음", tone: "accent" }],
    },
    {
      id: "ZK1-2",
      layout: "form",
      actorType: "mobile",
      actor: "개인 사용자 / ZKPasskey 앱",
      title: "Web2 신원 연결",
      subtitle: "필요한 수만큼 Web2 계정을 연결합니다.",
      status: "연결 중",
      progressBoxes: { total: 3, completed: 2, cycle: [1, 2], label: "연결 진행 상황" },
      sections: [
        {
          title: "로그인 요청",
          variant: "cards",
          fields: [
            { label: "카카오 app", value: "확인되었습니다", tone: "ok" },
            { label: "Google app", value: "확인되었습니다", tone: "ok" },
            { label: "Apple app", value: "대기" },
          ],
        },
        {
          title: "연결 상태",
          fields: [
            { label: "필요 연결 수 t", value: "2" },
            { label: "전체 신원 수 n", value: "3" },
            { label: "연결 완료 수", value: "2 / 3", tone: "accent" },
          ],
        },
      ],
      footer: "t개 충족까지 Web2 로그인 확인을 반복합니다.",
      actions: [{ id: "connect-web2", label: "연결 완료", tone: "accent" }],
    },
    {
      id: "ZK1-3",
      layout: "processing",
      actorType: "mobile",
      actor: "개인 사용자 / ZKPasskey 앱",
      title: "증명 생성",
      subtitle: "연결된 신원으로 계정 생성 조건을 증명합니다.",
      status: "증명 생성 중",
      sections: [
        {
          title: "증명 생성 상태",
          fields: [
            { label: "완료된 신원 수", value: "2 / 3", tone: "ok" },
            { label: "생성 조건", value: "충족", tone: "ok" },
            { label: "계정 생성 Proof", value: "생성 중...", tone: "accent" },
          ],
        },
      ],
    },
    {
      id: "ZK1-4",
      layout: "result",
      actorType: "mobile",
      actor: "개인 사용자 / ZKPasskey 앱",
      title: "계정 생성 완료",
      subtitle: "계정이 활성화 되었습니다.",
      status: "계정 활성화 완료",
      sections: [
        {
          title: "계정 정보",
          fields: [
            { label: "Public key", value: "0xpk8f21...a90c", tone: "ok" },
            { label: "지갑 주소", value: "0x91b3...42f8", tone: "ok" },
            { label: "복구 기준", value: "2 / 3" },
          ],
        },
      ],
      actions: [{ id: "use-wallet", label: "지갑 사용하기", tone: "accent" }],
    },
  ],
  steps: [
    {
      id: "ZK1-step-1",
      kind: "user-action",
      label: "생성/복구 정책 설정",
      trigger: "user",
      ctaLabel: "다음",
      screenId: "ZK1-1",
      description: "사용자가 앱에서 계정 생성과 복구에 공통으로 적용할 t/n 기준을 설정합니다.",
      processView: {
        kind: "overview",
        description: "관리자 콘솔 없이 개인 사용자 앱 안에서 최소 필요 수 t와 전체 신원 수 n만 설정합니다.",
        cards: [
          { label: "최소 필요 수 t", value: "2", tone: "accent" },
          { label: "전체 신원 수 n", value: "3", tone: "accent" },
        ],
        sequence: policySeq,
      },
    },
    {
      id: "ZK1-step-2",
      kind: "user-action",
      label: "Web2 신원 연결",
      trigger: "user",
      ctaLabel: "연결 완료",
      screenId: "ZK1-2",
      description: "ZKPasskey 앱이 카카오와 Google 앱에 로그인 요청을 보내고, n개 후보 중 t개 연결 완료 상태를 확인합니다.",
      processView: {
        kind: "overview",
        description: "카카오 app, Google app 로그인 요청이 완료되면 앱 상단 진행 네모칸이 순서대로 채워집니다. 사용자는 확인 완료 상태만 봅니다.",
        cards: [
          { label: "카카오 app", value: "확인되었습니다", tone: "ok" },
          { label: "Google app", value: "확인되었습니다", tone: "ok" },
          { label: "Apple app", value: "대기" },
          { label: "연결 완료 수", value: "2 / 3", tone: "accent" },
        ],
        sequence: providerLoginSeq,
      },
    },
    {
      id: "ZK1-step-3",
      kind: "system-processing",
      label: "증명 생성",
      trigger: "auto",
      duration: 3000,
      screenId: "ZK1-3",
      description: "연결된 t개의 Web2 신원을 바탕으로 계정 생성용 영지식 증명을 생성합니다.",
      processView: {
        kind: "step-list",
        description: "t개 신원 확인 반복을 마친 뒤 Proof Engine으로 계정 생성용 증명을 생성합니다. 사용자 화면에는 증명 원문, JWT claim, witness 값을 노출하지 않고 진행 상태만 보여줍니다.",
        title: "계정 생성 증명",
        progress: 100,
        progressLabel: "Proof 생성 중",
        steps: [
          { label: "Web2 신원 확인", value: "카카오 / Google 확인 완료", state: "done" },
          { label: "생성 조건 충족", value: "t=2 조건 만족", state: "done" },
          { label: "ZK Proof 생성", value: "Proof Engine 실행", state: "active" },
        ],
        sequence: creationProofSeq,
      },
    },
    {
      id: "ZK1-step-4",
      kind: "result",
      label: "계정 생성 완료",
      trigger: "auto",
      duration: 1800,
      screenId: "ZK1-4",
      description: "생성된 증명이 반영되고 지갑 주소가 최종 표시됩니다.",
      processView: {
        kind: "artifact",
        description: "ZKPasskey 앱이 블록체인에 앵커 등록을 완료하고, 계정 추상화 지갑이 활성화됩니다.",
        items: [
          { label: "Public key", value: "0xpk8f21...a90c", tone: "ok" },
          { label: "지갑 주소", value: "0x91b3...42f8", tone: "ok" },
          { label: "복구 기준", value: "2 / 3", tone: "accent" },
        ],
        diagram: "account-abstraction",
        sequence: anchorSeq,
      },
    },
  ],
};

export const scenarioZK2: Scenario = {
  id: "ZK-2",
  groupId: "passkey-user",
  displayId: "ZK-2",
  surface: "app",
  name: "ZKPasskey 계정 복구",
  shortName: "지갑 복구",
  actor: "개인 사용자",
  actorType: "mobile",
  mode: "personal",
  summary: "개인 사용자가 등록해둔 Web2 계정을 선택하고 재인증한 뒤 ZK 증명으로 지갑 계정을 복구합니다.",
  screens: [
    {
      id: "ZK2-1",
      layout: "form",
      actorType: "mobile",
      actor: "개인 사용자 / ZKPasskey 앱",
      title: "복구 요청",
      subtitle: "복구에 사용할 Web2 계정을 선택합니다.",
      status: "복구 요청",
      sections: [
        {
          title: "선택한 Web2 계정",
          variant: "cards",
          fields: [
            { label: "카카오 app", value: "선택됨", tone: "accent" },
            { label: "Google app", value: "선택됨", tone: "accent" },
            { label: "Apple app", value: "대기" },
          ],
        },
        {
          title: "복구 기준",
          fields: [
            { label: "필요 선택 수 t", value: "2" },
            { label: "선택한 계정", value: "2 / 3", tone: "accent" },
          ],
        },
      ],
      actions: [{ id: "start-recovery", label: "복구 시작", tone: "accent" }],
    },
    {
      id: "ZK2-2",
      layout: "form",
      actorType: "mobile",
      actor: "개인 사용자 / ZKPasskey 앱",
      title: "신원 증명 생성",
      subtitle: "선택한 Web2 계정에 다시 로그인합니다.",
      status: "재인증 중",
      progressBoxes: { total: 3, completed: 2, cycle: [1, 2], label: "신원 확인 진행 상황" },
      sections: [
        {
          title: "재인증 상태",
          variant: "cards",
          fields: [
            { label: "카카오 app", value: "확인되었습니다", tone: "ok" },
            { label: "Google app", value: "확인되었습니다", tone: "ok" },
            { label: "Apple app", value: "대기" },
          ],
        },
        {
          title: "확인 완료",
          fields: [
            { label: "필요 확인 수 t", value: "2" },
            { label: "전체 신원 수 n", value: "3" },
            { label: "확인 완료 수", value: "2 / 3", tone: "accent" },
          ],
        },
      ],
      footer: "t개 충족까지 선택한 Web2 계정 재인증을 반복합니다.",
      actions: [{ id: "verify-web2", label: "신원 확인 완료", tone: "accent" }],
    },
    {
      id: "ZK2-3",
      layout: "processing",
      actorType: "mobile",
      actor: "개인 사용자 / ZKPasskey 앱",
      title: "증명 생성",
      subtitle: "복구용 영지식 증명을 생성합니다.",
      status: "증명 생성 중",
      sections: [
        {
          title: "복구 증명 생성",
          fields: [
            { label: "완료된 신원 수", value: "2 / 3", tone: "ok" },
            { label: "새 Public key", value: "생성 완료", tone: "ok" },
            { label: "바뀔 지갑 주소", value: "0x73fa...e920", tone: "accent" },
            { label: "복구 Proof", value: "생성 중...", tone: "accent" },
          ],
        },
      ],
    },
    {
      id: "ZK2-4",
      layout: "result",
      actorType: "mobile",
      actor: "개인 사용자 / ZKPasskey 앱",
      title: "증명 생성 완료",
      subtitle: "증명 검증이 끝나 복구가 완료되었습니다.",
      status: "복구 완료",
      sections: [
        {
          title: "복구 계정 정보",
          fields: [
            { label: "Public key", value: "0xpk42b9...77d1", tone: "ok" },
            { label: "지갑 주소", value: "0x73fa...e920", tone: "ok" },
            { label: "복구 기준", value: "2 / 3" },
          ],
        },
      ],
      actions: [{ id: "use-recovered-wallet", label: "복구된 지갑 사용", tone: "accent" }],
    },
  ],
  steps: [
    {
      id: "ZK2-step-1",
      kind: "user-action",
      label: "복구 요청",
      trigger: "user",
      ctaLabel: "복구 시작",
      screenId: "ZK2-1",
      description: "사용자가 복구를 시작하고 등록된 Web2 계정 중 복구에 사용할 계정을 선택합니다.",
      processView: {
        kind: "overview",
        description: "복구 요청 화면은 카드 형태로 등록된 Web2 계정을 보여주고, 사용자가 복구에 사용할 계정을 선택하도록 구성합니다.",
        cards: [
          { label: "카카오 app", value: "선택됨", tone: "accent" },
          { label: "Google app", value: "선택됨", tone: "accent" },
          { label: "선택 상태", value: "2 / 3", tone: "ok" },
        ],
        sequence: recoveryRequestSeq,
      },
    },
    {
      id: "ZK2-step-2",
      kind: "user-action",
      label: "신원 증명 생성",
      trigger: "user",
      ctaLabel: "신원 확인 완료",
      screenId: "ZK2-2",
      description: "ZKPasskey 앱이 선택한 Web2 provider에서 복구용 신원 증명을 받아옵니다.",
      processView: {
        kind: "overview",
        description: "각 Web2 계정 재인증 흐름을 보여주고, t개 충족까지 상단 진행 네모칸을 순서대로 채웁니다.",
        cards: [
          { label: "카카오 app", value: "확인되었습니다", tone: "ok" },
          { label: "Google app", value: "확인되었습니다", tone: "ok" },
          { label: "Apple app", value: "대기" },
          { label: "확인 완료 수", value: "2 / 3", tone: "accent" },
        ],
        sequence: providerVerifySeq,
      },
    },
    {
      id: "ZK2-step-3",
      kind: "system-processing",
      label: "증명 생성",
      trigger: "auto",
      duration: 3000,
      screenId: "ZK2-3",
      description: "확인된 Web2 신원을 바탕으로 복구용 영지식 증명을 생성하고 새 계정 정보에 연결합니다.",
      processView: {
        kind: "step-list",
        description: "복구 증명 생성 중 상태와 새 Public key 준비 상태만 보여주고, 복잡한 증명 값은 사용자 화면에 노출하지 않습니다.",
        title: "복구 증명 생성",
        progress: 100,
        progressLabel: "Proof 생성 중",
        steps: [
          { label: "Web2 신원 확인", value: "선택 계정 2개 확인", state: "done" },
          { label: "새 Public key 준비", value: "0xpk42b9...77d1", state: "done" },
          { label: "ZK Proof 생성", value: "Proof Engine 실행", state: "active" },
        ],
        sequence: recoveryProofSeq,
      },
    },
    {
      id: "ZK2-step-4",
      kind: "result",
      label: "증명 생성 완료",
      trigger: "auto",
      duration: 1800,
      screenId: "ZK2-4",
      description: "생성된 증명이 블록체인에서 검증되면 계정이 다시 등록됩니다.",
      processView: {
        kind: "artifact",
        description: "ZKPasskey 앱이 블록체인에 영지식 증명을 제출하고, 검증 후 새 Public key와 지갑 주소를 등록합니다.",
        items: [
          { label: "Public key", value: "0xpk42b9...77d1", tone: "ok" },
          { label: "지갑 주소", value: "0x73fa...e920", tone: "ok" },
          { label: "복구 기준", value: "2 / 3", tone: "accent" },
        ],
        diagram: "account-abstraction",
        sequence: recoveryRegisterSeq,
      },
    },
  ],
};
