# 시나리오 네비게이션 구조 개편 계획

## 배경

현재 앱은 `사용자 유형 선택 -> 바로 해당 영역의 데모 화면`에 가깝다.

예를 들면 개인 지갑 영역은 현재 다음처럼 보인다.

```text
개인 지갑 -> 시나리오 진행 스텝
```

하지만 기획서 기준으로는 한 사용자 유형 안에 여러 시나리오가 있다. 따라서 목표 구조는 다음과 같다.

```text
사용자 유형 -> 시나리오 선택 -> 시나리오 진행 스텝
```

개인 지갑 예시는 다음처럼 바뀌어야 한다.

```text
개인 지갑 -> 지갑 생성 / 거래 요청 / 멀티시그 또는 정책형 시나리오 -> 시나리오 진행 스텝
```

이 문서는 라우팅, 데이터 모델, 네비게이션, 화면 디자인을 어떻게 바꿀지 정리한다. 구현은 별도 작업으로 진행한다.

## 참고 자료

- 현재 코드: `src/router`, `src/pages/OverviewPage.tsx`, `src/pages/ModePage.tsx`, `src/components/layout/SideNav.tsx`
- 현재 시나리오 데이터: `src/scenarios/data/*`
- 기획 엑셀: `/Users/admin/Downloads/demo_scenario_planning.xlsx`
- 현재 디자인 기준: 조용한 금융/운영 콘솔, 얕은 카드, 중립 배경, 작은 폰트, `WebContainer`/`PhoneContainer`의 프레임 감성 유지

## 현재 구조

### 라우팅

```text
/                          overview
/:mode                     사용자 유형별 워크스페이스
/demo/:scenarioId/:step    특정 시나리오 스텝
```

현재 `/:mode`는 "시나리오 목록"이라기보다 각 사용자 유형별 독립 데모 앱에 가깝다. `ModePage` 안에서 `PersonalWorkspace`, `CustodyWorkspace`, `SimpleWebWorkspace`가 직접 상태와 UI를 들고 있다.

### 네비게이션

사이드 네비게이션은 4개 사용자 유형만 보여준다.

```text
개인 지갑
수탁
발행사
플랫폼
```

즉, 사용자는 `개인 지갑`을 선택한 뒤 그 안에서 `지갑 생성`과 `거래 요청` 중 어떤 시나리오를 볼지 명시적으로 선택하지 않는다.

### 시나리오 데이터

코드에는 이미 `Scenario` 타입과 `screens[]`, `steps[]`가 있다. 이 구조는 "시나리오 진행 스텝"을 표현하기에는 적합하다.

부족한 것은 `사용자 유형 -> 시나리오 목록`을 안정적으로 표현하는 상위 정보구조다.

## 기획서 기준 정보구조

엑셀의 `Step_Detail` 기준으로 상위 묶음(actor)과 시나리오는 다음처럼 정리된다.

| 상위 묶음 | 시나리오 | 스텝 수 | 화면 |
| --- | --- | ---: | --- |
| 개인 사용자 거래 | A-1. 지갑 생성 | 5 | app |
| 개인 사용자 거래 | A-2. 거래 요청 | 5 | app |
| 개인 사용자 거래 | ZT-1. 스테이블코인 개인정보보호기반 전송 | 5 | web/app 혼합 가능성 |
| 발행사 운영 | FS-1. 발행사 등록/지갑 생성 | 5 | web |
| 발행사 운영 | FS-2. 발행 요청 | 6 | web |
| 발행사 운영 | FS-3. 소각 요청 | 6 | web |
| 플랫폼 운영 | PO-1. 플랫폼 운영자 설정 | 4 | web |
| 정책형 QR 결제 | ZT-5. CBDC·바우처 프라이버시 | 6 | web/app 혼합 가능성 |
| 리스크 운영 | ZP-1. 거래소 상시 PoR/L 대사 | 1 | web |
| 이상징후 대응 | ZP-4. 거래소 이상징후·차단 | 1 | web |

현재 코드의 시나리오와 엑셀의 시나리오는 일부 명칭과 ID가 다르다.

