# zkdemo-v2 완전한 데모 앱 구현 계획

## 현재 상태 요약

현재 구현된 것:
- 10개 시나리오 데이터 (PO-1, CU-1~3, IS-1, FS-2~4, FU-1~2)
- `useScenarioPlayer` 훅 기반 선형 step 진행
- WebContainer / PhoneContainer 껍데기
- ProcessPanel (overview/approval/keygen/artifact/audit 뷰)
- 레이아웃 타입 시스템 (form/approval/processing/result/dashboard/cta)
- 서비스 레이어 인터페이스 + mock 구현

## 핵심 문제: "고정된 흐름"

현재 앱의 근본적인 한계:
1. **선형 demo player** - step 1→2→3 순서만 가능, 자유 이동 없음
2. **폼이 display-only** - input 박스처럼 생겼지만 읽기 전용
3. **라우팅 없음** - 단일 페이지에 dropdown으로 시나리오 전환
4. **자유도 없음** - 사용자가 원하는 시나리오, 원하는 단계로 직접 갈 수 없음
5. **분위기가 demo** - 실제 제품처럼 안 느껴짐

## 완전한 데모 앱의 의미

"완전한 데모 앱" = 실제 금융기관 운영자나 개인 사용자가 사용하는 제품처럼 느껴지는 앱

구체적으로:
- 웹 콘솔은 실제 관리자 콘솔처럼 생겼어야 함 (사이드바, 테이블, 카드)
- 모바일은 실제 슈퍼앱처럼 생겼어야 함
- 폼은 실제로 입력할 수 있어야 함 (값이 바뀌어야 함)
- 어느 페이지에서든 원하는 시나리오 / 단계로 바로 이동 가능
- URL로 특정 시나리오 / 단계 공유 가능
- 시나리오 흐름은 참고용이지, 강요되지 않아야 함

---

## 아키텍처 변경 계획

### 1. React Router 도입

```
/                          → 개요 페이지 (4개 모드 카드)
/platform                  → 플랫폼 운영자 시나리오 목록
/custody                   → 수탁 운영 시나리오 목록  
/issuer                    → 발행사 시나리오 목록
/personal                  → 개인 사용자 시나리오 목록
/demo/:scenarioId          → 시나리오 뷰어 (첫 번째 step)
/demo/:scenarioId/:step    → 특정 step (URL 직접 접근 가능)
```

**설치**: `npm install react-router-dom`

### 2. 상태 관리 (Zustand)

```ts
// src/store/demoStore.ts
interface DemoStore {
  // 시나리오별 현재 step (나갔다 돌아와도 유지)
  stepMap: Record<ScenarioId, number>;
  
  // 폼 값 (시나리오별 입력값 저장)
  formValues: Record<string, Record<string, string>>;
  
  // 완료된 시나리오 목록
  completedScenarios: ScenarioId[];
  
  // 액션
  setStep(id: ScenarioId, step: number): void;
  setFormValue(screenId: string, fieldLabel: string, value: string): void;
  markCompleted(id: ScenarioId): void;
  resetScenario(id: ScenarioId): void;
}
```

**설치**: `npm install zustand`

### 3. 레이아웃 구조 변경

현재: 단일 페이지, TopBar + 콘텐츠 영역

변경 후:
```
┌────────────────────────────────────────────────────┐
│  TopBar (제품명 + 현재 모드 breadcrumb)             │
├──────────────┬─────────────────────────────────────┤
│              │                                      │
│   SideNav    │   Main Content (라우터가 렌더링)     │
│   (시나리오  │                                      │
│    목록)     │                                      │
│              │                                      │
└──────────────┴─────────────────────────────────────┘
```

---

## 새 파일 구조