| 현재 코드 | 기획서와의 관계 |
| --- | --- |
| `FU-1` 지갑 생성 | `A-1. 지갑 생성`으로 rename 또는 alias 필요 |
| `FU-2` 거래 서명 | `A-2. 거래 요청`으로 rename 또는 alias 필요 |
| `IS-1` 발행사 등록 | `FS-1. 발행사 등록/지갑 생성`에 가까움 |
| `PO-1` 플랫폼 운영자 설정 | 유지 가능하나 스텝 수/내용 재조정 필요 |
| `CU-*` 수탁 시나리오 | 현재 코드에는 있으나 이번 엑셀에는 직접 행이 없음. 유지할지 별도 판단 필요 |
| `ZT-*`, `ZP-*` | 엑셀에는 있으나 현재 코드에는 없음. 신규 추가 후보 |

## 목표 사용자 흐름

### 1. 사용자 유형 선택

홈에서는 사용자 유형 또는 업무 묶음을 선택한다.

```text
/ 
  개인 사용자 거래
  발행사 운영
  플랫폼 운영
  정책형 QR 결제
  리스크 운영
  이상징후 대응
```

현재의 `개인 지갑 / 수탁 / 발행사 / 플랫폼` 4분류를 계속 쓸 수도 있지만, 엑셀 반영을 우선하면 actor 명칭을 더 넓게 가져가는 편이 맞다.

추천은 내부 데이터 키와 화면 라벨을 분리하는 방식이다.

```ts
type ActorGroupId =
  | "personal"
  | "issuer"
  | "platform"
  | "policy-payment"
  | "risk"
  | "incident";
```

표시 라벨은 `개인 사용자 거래`, `발행사 운영`처럼 둔다.

### 2. 시나리오 선택

사용자 유형 페이지는 해당 actor의 시나리오 목록만 보여준다.

```text
/personal
  A-1. 지갑 생성
  A-2. 거래 요청
  ZT-1. 스테이블코인 개인정보보호기반 전송
```

각 시나리오 카드에는 다음 정보가 필요하다.

- 시나리오 ID
- 시나리오명
- 짧은 설명
- 화면 형태: web, app, mixed
- 스텝 수
- 진행 상태: 시작 전, 진행 중, 완료
- 마지막으로 본 스텝

### 3. 시나리오 진행

시나리오를 선택하면 기존 `DemoPage` 계열의 구조를 사용한다.

```text
/demo/A-1/0
/demo/A-1/1
...
```

또는 actor를 URL에 포함할 수 있다.

```text
/personal/A-1/0
```

추천은 아래처럼 actor와 scenario를 모두 드러내는 방식이다.

```text
/:actorId/:scenarioId/:stepIndex
```

이유:
- URL만 봐도 어디에 속한 시나리오인지 알 수 있다.
- 사이드 내비와 breadcrumb가 자연스럽다.
- 동일한 scenarioId 충돌 가능성을 줄인다.

단, 기존 공유 URL 호환을 위해 `/demo/:scenarioId/:stepIndex`는 redirect 또는 alias로 남긴다.

## 제안 라우트

```text
/                                      OverviewPage
/:actorId                              ActorScenarioListPage
/:actorId/:scenarioId                  ScenarioPage, 첫 스텝
/:actorId/:scenarioId/:stepIndex       ScenarioPage, 특정 스텝
/demo/:scenarioId/:stepIndex           legacy alias
```

예시:

```text
/personal
/personal/A-1
/personal/A-1/3
/issuer/FS-2/0
/platform/PO-1/2
```

## 데이터 모델 개편

### ActorGroup 추가

`Scenario`만으로는 상위 묶음을 안정적으로 표현하기 어렵다. 별도 registry를 둔다.

```ts
export type ActorGroupId =
  | "personal"
  | "issuer"
  | "platform"
  | "policy-payment"
  | "risk"
  | "incident"
  | "custody";

export type ActorGroup = {
  id: ActorGroupId;
  label: string;
  shortLabel: string;
  description: string;
  surface: "web" | "app" | "mixed";
  scenarioIds: ScenarioId[];
};
```

`custody`는 현재 코드에 구현된 시나리오가 있으므로 당장 제거하지 말고 legacy 또는 별도 actor로 유지한다.

### Scenario 확장

현재 `Scenario` 타입에 다음 필드를 추가한다.

```ts
export type Scenario = {
  id: ScenarioId;
  groupId: ActorGroupId;
  name: string;
  shortName: string;
  actor: string;
  actorType: ActorType;
  surface: "web" | "app" | "mixed";
  summary: string;
  entryLabel?: string;
  designNote?: string;
  screens: UserScreen[];
  steps: ScenarioStep[];
};
```

`mode`는 당장 유지하되, 새 구조에서는 `groupId`가 우선이다. 완전 전환 후 `mode`는 제거하거나 compatibility field로만 남긴다.

### ScenarioId 정리

기획서 기준 ID와 코드 기준 ID가 다르므로 한 번에 바꾸면 깨질 가능성이 크다.

추천 순서:

1. 기존 ID 유지: `FU-1`, `FU-2`, `IS-1`
2. `sourceId` 또는 `planningId` 추가: `A-1`, `A-2`, `FS-1`
3. 화면에는 기획서 ID를 표시
4. 마지막에 URL까지 기획서 ID로 바꾸는 migration 진행

```ts
export type Scenario = {
  id: ScenarioId;          // 내부 안정 ID
  planningId?: string;     // 기획서 ID
  displayId: string;       // 화면/URL 후보
};
```

## 페이지 구조

### OverviewPage

역할: actor group 선택

현재의 큰 카드 레이아웃을 유지하되, 카드는 사용자 유형을 나타낸다. 카드 안에 시나리오 개수를 작게 보여준다.

```text
개인 사용자 거래
3 scenarios
app / mixed

발행사 운영
3 scenarios
web console
```

### ActorScenarioListPage

역할: 선택한 actor 안의 시나리오 목록

화면 구성:
- 상단: actor 제목, 설명, surface badge
- 본문: 시나리오 카드 리스트
- 우측 또는 하단: 최근 진행/완료 상태 요약

카드 밀도는 현재 디자인처럼 차분하게 유지한다.

```text
[A-1] 지갑 생성
모바일 앱에서 지갑 생성 요청부터 주소 매핑까지 확인합니다.
5 steps · app · 시작 전

[A-2] 거래 요청
사용자가 거래를 만들고 서명 상태를 확인합니다.
5 steps · app · 진행 중 Step 2
```

### ScenarioPage

역할: 기존 시나리오 step viewer

현재 `WebContainer`, `PhoneContainer`, `ProcessPanel`, `StepTracker`를 유지한다. 바뀌는 것은 진입 경로와 주변 네비게이션이다.

추천 레이아웃:

```text
TopBar: zkWallet Demo / 개인 사용자 거래 / A-1. 지갑 생성

왼쪽: 사용자 화면
가운데: 중앙 패널 또는 처리 개요
오른쪽: 단계 목록과 설명
```

넓은 화면에서는 현재 콘솔/폰 프레임이 주인공이 되도록 유지한다. 모바일 폭에서는 `사용자 화면 -> 진행 단계 -> 중앙 패널` 순서로 세로 배치한다.

### 시나리오 스텝 표시 레퍼런스

`/Users/admin/Downloads/zkdemo`의 웹 구현을 스텝 진행 UI 레퍼런스로 삼는다.

참고 파일:
- `/Users/admin/Downloads/zkdemo/src/App.tsx`
- `/Users/admin/Downloads/zkdemo/src/components/SystemContainer.tsx`
- `/Users/admin/Downloads/zkdemo/src/components/SequenceDiagram.tsx`
- `/Users/admin/Downloads/zkdemo/src/scenarios/types.ts`
- `/Users/admin/Downloads/zkdemo/REVISION_REQUEST_SEQUENCE_FLOW.md`

레퍼런스의 핵심은 단일 `currentStepIndex`가 사용자 화면과 시스템 패널을 동시에 움직이는 구조다.

```text
currentStepIndex
  -> Phone/Web screen
  -> System sequence view
  -> Step tracker
  -> Current description
```

현재 앱에도 이 방식을 적용한다. 다만 왼쪽 화면은 레퍼런스처럼 phone만 고정하지 않고, scenario의 `actorType` 또는 `surface`에 따라 `PhoneContainer`와 `WebContainer`를 전환한다.

권장 배치:

```text
┌──────────────────────────────────────────────────────────────┐
│ Breadcrumb / Scenario title                                  │
├──────────────────┬──────────────────────────┬────────────────┤
│ 사용자 화면       │ 시스템 처리 과정          │ 진행 단계       │
│ Phone/Web Frame  │ Sequence / Artifact View │ Step Tracker   │
│                  │                          │ Description    │
└──────────────────┴──────────────────────────┴────────────────┘
```

레퍼런스에서 가져올 표시 규칙:
- 모든 주요 step은 항상 보인다.
- 과거 step은 사라지지 않고 흐리게 남는다.
- 현재 step만 accent dot, accent line, 굵은 label로 강조한다.
- 미래 step은 `--line`, `--muted` 톤으로 미리 보인다.
- 오른쪽 tracker 상단에는 `현재 index / 전체 step 수`를 mono text로 표시한다.
- 현재 step의 설명은 tracker 아래 별도 설명 패널로 분리한다.
- 중앙 시스템 패널은 현재 step을 크게 보여주되, 과거 sequence edge는 faint trail로 남긴다.

상태 규칙:

```ts
const isPast = i < currentStepIndex;
const isCurrent = i === currentStepIndex;
const isFuture = i > currentStepIndex;
```

시각 규칙:

```text
past    -> opacity 0.4~0.55, muted text, line remains visible
current -> accent dot, accent-soft halo, 600 weight label
future  -> line/muted tone, no fill
```

현재 `StepTracker`는 단순 단계 목록에 가깝다. 개편 후에는 레퍼런스의 tracker처럼 vertical timeline 형태로 바꾸는 것이 좋다.

```text
진행 단계          3 / 6

● 지갑 생성 요청
● 보안 키 생성 시작
● 생성 진행 상태 확인   <- current
○ 지갑 연결 완료
○ 주소 매핑 완료
```

중앙 패널은 현재 `ProcessPanel`을 유지하되, `ProcessView`에 sequence view를 추가하는 방향을 권장한다.

```ts
export type ProcessView =
  | { kind: "sequence"; actors: string[]; activeEdge: SequenceEdge }
  | { kind: "overview"; ... }
  | { kind: "approval"; ... }
  | { kind: "keygen"; ... }
  | { kind: "artifact"; ... }
  | { kind: "audit"; ... };

export type SequenceEdge = {
  from: string;
  to: string;
  label: string;
  sublabel?: string;
  tone?: Tone;
};
```

`SequenceDiagram`은 레퍼런스 프로젝트의 개념을 그대로 가져오되, 현재 디자인 토큰에 맞게 조정한다.

- node/card radius는 현재 앱 기준으로 8px 전후로 줄인다.
- accent는 현재 `--accent`를 사용한다.
- 실패/경고 edge는 `--bad`, `--warn`을 사용한다.
- 파티클 애니메이션은 필수는 아니고, 우선은 현재 edge pulse 정도로 충분하다.
- 과거 edge trail은 유지한다. 이게 레퍼런스의 가장 중요한 장점이다.

스텝 phase도 레퍼런스처럼 확장할 수 있다.

```ts
export type StepPhase = "preview" | "processing" | "result";

export type ScenarioStep = {
  ...
  phase?: StepPhase;
};
```

동작 원칙:
- `preview`: 자동으로 넘어가지 않는다. 사용자 화면 안의 CTA 또는 하단 CTA로 진행한다.
- `processing`: 짧게 자동 진행 가능하다.
- `result`: 최소 한 박자 머물게 하거나 사용자가 다음으로 넘기게 한다.

이렇게 하면 현재처럼 step이 즉시 결과로 튀는 느낌을 줄이고, 사용자가 "무슨 일이 시작됐고, 지금 처리 중이며, 무엇이 완료됐는지"를 더 자연스럽게 읽을 수 있다.

## 네비게이션 변경

### SideNav

현재는 actor만 보여준다. 변경 후에는 2-level nav가 필요하다.

```text
zkWallet Demo

개인 사용자 거래
  A-1 지갑 생성
  A-2 거래 요청
  ZT-1 개인정보보호 전송

발행사 운영
  FS-1 발행사 등록/지갑 생성
  FS-2 발행 요청
  FS-3 소각 요청

플랫폼 운영
  PO-1 플랫폼 운영자 설정
```