```
src/
├── router/
│   └── index.tsx           # createBrowserRouter 설정
├── store/
│   └── demoStore.ts        # Zustand store
├── pages/
│   ├── OverviewPage.tsx    # / - 4개 모드 카드
│   ├── ModePage.tsx        # /:mode - 모드별 시나리오 목록
│   └── DemoPage.tsx        # /demo/:scenarioId/:step - 시나리오 뷰어
├── components/
│   ├── layout/
│   │   ├── TopBar.tsx      # (기존 유지, breadcrumb 추가)
│   │   ├── SideNav.tsx     # ★ NEW - 좌측 시나리오 네비게이션
│   │   └── AppShell.tsx    # ★ NEW - SideNav + 콘텐츠 래퍼
│   ├── web/
│   │   ├── WebContainer.tsx
│   │   ├── WebScreen.tsx
│   │   └── layouts/
│   │       ├── WebFormLayout.tsx      # ★ 폼 입력 가능하게 변경
│   │       ├── WebApprovalLayout.tsx
│   │       ├── WebProcessingLayout.tsx
│   │       ├── WebResultLayout.tsx
│   │       └── WebDashboardLayout.tsx
│   ├── phone/
│   │   ├── PhoneContainer.tsx
│   │   ├── PhoneScreen.tsx
│   │   └── layouts/
│   │       ├── AppCtaLayout.tsx
│   │       ├── AppFormLayout.tsx      # ★ 폼 입력 가능하게 변경
│   │       ├── AppProcessingLayout.tsx
│   │       └── AppResultLayout.tsx
│   └── process/
│       ├── ProcessPanel.tsx
│       ├── StepTracker.tsx
│       └── views/ (기존 유지)
└── App.tsx                 # RouterProvider 렌더링만 남김
```

---

## 페이지별 구현 명세

### OverviewPage (`/`)

```
┌──────────────────────────────────────────────────┐
│  zkWallet Demo  │  금융기관용                     │
├──────────────────────────────────────────────────┤
│                                                  │
│  플랫폼 운영자용    수탁 운영용                   │
│  [PO-1 카드]       [CU-1] [CU-2] [CU-3]          │
│                                                  │
│  발행사용          개인 사용자용                  │
│  [IS-1][FS-2]      [FU-1] [FU-2]                 │
│  [FS-3][FS-4]                                    │
│                                                  │
└──────────────────────────────────────────────────┘
```

각 시나리오 카드에:
- 시나리오 ID (PO-1 등)
- 시나리오명
- actor 배지
- step 수
- 완료 여부 indicator

### ModePage (`/:mode`)

```
┌─────────────────────────────────────────────────┐
│ 수탁 운영용                                      │
├─────────────────────────────────────────────────┤
│                                                  │
│  CU-1 수탁 등록 및 지갑 개설        → 시작      │
│  법인 사용자 등록 후 수탁 승인을 거쳐...  5 steps │
│                                                  │
│  CU-2 수탁용 입금                   → 시작      │
│  수탁 내역을 등록하고 관리자 승인을... 4 steps   │
│                                                  │
│  CU-3 수탁용 출금                   → 시작      │
│  출금 요청·승인·화이트리스트 검증... 6 steps    │
│                                                  │
└─────────────────────────────────────────────────┘
```

### DemoPage (`/demo/:scenarioId/:step`)

레이아웃 (현재 4분할 구조 유지하되 비율 개선):

```
┌──────────────────────────────────────────────────────────────┐
│ TopBar: zkWallet Demo > 수탁 운영용 > CU-3 수탁용 출금       │
├──────────────┬──────────────────────────┬───────────────────┤
│              │                          │  진행 단계        │
│  사용자 화면  │  화면 설명 / 처리 개요  │  Step 3/6         │
│  (웹 콘솔    │  (ProcessPanel)          │  ─────────────    │
│   또는       │                          │  StepTracker      │
│   모바일)    │                          │                   │
│              │                          │  ─────────────    │
│              │                          │  설명             │
│              │                          │  (description)    │
└──────────────┴──────────────────────────┴───────────────────┘
```

비율: `3:4:3` (좌:중:우)

---

## SideNav 명세

```tsx
// 항상 표시, 접을 수 있음
// 섹션: 플랫폼 운영자용 / 수탁 운영용 / 발행사용 / 개인 사용자용
// 현재 시나리오 하이라이트
// 완료된 시나리오에 체크마크

interface SideNavProps {
  currentScenarioId?: ScenarioId;
  completedScenarios: ScenarioId[];
}
```