동작:
- actor 페이지에서는 해당 actor가 펼쳐진다.
- scenario 페이지에서는 현재 scenario가 하이라이트된다.
- 완료된 scenario는 작은 check 상태만 보여주고 큰 색 변화는 주지 않는다.
- 화면이 좁을 때는 사이드바를 숨기고 TopBar의 breadcrumb와 actor/scenario selector로 대체한다.

### Breadcrumb

TopBar 또는 콘텐츠 상단에 다음 구조를 노출한다.

```text
Demo Home / 개인 사용자 거래 / A-1. 지갑 생성 / Step 3
```

breadcrumb는 텍스트만 과하게 키우지 말고 현재 디자인처럼 `12px~13px`의 작은 정보 레이어로 둔다.

## 디자인 보존 원칙

이번 개편은 정보구조가 커지는 작업이지만, 디자인 레퍼런스를 깨뜨리면 안 된다. 현재 앱의 장점은 조용한 금융 운영툴 느낌이다.

유지할 것:
- `--bg`, `--surface`, `--line`, `--ink` 기반의 중립적인 톤
- 8px 전후의 작은 radius 카드
- 과하지 않은 shadow
- `WebContainer`의 브라우저 프레임
- `PhoneContainer`의 모바일 프레임
- `ProcessPanel`의 상태 카드와 단계형 설명
- 작은 badge와 mono ID 표시

피할 것:
- 랜딩 페이지처럼 큰 hero를 만드는 것
- actor/scenario 카드를 너무 장식적으로 만드는 것
- 한 화면에 많은 색을 추가하는 것
- nested card가 늘어나서 카드 안에 카드가 계속 쌓이는 구조
- 시나리오 설명 텍스트가 화면의 주인공이 되는 것

### 시나리오 카드 디자인

시나리오 카드는 현재 `OverviewPage` 카드보다 더 작고 밀도 있게 만든다.

권장:
- `rounded-lg border border-[var(--line)] bg-[var(--surface)]`
- ID는 mono `11px`
- 제목은 `16px~18px`
- 설명은 `13px`
- metadata는 `surface`, `steps`, `status` 배지로 처리
- primary action은 텍스트 버튼 수준으로 충분

### Actor 페이지 디자인

actor 페이지는 운영 콘솔의 목록 화면처럼 보이게 한다.

권장:
- 상단에 actor 제목과 짧은 설명
- 바로 아래에 compact stats: 시나리오 수, 완료 수, surface
- 카드 grid 또는 table-like list
- 수탁/발행사/플랫폼처럼 웹 콘솔 성격이 강한 actor는 list density를 높인다.
- 개인 사용자처럼 app 성격이 강한 actor는 카드에 phone/app badge를 명확히 둔다.

### ScenarioPage 디자인

기존 데모 화면의 프레임을 최대한 유지한다.

변경 포인트:
- 상단에 actor/scenario breadcrumb 추가
- 오른쪽 step tracker에서 같은 actor의 다른 scenario로 이동하는 작은 링크를 제공
- step tracker는 지금보다 "현재 스텝" 중심으로 더 명확하게 하되, 큰 색상 변화는 피한다.

## 구현 순서

### Phase 1. 데이터 레지스트리 추가

- `src/scenarios/groups.ts` 추가
- `ActorGroupId`, `ActorGroup` 타입 추가
- 기존 scenario에 `groupId`, `displayId`, `planningId`, `surface` 추가
- `scenariosByGroup` selector 추가

완료 기준:
- 코드에서 `groupId`로 시나리오 목록을 만들 수 있다.
- 기존 화면은 깨지지 않는다.

### Phase 2. 라우터 확장

- `DemoRoute`에 actor route 추가
- `parseRoute`가 `/:actorId`, `/:actorId/:scenarioId`, `/:actorId/:scenarioId/:stepIndex`를 해석
- 기존 `/demo/:scenarioId/:stepIndex`는 유지
- `pathForRoute` 추가/수정

완료 기준:
- `/personal`, `/issuer/FS-2/0` 같은 URL을 파싱할 수 있다.
- legacy URL도 계속 동작한다.

### Phase 3. ActorScenarioListPage 추가