---

## 폼 인터랙션 변경

### 현재 (읽기 전용)
```tsx
<div className="input-style">{field.value}</div>
```

### 변경 후 (실제 입력 가능)
```tsx
// form 레이아웃에서는 실제 input 렌더링
// 초기값은 scenario 데이터의 field.value
// 입력 변경 시 demoStore.setFormValue() 호출

const storedValue = formValues[screen.id]?.[field.label];
const displayValue = storedValue ?? field.value;

<input
  value={displayValue}
  onChange={(e) => setFormValue(screen.id, field.label, e.target.value)}
  className="input-style"
/>
```

### 폼 Submit 동작
- `tone: "accent"` 버튼 클릭 시 → 다음 step으로 이동 + URL 업데이트
- form layout의 경우: 실제 submit 이벤트처럼 처리 (짧은 loading 후 이동)

---

## StepTracker 개선

### 현재
- 현재 step 하이라이트만 됨
- 클릭해도 이동 안 됨

### 변경 후
```tsx
// 모든 step 클릭 가능 (자유 이동)
// 완료된 step: 체크마크
// 현재 step: 하이라이트
// 미래 step: 흐리게 (하지만 클릭 가능)

<button onClick={() => navigate(`/demo/${scenario.id}/${stepIndex}`)}>
  <StepItem ... />
</button>
```

---

## URL 기반 step 관리

```ts
// DemoPage.tsx
const { scenarioId, step } = useParams();
const stepIndex = parseInt(step ?? "0", 10);

// 이전/다음 버튼
function goNext() {
  if (stepIndex < scenario.steps.length - 1) {
    navigate(`/demo/${scenarioId}/${stepIndex + 1}`);
  }
}

function goPrev() {
  if (stepIndex > 0) {
    navigate(`/demo/${scenarioId}/${stepIndex - 1}`);
  }
}
```

---

## 웹 콘솔 리얼리즘 개선

현재 WebContainer는 브라우저 크롬만 있고 실제 콘솔처럼 안 보임.

### 변경 후 WebContainer 내부 구조

```
┌──────────────────────────────────────────┐
│ 🔒 custody.zkwallet.io/requests          │  ← 주소바
├──────────────────────────────────────────┤
│  [대시보드] [지갑] [요청] [감사] [설정]  │  ← 탭 네비게이션
├──────────────────────────────────────────┤
│                                          │
│   [시나리오 화면 콘텐츠]                 │  ← 레이아웃별 렌더링
│                                          │
└──────────────────────────────────────────┘
```

각 시나리오에 맞는 탭 활성화:
- 수탁 시나리오 → "지갑" 탭 활성
- 승인 대기 → "요청" 탭 활성
- 결과 확인 → "감사" 탭 활성

탭은 실제 클릭 기능은 없어도 됨 (위치 맥락만 전달)

---

## 모바일 앱 리얼리즘 개선

현재 PhoneContainer는 껍데기만 있음.

### 변경 후 PhoneContainer 내부 구조

```
┌────────────────────┐
│  9:41    ▲ 🔋      │  ← status bar
├────────────────────┤
│  < 뒤로  zkWallet  │  ← 앱 네비게이션 바
├────────────────────┤
│                    │
│  [화면 콘텐츠]     │
│                    │
└────────────────────┘
```

---

## 웹 콘솔 메뉴 맥락 데이터

각 시나리오가 어떤 메뉴에 위치하는지:
```ts
const scenarioNavContext: Record<ScenarioId, {
  menuItem: string;   // 활성 탭/메뉴
  pageTitle: string;  // 페이지 제목
}> = {
  "PO-1": { menuItem: "설정", pageTitle: "플랫폼 설정" },
  "CU-1": { menuItem: "수탁 관리", pageTitle: "수탁 등록" },
  "CU-2": { menuItem: "수탁 관리", pageTitle: "수탁 입금" },
  "CU-3": { menuItem: "수탁 관리", pageTitle: "수탁 출금" },
  "IS-1": { menuItem: "발행사 설정", pageTitle: "발행사 등록" },
  "FS-2": { menuItem: "발행 관리", pageTitle: "발행 요청" },
  "FS-3": { menuItem: "발행 관리", pageTitle: "소각 요청" },
  "FS-4": { menuItem: "준비금", pageTitle: "유동성 관리" },
  "FU-1": { menuItem: "지갑", pageTitle: "지갑 만들기" },
  "FU-2": { menuItem: "거래", pageTitle: "거래 서명" },
};
```