- 기존 `ModePage`의 역할을 줄이고 새 페이지를 만든다.
- actor별 시나리오 목록 카드 구현
- scenario 클릭 시 첫 step으로 이동

완료 기준:
- 홈에서 actor 선택
- actor 페이지에서 scenario 선택
- scenario page로 진입 가능

### Phase 4. SideNav 2-level 구조

- `SideNav`가 `ActorGroup[]`와 `Scenario[]`를 기반으로 렌더링
- actor 접힘/펼침 상태는 route 기준 자동 처리
- 현재 scenario active 표시

완료 기준:
- 현재 위치가 actor/scenario 단위로 보인다.
- 다른 scenario로 직접 이동 가능하다.

### Phase 5. ScenarioPage 정리

- 기존 `ModePage` 안의 workspace형 데모와 `Scenario` 기반 viewer 역할을 분리
- 장기적으로는 `Scenario` 기반 viewer를 표준으로 삼는다.
- `PersonalWorkspace`, `CustodyWorkspace`, `SimpleWebWorkspace`는 임시 sandbox 또는 제거 후보로 둔다.

완료 기준:
- 모든 공식 scenario는 `screens[]`와 `steps[]`를 통해 렌더링된다.
- actor page는 목록, scenario page는 진행 화면이라는 역할이 분명해진다.

### Phase 6. 기획서 ID/신규 시나리오 반영

- `A-1`, `A-2`, `FS-1`, `ZT-1`, `ZT-5`, `ZP-1`, `ZP-4` 추가 또는 alias 처리
- 엑셀의 step 문구를 `screens[]`, `steps[]`, `processView`에 반영
- `CU-*` 유지 여부 결정

완료 기준:
- 기획서의 actor/scenario 구조가 앱에서 그대로 탐색된다.
- 현재 구현된 시나리오와 신규 기획 시나리오가 같은 UI 패턴으로 보인다.

## 주요 결정 필요 사항

1. `수탁` actor를 계속 유지할지
   - 현재 코드에는 `CU-1~3`가 있으나 이번 엑셀에는 직접 포함되어 있지 않다.
   - 데모 가치가 있으면 `수탁 운영` actor로 유지하는 편이 좋다.

2. URL에 기획서 ID를 쓸지 내부 ID를 쓸지
   - 단기: 내부 ID 유지 + `displayId` 표시
   - 장기: 기획서 ID 기반 URL 추천

3. mixed surface 시나리오 처리 방식
   - `ZT-1`, `ZT-5`는 web/app이 섞일 가능성이 있다.
   - `ScenarioStep` 또는 `UserScreen` 단위에 `actorType`/`surface` override가 필요할 수 있다.

4. 현재 `ModePage`의 interactive workspace 유지 여부
   - 실제 제품처럼 조작하는 장점은 있다.
   - 하지만 새 구조에서는 시나리오 목록 페이지와 역할이 충돌한다.
   - 공식 데모는 `Scenario` 기반 viewer로 통일하고, interactive workspace는 나중에 별도 lab으로 분리하는 것이 깔끔하다.

## 권장 최종 구조

```text
src/
  router/
    index.ts
  scenarios/
    groups.ts
    index.ts
    types.ts
    data/
      a1.ts
      a2.ts
      fs1.ts
      fs2.ts
      fs3.ts
      po1.ts
      zt1.ts
      zt5.ts
      zp1.ts
      zp4.ts
  pages/
    OverviewPage.tsx
    ActorScenarioListPage.tsx
    ScenarioPage.tsx
  components/
    layout/
      AppShell.tsx
      SideNav.tsx
      TopBar.tsx
    scenario/
      ScenarioCard.tsx
      ScenarioBreadcrumb.tsx
      ScenarioProgressSummary.tsx
    web/
    phone/
    process/
```

## 한 줄 결론

지금 필요한 변화는 단순히 카드 하나를 추가하는 수준이 아니라, 앱의 중심 단위를 `mode`에서 `actor group + scenario`로 바꾸는 것이다. 기존의 화면 프레임과 차분한 콘솔 디자인은 유지하되, 사용자는 반드시 `어떤 사용자 유형인지 선택 -> 그 안의 어떤 시나리오인지 선택 -> 해당 시나리오의 스텝 진행` 순서로 이동하게 만들어야 한다.