---

## 구현 우선순위

### Phase 1: 라우팅 + 네비게이션 (핵심)
1. `npm install react-router-dom zustand`
2. `src/router/index.tsx` 생성 (라우트 정의)
3. `App.tsx` → RouterProvider만 렌더링하게 변경
4. `OverviewPage.tsx` 생성 (4개 모드 카드)
5. `DemoPage.tsx` 생성 (기존 App.tsx 로직 이동 + URL 기반 step)
6. `SideNav.tsx` 생성 (시나리오 목록 사이드바)
7. `AppShell.tsx` 생성 (SideNav + outlet)

### Phase 2: 인터랙션 개선
1. Zustand store 생성
2. WebFormLayout: input 실제 편집 가능하게 변경
3. AppFormLayout: input 실제 편집 가능하게 변경
4. StepTracker: 클릭으로 step 이동 가능하게 변경
5. 이전/다음 키보드 단축키 (← →)

### Phase 3: 리얼리즘
1. WebContainer 탭 네비게이션 추가
2. PhoneContainer 앱 네비바 추가
3. 각 시나리오에 맞는 navContext 연결
4. 시나리오 완료 상태 표시 (OverviewPage에 반영)

---

## 유지할 것 (변경 불필요)

- `src/scenarios/types.ts` - ScreenLayout 타입 포함 완성됨
- `src/scenarios/data/*.ts` - 10개 데이터 파일 완성됨 (layout 필드 포함)
- `src/utils/tone.ts` - 완성됨
- `src/services/` - 완성됨 (백엔드 연결 시 교체)
- `src/mocks/` - 완성됨
- `src/components/process/` - ProcessPanel 및 하위 뷰 완성됨
- `src/components/web/layouts/` - 레이아웃 컴포넌트 (Phase 2에서 input 추가만)
- `src/components/phone/layouts/` - 레이아웃 컴포넌트 (Phase 2에서 input 추가만)

---

## 변경/삭제할 것

- `src/App.tsx` → RouterProvider 렌더링만 남기고 로직 제거
- `src/components/layout/OverviewPage.tsx` → `src/pages/OverviewPage.tsx`로 이동 및 개선
- `src/components/layout/TopBar.tsx` → breadcrumb 추가
- `src/hooks/useScenarioPlayer.ts` → DemoPage로 흡수 (URL 기반으로 교체)

---

## 현재 App.tsx 현황

현재 App.tsx가 모든 라우팅 역할을 하고 있음.
DemoPage로 이전 시 다음을 이동:
- 시나리오 선택 상태 → URL params로
- step 진행 로직 → DemoPage + zustand로
- WebContainer/PhoneContainer/ProcessPanel 조합 → DemoPage 내부로

---

## 패키지 추가 필요

```bash
npm install react-router-dom zustand
npm install -D @types/react-router-dom  # 타입이 패키지에 포함되어 있으므로 불필요할 수 있음
```

---

## 완료 기준

다음이 모두 가능하면 "완전한 데모 앱":
- [ ] `/demo/CU-3/2` URL로 직접 접근하면 CU-3 시나리오 3번째 step이 바로 표시됨
- [ ] SideNav에서 다른 시나리오 클릭 시 URL 변경되며 바로 이동
- [ ] WebFormLayout의 input에 값을 직접 입력할 수 있음
- [ ] StepTracker의 step 클릭으로 해당 step으로 이동 가능
- [ ] OverviewPage에서 완료한 시나리오에 체크마크가 표시됨
- [ ] WebContainer가 수탁 관리 콘솔처럼, PhoneContainer가 슈퍼앱처럼 보임
