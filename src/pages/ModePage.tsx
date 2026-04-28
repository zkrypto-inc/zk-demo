import { useState } from "react";
import type { ReactNode } from "react";
import { ProcessPanel } from "@/components/process/ProcessPanel";
import { WebContainer } from "@/components/web/WebContainer";
import type {
  ProcessView,
  ScenarioId,
  ScenarioMode,
  ScenarioStep,
  ScreenAction,
  Tone,
  UserScreen,
} from "@/scenarios/types";

type Props = {
  mode: ScenarioMode;
};

type EventItem = {
  id: string;
  title: string;
  detail: string;
  actor: string;
};

type LiveValue = {
  label: string;
  value: string;
  detail?: string;
  tone?: Tone;
};

type RoleOption<T extends string> = {
  id: T;
  label: string;
  detail: string;
};

type ActiveAction = {
  label: string;
  run: () => void;
};

const modeMeta: Record<ScenarioMode, { title: string; eyebrow: string; summary: string }> = {
  personal: {
    title: "개인 지갑",
    eyebrow: "Mobile App",
    summary: "개인 사용자가 앱에서 지갑 생성과 거래 서명을 직접 수행합니다.",
  },
  custody: {
    title: "수탁",
    eyebrow: "Web Console",
    summary: "법인 요청, 플랫폼 승인, 수탁 운영, 관리자 승인, 감사 조회를 분리해 보여줍니다.",
  },
  issuer: {
    title: "발행사",
    eyebrow: "Web Console",
    summary: "발행사 요청 이후 준법감시인과 리스크 승인자를 거쳐 발행/소각을 실행합니다.",
  },
  platform: {
    title: "플랫폼",
    eyebrow: "Web Console",
    summary: "Tenant, 프로그램, 운영 주체 연결, 승인 정책을 운영자별 콘솔로 구성합니다.",
  },
};

function makeEventId(index: number) {
  return `EVT-${String(index + 1001).padStart(4, "0")}`;
}

function pushEvent(
  setEvents: React.Dispatch<React.SetStateAction<EventItem[]>>,
  title: string,
  detail: string,
  actor: string,
) {
  setEvents((prev) => [{ id: makeEventId(prev.length), title, detail, actor }, ...prev]);
}

function toneForStatus(status: string): Tone {
  if (status.includes("완료") || status.includes("가능") || status.includes("활성") || status.includes("연결됨")) return "ok";
  if (status.includes("대기") || status.includes("검토") || status.includes("생성 중")) return "warn";
  if (status.includes("반려") || status.includes("실패")) return "bad";
  return "neutral";
}

function field(label: string, value: string, tone?: Tone) {
  return { label, value, tone };
}

function action(label: string, tone: Tone = "accent"): ScreenAction[] {
  return [{ id: label.replace(/\s/g, "-"), label, tone }];
}

function screen(
  id: string,
  layout: UserScreen["layout"],
  title: string,
  subtitle: string,
  status: string,
  sections: UserScreen["sections"],
  actions?: ScreenAction[],
  footer?: string,
): UserScreen {
  return { id, layout, title, subtitle, status, sections, actions, footer };
}

function step(id: string, label: string, currentScreen: UserScreen, processView: ProcessView): ScenarioStep {
  return {
    id,
    kind: "user-action",
    label,
    trigger: "user",
    ctaLabel: currentScreen.actions?.[0]?.label,
    screenId: currentScreen.id,
    processView,
    description: currentScreen.subtitle,
  };
}

function eventLines(events: EventItem[]) {
  if (events.length === 0) return ["audit.waiting actor=system detail=아직 실행된 이벤트가 없습니다."];
  return events.slice(0, 8).map((event) => `${event.id} actor=${event.actor} action=${event.title} detail=${event.detail}`);
}

function RoleRail<T extends string>({
  current,
  events,
  onSelect,
  roles,
  values,
}: {
  current: T;
  events: EventItem[];
  onSelect: (role: T) => void;
  roles: RoleOption<T>[];
  values: LiveValue[];
}) {
  return (
    <aside className="space-y-4">
      <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
        <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--ink-2)]">Actor</div>
        <div className="space-y-2">
          {roles.map((role) => (
            <button
              className={`w-full rounded-md border px-3 py-3 text-left transition ${
                current === role.id
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink-2)] hover:border-[var(--accent)]"
              }`}
              key={role.id}
              onClick={() => onSelect(role.id)}
              type="button"
            >
              <div className="text-[13px] font-semibold">{role.label}</div>
              <div className="mt-1 text-[11px] leading-[1.4] text-[var(--muted)]">{role.detail}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
        <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--ink-2)]">Live Values</div>
        <div className="space-y-2">
          {values.map((item) => (
            <div className="rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2" key={item.label}>
              <div className="text-[10px] text-[var(--ink-2)]">{item.label}</div>
              <div
                className={`mt-1 break-all font-mono text-[12px] font-semibold ${
                  item.tone === "ok"
                    ? "text-[var(--ok)]"
                    : item.tone === "warn"
                      ? "text-[var(--warn)]"
                      : item.tone === "bad"
                        ? "text-[var(--bad)]"
                        : item.tone === "accent"
                          ? "text-[var(--accent)]"
                          : "text-[var(--ink)]"
                }`}
              >
                {item.value}
              </div>
              {item.detail && <div className="mt-1 text-[11px] leading-[1.35] text-[var(--muted)]">{item.detail}</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
        <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--ink-2)]">Recent Events</div>
        <div className="space-y-2">
          {events.length === 0 ? (
            <div className="rounded-md bg-[var(--surface-2)] px-3 py-3 text-[12px] text-[var(--ink-2)]">아직 이벤트가 없습니다.</div>
          ) : (
            events.slice(0, 5).map((event) => (
              <div className="rounded-md bg-[var(--surface-2)] px-3 py-2" key={event.id}>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[12px] font-semibold text-[var(--ink)]">{event.title}</div>
                  <div className="font-mono text-[10px] text-[var(--muted)]">{event.id}</div>
                </div>
                <div className="mt-1 text-[11px] leading-[1.35] text-[var(--ink-2)]">
                  {event.actor} · {event.detail}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}

function BrowserFrame({
  actor,
  host,
  pageTitle,
  navItems,
  activeNav,
  onNavChange,
  children,
}: {
  actor: string;
  host: string;
  pageTitle: string;
  navItems: { id: string; label: string }[];
  activeNav: string;
  onNavChange: (id: string) => void;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col items-center">
      <div className="mb-5 flex w-full items-center justify-between">
        <div>
          <div className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--ink-2)]">사용자 화면</div>
          <div className="mt-1 text-[15px] font-semibold text-[var(--ink)]">{actor}</div>
        </div>
        <span className="inline-flex h-6 items-center rounded-full bg-[var(--surface-2)] px-3 font-mono text-[11px] font-medium text-[var(--ink-2)]">web</span>
      </div>
      <div className="w-full overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_2px_8px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.08)]">
        <div className="flex h-9 items-center gap-3 border-b border-[var(--line)] bg-[var(--surface-2)] px-4">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex h-5 flex-1 items-center rounded bg-[var(--surface)] px-2.5">
            <span className="truncate font-mono text-[11px] text-[var(--muted)]">https://{host}</span>
          </div>
        </div>
        <div className="flex h-[610px]">
          <div className="hidden w-[120px] shrink-0 border-r border-[var(--line)] bg-[var(--surface-2)]/60 px-3 py-4 sm:flex sm:flex-col">
            <div className="mb-4 text-[11px] font-bold text-[var(--ink)]">zkWallet</div>
            <nav className="flex-1 space-y-0.5">
              {navItems.map((item) => (
                <button
                  className={`w-full rounded-md px-2 py-2 text-left text-[11px] font-semibold transition-colors ${
                    activeNav === item.id
                      ? "bg-[var(--accent)] text-white"
                      : "text-[var(--ink-2)] hover:bg-[var(--surface)] hover:text-[var(--ink)]"
                  }`}
                  key={item.id}
                  onClick={() => onNavChange(item.id)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-[var(--line)] px-4">
              <div className="text-[13px] font-semibold text-[var(--ink)]">{pageTitle}</div>
              <span className="rounded bg-[var(--surface-2)] px-2 py-1 font-mono text-[10px] text-[var(--ink-2)]">live</span>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
            <div className="flex shrink-0 items-center gap-2 border-t border-[var(--line)] px-4 py-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[var(--ok)]" />
              <span className="text-[11px] text-[var(--muted)]">{actor}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WBtn({
  children,
  onClick,
  tone = "neutral",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: "accent" | "ok" | "bad" | "warn" | "neutral";
  disabled?: boolean;
}) {
  const cls = {
    accent: "bg-[var(--accent)] text-white hover:opacity-90",
    ok: "bg-[var(--ok)] text-white hover:opacity-90",
    bad: "bg-[var(--bad)] text-white hover:opacity-90",
    warn: "bg-[var(--warn)] text-white hover:opacity-90",
    neutral: "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-2)]",
  }[tone];
  return (
    <button
      className={`inline-flex h-8 items-center justify-center rounded-md px-3 text-[12px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${cls}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function WField({ label, value, onChange, mono }: { label: string; value: string; onChange?: (v: string) => void; mono?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-[var(--ink-2)]">{label}</span>
      <input
        className={`h-9 w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 text-[12px] text-[var(--ink)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-soft)] disabled:bg-[var(--surface-2)] disabled:text-[var(--muted)] ${mono ? "font-mono" : ""}`}
        disabled={!onChange}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        value={value}
      />
    </label>
  );
}

function WCard({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
      {title && <div className="mb-3 text-[12px] font-semibold text-[var(--ink)]">{title}</div>}
      {children}
    </div>
  );
}

function WRow({ label, value, tone, mono }: { label: string; value: string; tone?: Tone; mono?: boolean }) {
  const vc: Record<Tone, string> = { ok: "text-[var(--ok)]", warn: "text-[var(--warn)]", bad: "text-[var(--bad)]", accent: "text-[var(--accent)]", neutral: "text-[var(--ink)]" };
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] py-2 last:border-0">
      <span className="shrink-0 text-[11px] text-[var(--ink-2)]">{label}</span>
      <span className={`${mono ? "font-mono" : ""} text-right text-[12px] font-semibold ${vc[tone ?? "neutral"]}`}>{value}</span>
    </div>
  );
}

function WPill({ tone, children }: { tone?: Tone; children: ReactNode }) {
  const cls: Record<Tone, string> = { ok: "bg-[var(--ok-soft)] text-[var(--ok)]", warn: "bg-[var(--warn-soft)] text-[var(--warn)]", bad: "bg-[var(--bad-soft)] text-[var(--bad)]", accent: "bg-[var(--accent-soft)] text-[var(--accent)]", neutral: "bg-[var(--surface-2)] text-[var(--ink-2)]" };
  return <span className={`inline-flex h-5 items-center rounded-full px-2.5 text-[10px] font-semibold ${cls[tone ?? "neutral"]}`}>{children}</span>;
}

function WEmpty({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="mb-2 text-2xl text-[var(--line)]">—</div>
      <div className="text-[12px] text-[var(--ink-2)]">{text}</div>
    </div>
  );
}

function WEventLog({ events }: { events: EventItem[] }) {
  if (events.length === 0) return <WEmpty text="아직 이벤트가 없습니다." />;
  return (
    <div className="space-y-2">
      {events.map((e) => (
        <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-3" key={e.id}>
          <div className="flex items-center justify-between gap-2">
            <div className="text-[12px] font-semibold text-[var(--ink)]">{e.title}</div>
            <span className="font-mono text-[10px] text-[var(--muted)]">{e.id}</span>
          </div>
          <div className="mt-1 text-[11px] text-[var(--ink-2)]">{e.actor} · {e.detail}</div>
        </div>
      ))}
    </div>
  );
}

function ShellGrid({
  left,
  processView,
  rail,
  stepView,
}: {
  left: React.ReactNode;
  processView: ProcessView;
  rail: React.ReactNode;
  stepView: ScenarioStep;
}) {
  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(500px,0.92fr)_minmax(420px,1fr)_280px]">
      {left}
      <ProcessPanel currentStep={stepView} processView={processView} />
      {rail}
    </div>
  );
}

type CustodyActor = "corporate" | "platform" | "operator" | "approver" | "auditor";
type CustodyNavId = "dashboard" | "register" | "deposit" | "withdraw" | "approvals" | "wallet" | "review" | "sign" | "history" | "log";

const custodyRoles: RoleOption<CustodyActor>[] = [
  { id: "corporate", label: "법인 사용자", detail: "수탁 등록, 입금, 출금 요청" },
  { id: "platform", label: "플랫폼 운영자", detail: "법인 수탁 등록 승인" },
  { id: "operator", label: "수탁 운영자", detail: "지갑 생성, 화이트리스트 확인, 서명 전송" },
  { id: "approver", label: "수탁 관리자", detail: "입금 승인, 출금 2인 승인" },
  { id: "auditor", label: "감사자", detail: "요청과 승인 이력 조회" },
];

const custodyActorNav: Record<CustodyActor, { id: CustodyNavId; label: string }[]> = {
  corporate: [
    { id: "dashboard", label: "대시보드" },
    { id: "register", label: "수탁 등록" },
    { id: "deposit", label: "입금" },
    { id: "withdraw", label: "출금" },
  ],
  platform: [{ id: "approvals", label: "승인 대기" }, { id: "dashboard", label: "현황" }],
  operator: [
    { id: "wallet", label: "지갑 관리" },
    { id: "review", label: "출금 검토" },
    { id: "sign", label: "서명 대기" },
    { id: "dashboard", label: "현황" },
  ],
  approver: [{ id: "approvals", label: "승인 대기" }, { id: "history", label: "처리 내역" }],
  auditor: [{ id: "log", label: "이벤트 로그" }],
};

function CustodyWorkspace() {
  const [actor, setActor] = useState<CustodyActor>("corporate");
  const [nav, setNav] = useState<CustodyNavId>("dashboard");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [company, setCompany] = useState("대한자산운용 주식회사");
  const [businessNo, setBusinessNo] = useState("123-45-67890");
  const [managerA, setManagerA] = useState("이수민");
  const [managerB, setManagerB] = useState("최종원");
  const [custodyStatus, setCustodyStatus] = useState("작성 중");
  const [walletStatus, setWalletStatus] = useState("미생성");
  const [walletId, setWalletId] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [depositAmount, setDepositAmount] = useState("500,000 KRW");
  const [depositStatus, setDepositStatus] = useState("미등록");
  const [withdrawAmount, setWithdrawAmount] = useState("120,000 KRW");
  const [withdrawAddress, setWithdrawAddress] = useState("0x8a74...9f11");
  const [withdrawStatus, setWithdrawStatus] = useState("미등록");
  const [withdrawApprovals, setWithdrawApprovals] = useState(0);
  const [withdrawSignId, setWithdrawSignId] = useState("");

  const selectActor = (next: CustodyActor) => {
    setActor(next);
    setNav(custodyActorNav[next][0].id);
  };

  const requestCustody = () => {
    setCustodyStatus("플랫폼 승인 대기");
    pushEvent(setEvents, "수탁 등록 요청", `${company} · ${managerA}, ${managerB}`, "법인 사용자");
  };

  const approveCustody = () => {
    setCustodyStatus("승인 완료");
    pushEvent(setEvents, "수탁 등록 승인", company, "플랫폼 운영자");
  };

  const createWallet = () => {
    const nextWallet = `CST-WALLET-${1207 + events.length}`;
    const nextAddress = `0xC17d...${8140 + events.length}`;
    setWalletStatus("운영 가능");
    setWalletId(nextWallet);
    setWalletAddress(nextAddress);
    pushEvent(setEvents, "수탁 지갑 생성", `${nextWallet} · ${nextAddress}`, "수탁 운영자");
  };

  const requestDeposit = () => {
    setDepositStatus("승인 대기");
    pushEvent(setEvents, "입금 등록 요청", depositAmount, "법인 사용자");
  };

  const approveDeposit = () => {
    setDepositStatus("반영 완료");
    pushEvent(setEvents, "입금 승인 및 반영", depositAmount, "수탁 관리자");
  };

  const requestWithdraw = () => {
    setWithdrawStatus("운영 검토 대기");
    setWithdrawApprovals(0);
    setWithdrawSignId("");
    pushEvent(setEvents, "출금 요청", `${withdrawAmount} · ${withdrawAddress}`, "법인 사용자");
  };

  const verifyWithdraw = () => {
    setWithdrawStatus("승인 대기");
    pushEvent(setEvents, "화이트리스트 확인", withdrawAddress, "수탁 운영자");
  };

  const approveWithdraw = () => {
    const next = Math.min(withdrawApprovals + 1, 2);
    setWithdrawApprovals(next);
    setWithdrawStatus(next === 2 ? "서명 대기" : "승인 대기");
    pushEvent(setEvents, "출금 승인", `${next}/2 승인 완료`, "수탁 관리자");
  };

  const signWithdraw = () => {
    const nextSign = `SIGN-${1260 + events.length}`;
    setWithdrawSignId(nextSign);
    setWithdrawStatus("전송 완료");
    pushEvent(setEvents, "출금 서명 및 전송", `${withdrawAmount} · ${nextSign}`, "수탁 운영자");
  };

  const resetWithdraw = () => {
    setWithdrawStatus("미등록");
    setWithdrawApprovals(0);
    setWithdrawSignId("");
    pushEvent(setEvents, "출금 초기화", "새 요청 입력 가능", "법인 사용자");
  };

  const values: LiveValue[] = [
    { label: "수탁 등록", value: custodyStatus, detail: company, tone: toneForStatus(custodyStatus) },
    { label: "Wallet ID", value: walletId || "미생성", detail: walletAddress || "주소 대기", tone: toneForStatus(walletStatus) },
    { label: "입금", value: depositStatus, detail: depositAmount, tone: toneForStatus(depositStatus) },
    { label: "출금", value: withdrawStatus, detail: withdrawSignId || `${withdrawApprovals}/2 승인`, tone: toneForStatus(withdrawStatus) },
  ];

  const navItems = custodyActorNav[actor];
  const actorLabel = custodyRoles.find((r) => r.id === actor)?.label ?? "수탁";
  const pageTitle = navItems.find((n) => n.id === nav)?.label ?? "대시보드";
  let processView: ProcessView;

  // ── content ──────────────────────────────────────────────────────────────
  const content: ReactNode = (() => {
    if (nav === "dashboard") {
      return (
        <div className="space-y-4">
          <WCard title="현재 상태">
            {values.map((v) => <WRow key={v.label} label={v.label} value={v.value} tone={v.tone} />)}
          </WCard>
          {actor === "corporate" && (
            <WCard title="빠른 실행">
              <div className="flex flex-wrap gap-2">
                {custodyStatus === "작성 중" && <WBtn onClick={() => setNav("register")} tone="accent">수탁 등록 →</WBtn>}
                {walletStatus === "운영 가능" && depositStatus === "미등록" && <WBtn onClick={() => setNav("deposit")} tone="accent">입금 등록 →</WBtn>}
                {walletStatus === "운영 가능" && withdrawStatus === "미등록" && <WBtn onClick={() => setNav("withdraw")} tone="accent">출금 요청 →</WBtn>}
              </div>
            </WCard>
          )}
          <WCard title="최근 이벤트">
            {events.length === 0 ? <WEmpty text="아직 이벤트가 없습니다." /> : events.slice(0, 5).map((e) => (
              <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] py-2 last:border-0" key={e.id}>
                <div>
                  <div className="text-[12px] font-semibold text-[var(--ink)]">{e.title}</div>
                  <div className="text-[11px] text-[var(--ink-2)]">{e.actor} · {e.detail}</div>
                </div>
                <span className="shrink-0 font-mono text-[10px] text-[var(--muted)]">{e.id}</span>
              </div>
            ))}
          </WCard>
        </div>
      );
    }
    if (nav === "register" && actor === "corporate") {
      const canRequest = custodyStatus === "작성 중";
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-[13px] font-semibold text-[var(--ink)]">수탁 등록</div>
            <WPill tone={toneForStatus(custodyStatus)}>{custodyStatus}</WPill>
          </div>
          <WCard title="법인 정보">
            <div className="space-y-3">
              <WField label="법인명" value={company} onChange={canRequest ? setCompany : undefined} />
              <WField label="사업자 번호" value={businessNo} onChange={canRequest ? setBusinessNo : undefined} mono />
              <WField label="운영 참여자 1" value={managerA} onChange={canRequest ? setManagerA : undefined} />
              <WField label="운영 참여자 2" value={managerB} onChange={canRequest ? setManagerB : undefined} />
            </div>
          </WCard>
          {canRequest && <WBtn onClick={requestCustody} tone="accent">수탁 등록 요청 제출</WBtn>}
          {custodyStatus === "플랫폼 승인 대기" && <div className="rounded-lg bg-[var(--warn-soft)] p-3 text-[12px] text-[var(--warn)]">플랫폼 운영자의 승인을 기다리는 중입니다.</div>}
          {custodyStatus === "승인 완료" && <div className="rounded-lg bg-[var(--ok-soft)] p-3 text-[12px] text-[var(--ok)]">수탁 등록이 승인되었습니다. 입금/출금이 가능합니다.</div>}
        </div>
      );
    }
    if (nav === "deposit" && actor === "corporate") {
      const canRequest = walletStatus === "운영 가능" && depositStatus === "미등록";
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-[13px] font-semibold text-[var(--ink)]">입금 등록</div>
            <WPill tone={toneForStatus(depositStatus)}>{depositStatus}</WPill>
          </div>
          {walletStatus !== "운영 가능" ? <WEmpty text="수탁 지갑이 아직 생성되지 않았습니다." /> : (
            <>
              <WCard title="수탁 지갑 정보">
                <WRow label="Wallet ID" value={walletId} tone="ok" mono />
                <WRow label="주소" value={walletAddress} mono />
              </WCard>
              <WCard title="입금 요청">
                <WField label="입금 금액" value={depositAmount} onChange={canRequest ? setDepositAmount : undefined} />
                {canRequest && <div className="mt-3"><WBtn onClick={requestDeposit} tone="accent">입금 요청 제출</WBtn></div>}
              </WCard>
              {depositStatus === "승인 대기" && <div className="rounded-lg bg-[var(--warn-soft)] p-3 text-[12px] text-[var(--warn)]">수탁 관리자의 승인을 기다리는 중입니다.</div>}
              {depositStatus === "반영 완료" && <div className="rounded-lg bg-[var(--ok-soft)] p-3 text-[12px] text-[var(--ok)]">입금이 승인되어 잔액에 반영되었습니다.</div>}
            </>
          )}
        </div>
      );
    }
    if (nav === "withdraw" && actor === "corporate") {
      const canRequest = walletStatus === "운영 가능" && withdrawStatus === "미등록";
      const isComplete = withdrawStatus === "전송 완료";
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-[13px] font-semibold text-[var(--ink)]">출금 요청</div>
            <WPill tone={toneForStatus(withdrawStatus)}>{withdrawStatus}</WPill>
          </div>
          {walletStatus !== "운영 가능" ? <WEmpty text="수탁 지갑이 아직 생성되지 않았습니다." /> : (
            <>
              <WCard title="출금 정보">
                <div className="space-y-3">
                  <WField label="출금 금액" value={withdrawAmount} onChange={canRequest ? setWithdrawAmount : undefined} />
                  <WField label="목적지 주소" value={withdrawAddress} onChange={canRequest ? setWithdrawAddress : undefined} mono />
                  <WField label="Wallet ID" value={walletId} />
                </div>
                {canRequest && <div className="mt-3"><WBtn onClick={requestWithdraw} tone="accent">출금 요청 제출</WBtn></div>}
              </WCard>
              {!canRequest && !isComplete && (
                <WCard title="진행 상태">
                  <WRow label="운영 검토" value={withdrawStatus === "운영 검토 대기" ? "진행 중" : "완료"} tone={withdrawStatus === "운영 검토 대기" ? "warn" : "ok"} />
                  <WRow label={`관리자 승인 (${withdrawApprovals}/2)`} value={withdrawApprovals === 2 ? "완료" : "대기 중"} tone={withdrawApprovals === 2 ? "ok" : "warn"} />
                  <WRow label="서명 전송" value={isComplete ? "완료" : "대기 중"} tone={isComplete ? "ok" : "neutral"} />
                </WCard>
              )}
              {isComplete && (
                <>
                  <WCard title="전송 결과">
                    <WRow label="Sign ID" value={withdrawSignId} tone="accent" mono />
                    <WRow label="출금 금액" value={withdrawAmount} />
                    <WRow label="목적지" value={withdrawAddress} mono />
                  </WCard>
                  <WBtn onClick={resetWithdraw}>새 출금 요청</WBtn>
                </>
              )}
            </>
          )}
        </div>
      );
    }
    if (nav === "approvals" && actor === "platform") {
      return (
        <div className="space-y-4">
          <div className="text-[13px] font-semibold text-[var(--ink)]">승인 대기함</div>
          {custodyStatus === "플랫폼 승인 대기" ? (
            <WCard title="수탁 등록 승인 요청">
              <WRow label="법인명" value={company} tone="accent" />
              <WRow label="사업자 번호" value={businessNo} mono />
              <WRow label="운영 참여자 1" value={managerA} />
              <WRow label="운영 참여자 2" value={managerB} />
              <div className="mt-3 flex gap-2">
                <WBtn onClick={approveCustody} tone="accent">승인</WBtn>
                <WBtn disabled>반려</WBtn>
              </div>
            </WCard>
          ) : <WEmpty text="승인 대기 중인 건이 없습니다." />}
        </div>
      );
    }
    if (nav === "wallet" && actor === "operator") {
      const canCreate = custodyStatus === "승인 완료" && walletStatus !== "운영 가능";
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-[13px] font-semibold text-[var(--ink)]">지갑 관리</div>
            <WPill tone={toneForStatus(walletStatus)}>{walletStatus}</WPill>
          </div>
          {walletStatus === "운영 가능" ? (
            <WCard title="지갑 정보">
              <WRow label="Wallet ID" value={walletId} tone="ok" mono />
              <WRow label="주소" value={walletAddress} mono />
              <WRow label="법인명" value={company} />
              <WRow label="수탁 상태" value={custodyStatus} tone="ok" />
            </WCard>
          ) : canCreate ? (
            <WCard title="수탁 지갑 생성">
              <WRow label="법인명" value={company} tone="accent" />
              <WRow label="수탁 상태" value={custodyStatus} tone="ok" />
              <WRow label="운영 참여자" value={`${managerA}, ${managerB}`} />
              <div className="mt-3"><WBtn onClick={createWallet} tone="accent">수탁 지갑 생성</WBtn></div>
            </WCard>
          ) : <WEmpty text="수탁 등록 승인 후 지갑 생성이 가능합니다." />}
        </div>
      );
    }
    if (nav === "review" && actor === "operator") {
      return (
        <div className="space-y-4">
          <div className="text-[13px] font-semibold text-[var(--ink)]">출금 검토 대기</div>
          {withdrawStatus === "운영 검토 대기" ? (
            <WCard title="화이트리스트 검증">
              <WRow label="출금 금액" value={withdrawAmount} tone="accent" />
              <WRow label="목적지 주소" value={withdrawAddress} mono />
              <WRow label="법인명" value={company} />
              <div className="mt-3"><WBtn onClick={verifyWithdraw} tone="accent">화이트리스트 확인 완료</WBtn></div>
            </WCard>
          ) : <WEmpty text="출금 검토 대기 건이 없습니다." />}
        </div>
      );
    }
    if (nav === "sign" && actor === "operator") {
      return (
        <div className="space-y-4">
          <div className="text-[13px] font-semibold text-[var(--ink)]">서명 대기</div>
          {withdrawStatus === "서명 대기" ? (
            <WCard title="출금 서명">
              <WRow label="출금 금액" value={withdrawAmount} tone="accent" />
              <WRow label="목적지 주소" value={withdrawAddress} mono />
              <WRow label="관리자 승인" value={`${withdrawApprovals}/2 완료`} tone="ok" />
              <div className="mt-3"><WBtn onClick={signWithdraw} tone="accent">서명 및 전송 실행</WBtn></div>
            </WCard>
          ) : <WEmpty text="서명 대기 건이 없습니다." />}
        </div>
      );
    }
    if (nav === "approvals" && actor === "approver") {
      return (
        <div className="space-y-4">
          <div className="text-[13px] font-semibold text-[var(--ink)]">승인 대기함</div>
          {depositStatus === "승인 대기" && (
            <WCard title="입금 승인">
              <WRow label="법인명" value={company} tone="accent" />
              <WRow label="입금 금액" value={depositAmount} />
              <WRow label="Wallet ID" value={walletId} mono />
              <div className="mt-3 flex gap-2">
                <WBtn onClick={approveDeposit} tone="accent">입금 승인</WBtn>
                <WBtn disabled>반려</WBtn>
              </div>
            </WCard>
          )}
          {withdrawStatus === "승인 대기" && (
            <WCard title={`출금 승인 (${withdrawApprovals}/2)`}>
              <WRow label="출금 금액" value={withdrawAmount} tone="accent" />
              <WRow label="목적지 주소" value={withdrawAddress} mono />
              <WRow label="관리자 1" value={withdrawApprovals >= 1 ? "승인 완료" : "검토 중"} tone={withdrawApprovals >= 1 ? "ok" : "warn"} />
              <WRow label="관리자 2" value={withdrawApprovals >= 2 ? "승인 완료" : "대기 중"} tone={withdrawApprovals >= 2 ? "ok" : "neutral"} />
              {withdrawApprovals < 2 && <div className="mt-3 flex gap-2"><WBtn onClick={approveWithdraw} tone="accent">출금 승인</WBtn><WBtn disabled>반려</WBtn></div>}
            </WCard>
          )}
          {depositStatus !== "승인 대기" && withdrawStatus !== "승인 대기" && <WEmpty text="승인 대기 중인 건이 없습니다." />}
        </div>
      );
    }
    if (nav === "history" && actor === "approver") {
      const myEvents = events.filter((e) => e.actor === "수탁 관리자");
      return (
        <div className="space-y-3">
          <div className="text-[13px] font-semibold text-[var(--ink)]">처리 내역</div>
          {myEvents.length === 0 ? <WEmpty text="처리한 내역이 없습니다." /> : myEvents.map((e) => (
            <div className="rounded-md border border-[var(--line)] p-3" key={e.id}>
              <div className="flex items-center justify-between gap-2">
                <div className="text-[12px] font-semibold text-[var(--ink)]">{e.title}</div>
                <span className="font-mono text-[10px] text-[var(--muted)]">{e.id}</span>
              </div>
              <div className="mt-1 text-[11px] text-[var(--ink-2)]">{e.detail}</div>
            </div>
          ))}
        </div>
      );
    }
    if (nav === "log") {
      return (
        <div className="space-y-3">
          <div className="text-[13px] font-semibold text-[var(--ink)]">이벤트 로그</div>
          <WEventLog events={events} />
        </div>
      );
    }
    return <WCard title="상태">{values.map((v) => <WRow key={v.label} label={v.label} value={v.value} tone={v.tone} />)}</WCard>;
  })();

  // ── processView ───────────────────────────────────────────────────────────
  if (nav === "log") {
    processView = { kind: "audit", description: "모든 조작은 이벤트로 기록됩니다.", logs: eventLines(events), summary: values.map((v) => ({ label: v.label, value: v.value, tone: v.tone })) };
  } else if (nav === "approvals" && actor === "platform") {
    processView = {
      kind: "approval",
      description: "플랫폼 운영자가 수탁 등록 요청을 승인합니다.",
      approvers: [
        { name: "법인 사용자", role: "수탁 등록 요청", status: custodyStatus === "플랫폼 승인 대기" ? "approved" : "waiting", note: company },
        { name: "플랫폼 운영자", role: "승인", status: custodyStatus === "승인 완료" ? "approved" : "pending", note: custodyStatus },
      ],
    };
  } else if (nav === "approvals" && actor === "approver") {
    processView = {
      kind: "approval",
      description: "수탁 관리자가 입금/출금 요청을 처리합니다.",
      approvers: depositStatus === "승인 대기"
        ? [{ name: "법인 사용자", role: "입금 요청", status: "approved", note: depositAmount }, { name: "수탁 관리자", role: "입금 승인", status: "pending", note: depositStatus }]
        : [
            { name: "수탁 관리자 A", role: "출금 1차 승인", status: withdrawApprovals >= 1 ? "approved" : "pending", note: withdrawAmount },
            { name: "수탁 관리자 B", role: "출금 2차 승인", status: withdrawApprovals >= 2 ? "approved" : withdrawApprovals === 1 ? "pending" : "waiting", note: withdrawAddress },
          ],
    };
  } else if (nav === "wallet" || nav === "sign") {
    processView = {
      kind: "keygen",
      description: nav === "wallet" ? "수탁 운영자가 승인된 법인의 지갑을 생성합니다." : "2인 승인 완료 후 서명 및 전송을 실행합니다.",
      progress: nav === "sign" ? 75 : walletStatus === "운영 가능" ? 100 : 45,
      nodes: nav === "wallet"
        ? [{ label: "Wallet Service", value: "지갑 생성", tone: "accent" }, { label: "수탁 상태", value: custodyStatus, tone: toneForStatus(custodyStatus) }, { label: "Wallet ID", value: walletId || "대기 중", tone: walletId ? "ok" : "warn" }]
        : [{ label: "Wallet Service", value: "서명 생성", tone: "accent" }, { label: "승인 상태", value: `${withdrawApprovals}/2 완료`, tone: "ok" }, { label: "Sign ID", value: withdrawSignId || "대기 중", tone: withdrawSignId ? "ok" : "warn" }],
    };
  } else if (nav === "withdraw" && withdrawStatus === "전송 완료") {
    processView = { kind: "artifact", description: "출금 서명 및 전송이 완료되었습니다.", items: [{ label: "Sign ID", value: withdrawSignId, tone: "accent" }, { label: "출금 금액", value: withdrawAmount }, { label: "목적지", value: withdrawAddress }] };
  } else {
    processView = { kind: "overview", description: "좌측 콘솔에서 액터별 권한으로 자유롭게 조작하면 값과 이벤트가 즉시 반영됩니다.", cards: values.map((v) => ({ label: v.label, value: v.value, detail: v.detail, tone: v.tone })) };
  }

  const currentScreen = screen(`custody-${actor}-${nav}`, "dashboard", pageTitle, "", "", [{ title: "상태", fields: values.map((v) => field(v.label, v.value, v.tone)) }]);
  const stepView = step(`CUSTODY-${actor.toUpperCase()}`, pageTitle, currentScreen, processView);

  return (
    <ShellGrid
      left={
        <BrowserFrame actor={actorLabel} host="custody.zkwallet.io" pageTitle={pageTitle} navItems={navItems} activeNav={nav} onNavChange={(id) => setNav(id as CustodyNavId)}>
          {content}
        </BrowserFrame>
      }
      processView={processView}
      rail={<RoleRail current={actor} events={events} onSelect={selectActor} roles={custodyRoles} values={values} />}
      stepView={stepView}
    />
  );
}

type PersonalActor = "user" | "auditor";
type PersonalTab = "home" | "assets" | "send" | "activity" | "settings";
type PersonalFocus = "home" | "assets" | "send" | "confirm" | "signing" | "signed" | "activity" | "settings" | "audit";

const personalRoles: RoleOption<PersonalActor>[] = [
  { id: "user", label: "개인 사용자", detail: "앱 기능을 직접 조작" },
  { id: "auditor", label: "이력 조회", detail: "지갑 이벤트 조회" },
];

const personalTabs: { id: PersonalTab; label: string; icon: string }[] = [
  { id: "home", label: "홈", icon: "H" },
  { id: "assets", label: "자산", icon: "A" },
  { id: "send", label: "보내기", icon: "S" },
  { id: "activity", label: "활동", icon: "L" },
  { id: "settings", label: "설정", icon: "G" },
];

function MiniBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  const classes: Record<Tone, string> = {
    neutral: "bg-[var(--surface-2)] text-[var(--ink-2)]",
    accent: "bg-[var(--accent-soft)] text-[var(--accent)]",
    ok: "bg-[var(--ok-soft)] text-[var(--ok)]",
    warn: "bg-[var(--warn-soft)] text-[var(--warn)]",
    bad: "bg-[var(--bad-soft)] text-[var(--bad)]",
  };

  return <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-semibold ${classes[tone]}`}>{children}</span>;
}

function AppButton({
  children,
  disabled,
  onClick,
  tone = "neutral",
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
  tone?: Tone;
}) {
  const className =
    tone === "accent"
      ? "bg-[var(--accent)] text-white"
      : tone === "bad"
        ? "bg-[var(--bad)] text-white"
        : "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]";

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-[14px] px-3 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function AppField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-[var(--ink-2)]">{label}</span>
      <input
        className="h-12 w-full rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-3 font-mono text-[13px] text-[var(--ink)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}

function PhoneAppFrame({
  activeTab,
  actor,
  children,
  onTabSelect,
  status,
}: {
  activeTab: PersonalTab;
  actor: string;
  children: ReactNode;
  onTabSelect: (tab: PersonalTab) => void;
  status: string;
}) {
  return (
    <section className="flex flex-col items-center">
      <div className="mb-5 flex w-full max-w-[320px] items-center justify-between">
        <div>
          <div className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--ink-2)]">사용자 화면</div>
          <div className="mt-1 text-[15px] font-semibold text-[var(--ink)]">{actor}</div>
          <div className="mt-1 font-mono text-[11px] text-[var(--muted)]">{status}</div>
        </div>
        <div className="inline-flex h-6 items-center rounded-full bg-[var(--surface-2)] px-3 text-[11px] font-medium text-[var(--ink-2)]">
          app
        </div>
      </div>

      <div className="relative h-[624px] w-[292px] rounded-[56px] bg-[var(--bezel)] p-[11px] shadow-[0_2px_8px_rgba(0,0,0,0.08),0_20px_56px_rgba(0,0,0,0.18),inset_0_0_0_0.5px_rgba(255,255,255,0.06)]">
        <div className="absolute -left-[3.5px] top-[108px] h-[32px] w-[3.5px] rounded-l-[2px] bg-[var(--bezel)] brightness-75" />
        <div className="absolute -left-[3.5px] top-[156px] h-[60px] w-[3.5px] rounded-l-[2px] bg-[var(--bezel)] brightness-75" />
        <div className="absolute -left-[3.5px] top-[228px] h-[60px] w-[3.5px] rounded-l-[2px] bg-[var(--bezel)] brightness-75" />
        <div className="absolute -right-[3.5px] top-[172px] h-[80px] w-[3.5px] rounded-r-[2px] bg-[var(--bezel)] brightness-75" />

        <div className="relative flex h-full flex-col overflow-hidden rounded-[46px] bg-[var(--surface)]">
          <div className="absolute left-1/2 top-[10px] z-20 h-[28px] w-[92px] -translate-x-1/2 rounded-[20px] bg-black" />
          <div className="flex h-[44px] shrink-0 items-center justify-between px-6 pt-2 text-[12px] font-semibold text-[var(--ink)]">
            <span>9:41</span>
            <span>5G 100%</span>
          </div>
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--line)] px-5">
            <div>
              <div className="text-[14px] font-bold text-[var(--ink)]">zkWallet</div>
              <div className="font-mono text-[10px] text-[var(--muted)]">personal vault</div>
            </div>
            <MiniBadge tone="ok">Live</MiniBadge>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

          <div className="grid shrink-0 grid-cols-5 border-t border-[var(--line)] bg-[var(--surface)] px-1 py-1.5">
            {personalTabs.map((tab) => (
              <button
                className={`flex h-[50px] flex-col items-center justify-center gap-1 rounded-[14px] text-[10px] font-semibold ${
                  activeTab === tab.id ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--muted)]"
                }`}
                key={tab.id}
                onClick={() => onTabSelect(tab.id)}
                type="button"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current text-[10px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ActivityList({ events }: { events: EventItem[] }) {
  if (events.length === 0) {
    return <div className="rounded-[16px] border border-[var(--line)] p-4 text-center text-[13px] text-[var(--ink-2)]">아직 활동이 없습니다.</div>;
  }

  return (
    <div className="space-y-2">
      {events.slice(0, 8).map((event) => (
        <div className="rounded-[16px] border border-[var(--line)] bg-[var(--surface)] p-3" key={event.id}>
          <div className="flex items-center justify-between gap-2">
            <div className="text-[13px] font-semibold text-[var(--ink)]">{event.title}</div>
            <div className="font-mono text-[10px] text-[var(--muted)]">{event.id}</div>
          </div>
          <div className="mt-1 text-[11px] leading-[1.35] text-[var(--ink-2)]">
            {event.actor} · {event.detail}
          </div>
        </div>
      ))}
    </div>
  );
}

function PersonalWorkspace() {
  const [actor, setActor] = useState<PersonalActor>("user");
  const [activeTab, setActiveTab] = useState<PersonalTab>("home");
  const [focus, setFocus] = useState<PersonalFocus>("home");
  const [events, setEvents] = useState<EventItem[]>([
    { id: "EVT-1001", title: "지갑 동기화", detail: "최근 잔액과 활동을 불러왔습니다.", actor: "zkWallet App" },
  ]);
  const [walletStatus, setWalletStatus] = useState("사용 가능");
  const [address, setAddress] = useState("0x91f3...2200");
  const [balance, setBalance] = useState("1,250,000 KRW");
  const [shieldedBalance, setShieldedBalance] = useState("860,000 KRW");
  const [amount, setAmount] = useState("25,000 KRW");
  const [recipient, setRecipient] = useState("0x72bd...23a9");
  const [memo, setMemo] = useState("월렛 데모 송금");
  const [txStatus, setTxStatus] = useState("대기");
  const [signId, setSignId] = useState("");
  const [privacyMode, setPrivacyMode] = useState(true);

  const selectTab = (tab: PersonalTab) => {
    setActiveTab(tab);
    setFocus(tab);
  };

  const selectActor = (nextActor: PersonalActor) => {
    setActor(nextActor);
    if (nextActor === "auditor") {
      setActiveTab("activity");
      setFocus("audit");
    } else {
      setFocus(activeTab);
    }
  };

  const openSend = () => {
    setActor("user");
    setActiveTab("send");
    setFocus("send");
  };

  const syncDeposit = () => {
    setBalance("1,750,000 KRW");
    setShieldedBalance("1,060,000 KRW");
    setFocus("assets");
    pushEvent(setEvents, "입금 반영", "500,000 KRW · shielded balance updated", "Wallet Service");
  };

  const requestProof = () => {
    setFocus("assets");
    pushEvent(setEvents, "잔액 증명 생성", `${shieldedBalance} · disclosure minimized`, "개인 사용자");
  };

  const rotateKey = () => {
    if (walletStatus === "키 생성 중") {
      const nextAddress = `0x91f3...${2210 + events.length}`;
      setWalletStatus("사용 가능");
      setAddress(nextAddress);
      setFocus("settings");
      pushEvent(setEvents, "키 회전 완료", nextAddress, "Wallet Service");
      return;
    }

    setWalletStatus("키 생성 중");
    setFocus("settings");
    pushEvent(setEvents, "키 회전 시작", "사용자 기기에서 새 키 재생성", "개인 사용자");
  };

  const requestSign = () => {
    const nextSign = `SIGN-${1210 + events.length}`;
    setTxStatus("사용자 확인");
    setSignId(nextSign);
    setFocus("confirm");
    pushEvent(setEvents, "거래 서명 요청", `${amount} · ${recipient}`, "개인 사용자");
  };

  const confirmSign = () => {
    setTxStatus("서명 생성 중");
    setFocus("signing");
    pushEvent(setEvents, "사용자 확인 완료", `${signId} · biometric verified`, "개인 사용자");
  };

  const finishSign = () => {
    setTxStatus("서명 완료");
    setFocus("signed");
    pushEvent(setEvents, "서명 반환", `${signId} · raw signature ready`, "Wallet Service");
  };

  const resetTransaction = () => {
    setTxStatus("대기");
    setSignId("");
    setFocus("send");
    pushEvent(setEvents, "거래 입력 초기화", "보내기 화면에서 새 거래 입력 가능", "개인 사용자");
  };

  const togglePrivacy = () => {
    setPrivacyMode((value) => !value);
    setFocus("settings");
    pushEvent(setEvents, "프라이버시 모드 변경", privacyMode ? "비공개 전송 해제" : "비공개 전송 활성화", "개인 사용자");
  };

  const values: LiveValue[] = [
    { label: "지갑", value: walletStatus, detail: address, tone: toneForStatus(walletStatus) },
    { label: "총 잔액", value: balance, detail: `비공개 ${shieldedBalance}`, tone: "accent" },
    { label: "전송", value: txStatus, detail: signId || `${amount} · ${recipient}`, tone: toneForStatus(txStatus) },
    { label: "프라이버시", value: privacyMode ? "활성" : "해제", detail: "보내기 기본값", tone: privacyMode ? "ok" : "neutral" },
  ];

  const focusCopy: Record<PersonalFocus, { title: string; description: string; status: string }> = {
    home: {
      title: "지갑 홈",
      description: "앱 홈은 잔액, 주소, 빠른 기능을 보여주고 사용자가 원하는 기능으로 바로 이동합니다.",
      status: walletStatus,
    },
    assets: {
      title: "자산",
      description: "자산 화면에서 공개 잔액과 비공개 잔액, 증명 생성, 입금 반영을 확인합니다.",
      status: balance,
    },
    send: {
      title: "보내기",
      description: "사용자가 금액과 주소를 자유롭게 바꾼 뒤 서명 요청을 만들 수 있습니다.",
      status: txStatus,
    },
    confirm: {
      title: "거래 확인",
      description: "서명 요청 후에는 앱 안에서 금액, 목적지, Sign ID를 확인합니다.",
      status: txStatus,
    },
    signing: {
      title: "서명 생성",
      description: "사용자 확인이 끝나면 Wallet Service가 서명을 생성해 앱으로 돌려줍니다.",
      status: txStatus,
    },
    signed: {
      title: "서명 결과",
      description: "서명 결과가 생성되면 앱 활동 내역과 live values에 반영됩니다.",
      status: txStatus,
    },
    activity: {
      title: "활동",
      description: "앱에서 발생한 지갑 동기화, 입금, 증명, 서명 이벤트를 시간순으로 봅니다.",
      status: `${events.length} events`,
    },
    settings: {
      title: "설정",
      description: "사용자가 프라이버시 기본값과 키 회전을 직접 조작합니다.",
      status: walletStatus,
    },
    audit: {
      title: "감사 조회",
      description: "감사자는 사용자의 버튼을 대신 누르지 않고 이벤트와 결과만 조회합니다.",
      status: `${events.length} events`,
    },
  };

  const current = focusCopy[focus];

  const processView: ProcessView =
    focus === "audit" || focus === "activity"
      ? {
          kind: "audit",
          description: current.description,
          logs: eventLines(events),
          summary: values.map((item) => ({ label: item.label, value: item.value, tone: item.tone })),
        }
      : focus === "confirm"
        ? {
            kind: "approval",
            description: current.description,
            approvers: [
              { name: "개인 사용자", role: "앱 내 거래 확인", status: "pending", note: amount },
              { name: "Wallet Service", role: "확인 이후 서명 생성", status: "waiting", note: signId },
            ],
          }
        : focus === "signing" || walletStatus === "키 생성 중"
          ? {
              kind: "keygen",
              description: current.description,
              progress: focus === "signing" ? 72 : 54,
              nodes: [
                { label: "Wallet Address", value: address, tone: "ok" },
                { label: "Sign ID", value: signId || "대기", tone: signId ? "accent" : "neutral" },
                { label: "Wallet Service", value: focus === "signing" ? "서명 생성 중" : "키 회전 중", tone: "warn" },
              ],
            }
          : focus === "signed"
            ? {
                kind: "artifact",
                description: current.description,
                items: [
                  { label: "Sign ID", value: signId, tone: "accent" },
                  { label: "금액", value: amount },
                  { label: "목적지", value: recipient },
                ],
              }
            : {
                kind: "overview",
                description: current.description,
                cards: values.map((item) => ({ label: item.label, value: item.value, detail: item.detail, tone: item.tone })),
              };

  const currentScreen = screen(
    `personal-${focus}`,
    "dashboard",
    current.title,
    current.description,
    current.status,
    [{ title: "상태", fields: values.map((item) => field(item.label, item.value, item.tone)) }],
  );
  const stepView = step(`PERSONAL-${focus.toUpperCase()}`, current.title, currentScreen, processView);

  return (
    <ShellGrid
      left={
        <PhoneAppFrame
          activeTab={activeTab}
          actor={personalRoles.find((role) => role.id === actor)?.label ?? "개인 사용자"}
          onTabSelect={selectTab}
          status={current.status}
        >
          {activeTab === "home" && (
            <div className="space-y-4">
              <div className="rounded-[24px] bg-[var(--accent)] p-5 text-white shadow-[0_12px_30px_rgba(91,91,214,0.25)]">
                <div className="flex items-center justify-between">
                  <div className="text-[12px] font-semibold opacity-80">총 잔액</div>
                  <span className="rounded-full bg-white/15 px-2 py-1 text-[10px] font-semibold">{privacyMode ? "Private" : "Public"}</span>
                </div>
                <div className="mt-3 text-[25px] font-bold leading-tight">{balance}</div>
                <div className="mt-2 break-all font-mono text-[11px] opacity-80">{address}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <AppButton onClick={openSend} tone="accent">보내기</AppButton>
                <AppButton onClick={() => setFocus("assets")}>받기</AppButton>
                <AppButton onClick={requestProof}>잔액 증명</AppButton>
                <AppButton onClick={() => { setActiveTab("settings"); setFocus("settings"); }}>키 관리</AppButton>
              </div>

              <div>
                <div className="mb-2 text-[12px] font-semibold text-[var(--ink-2)]">자산</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-[16px] border border-[var(--line)] p-3">
                    <div>
                      <div className="text-[13px] font-semibold">KRW Stable</div>
                      <div className="text-[11px] text-[var(--muted)]">공개 잔액</div>
                    </div>
                    <div className="text-right font-mono text-[12px] font-semibold">{balance}</div>
                  </div>
                  <div className="flex items-center justify-between rounded-[16px] border border-[var(--line)] p-3">
                    <div>
                      <div className="text-[13px] font-semibold">Shielded KRW</div>
                      <div className="text-[11px] text-[var(--muted)]">비공개 잔액</div>
                    </div>
                    <div className="text-right font-mono text-[12px] font-semibold text-[var(--accent)]">{shieldedBalance}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "assets" && (
            <div className="space-y-4">
              <div>
                <div className="text-[22px] font-bold text-[var(--ink)]">자산</div>
                <div className="mt-1 text-[13px] text-[var(--ink-2)]">잔액과 증명 상태를 관리합니다.</div>
              </div>
              <div className="grid gap-2">
                {[
                  ["KRW Stable", balance, "공개 잔액"],
                  ["Shielded KRW", shieldedBalance, "비공개 잔액"],
                  ["Proof Credit", "3 active", "공유 가능한 증명"],
                ].map(([name, value, detail]) => (
                  <div className="rounded-[18px] border border-[var(--line)] p-4" key={name}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[14px] font-semibold">{name}</div>
                        <div className="mt-1 text-[11px] text-[var(--muted)]">{detail}</div>
                      </div>
                      <div className="font-mono text-[12px] font-semibold">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <AppButton onClick={syncDeposit} tone="accent">입금 반영</AppButton>
                <AppButton onClick={requestProof}>증명 생성</AppButton>
              </div>
            </div>
          )}

          {activeTab === "send" && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-[22px] font-bold text-[var(--ink)]">보내기</div>
                  <MiniBadge tone={toneForStatus(txStatus)}>{txStatus}</MiniBadge>
                </div>
                <div className="mt-1 text-[13px] text-[var(--ink-2)]">금액과 주소를 입력해 서명을 요청합니다.</div>
              </div>

              <div className="space-y-3">
                <AppField label="금액" onChange={setAmount} value={amount} />
                <AppField label="받는 주소" onChange={setRecipient} value={recipient} />
                <AppField label="메모" onChange={setMemo} value={memo} />
              </div>

              <div className="rounded-[16px] border border-[var(--line)] bg-[var(--surface-2)] p-3">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[var(--ink-2)]">Sign ID</span>
                  <span className="font-mono font-semibold">{signId || "요청 전"}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[12px]">
                  <span className="text-[var(--ink-2)]">비공개 전송</span>
                  <span className="font-semibold text-[var(--accent)]">{privacyMode ? "사용" : "미사용"}</span>
                </div>
              </div>

              {txStatus === "대기" && <AppButton onClick={requestSign} tone="accent">서명 요청</AppButton>}
              {txStatus === "사용자 확인" && <AppButton onClick={confirmSign} tone="accent">확인 후 서명</AppButton>}
              {txStatus === "서명 생성 중" && <AppButton onClick={finishSign} tone="accent">서명 완료</AppButton>}
              {txStatus === "서명 완료" && (
                <div className="grid grid-cols-2 gap-2">
                  <AppButton onClick={resetTransaction}>새 거래</AppButton>
                  <AppButton onClick={() => { setActiveTab("activity"); setFocus("activity"); }} tone="accent">활동 보기</AppButton>
                </div>
              )}
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-4">
              <div>
                <div className="text-[22px] font-bold text-[var(--ink)]">활동</div>
                <div className="mt-1 text-[13px] text-[var(--ink-2)]">앱 조작과 서비스 결과가 기록됩니다.</div>
              </div>
              <ActivityList events={events} />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-4">
              <div>
                <div className="text-[22px] font-bold text-[var(--ink)]">설정</div>
                <div className="mt-1 text-[13px] text-[var(--ink-2)]">키와 프라이버시 기본값을 관리합니다.</div>
              </div>

              <div className="rounded-[18px] border border-[var(--line)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[14px] font-semibold">프라이버시 모드</div>
                    <div className="mt-1 text-[11px] text-[var(--muted)]">보내기 기본값</div>
                  </div>
                  <button
                    className={`h-8 w-14 rounded-full p-1 transition ${privacyMode ? "bg-[var(--accent)]" : "bg-[var(--line)]"}`}
                    onClick={togglePrivacy}
                    type="button"
                  >
                    <span className={`block h-6 w-6 rounded-full bg-white transition ${privacyMode ? "translate-x-6" : ""}`} />
                  </button>
                </div>
              </div>

              <div className="rounded-[18px] border border-[var(--line)] p-4">
                <div className="text-[14px] font-semibold">지갑 키</div>
                <div className="mt-2 break-all font-mono text-[12px] text-[var(--ink-2)]">{address}</div>
                <div className="mt-3">
                  <AppButton onClick={rotateKey} tone={walletStatus === "키 생성 중" ? "accent" : "neutral"}>
                    {walletStatus === "키 생성 중" ? "키 회전 완료" : "키 회전 시작"}
                  </AppButton>
                </div>
              </div>
            </div>
          )}
        </PhoneAppFrame>
      }
      processView={processView}
      rail={<RoleRail current={actor} events={events} onSelect={selectActor} roles={personalRoles} values={values} />}
      stepView={stepView}
    />
  );
}

type IssuerActor = "issuerAdmin" | "compliance" | "risk" | "platform" | "auditor";

const issuerRoles: RoleOption<IssuerActor>[] = [
  { id: "issuerAdmin", label: "발행사 관리자", detail: "등록, 발행, 소각, 준비금 요청" },
  { id: "compliance", label: "준법감시인", detail: "발행/소각 1차 승인" },
  { id: "risk", label: "리스크 승인자", detail: "발행/소각 2차 승인" },
  { id: "platform", label: "플랫폼 운영자", detail: "발행사 등록과 준비금 승인" },
  { id: "auditor", label: "감사자", detail: "발행 업무 이력 조회" },
];

function IssuerWorkspace() {
  const [actor, setActor] = useState<IssuerActor>("issuerAdmin");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [issuerName, setIssuerName] = useState("KFIN Corp.");
  const [issuerStatus, setIssuerStatus] = useState("등록 전");
  const [issueAmount, setIssueAmount] = useState("1,000,000 KRW");
  const [burnAmount, setBurnAmount] = useState("100,000 KRW");
  const [mintStatus, setMintStatus] = useState("미등록");
  const [burnStatus, setBurnStatus] = useState("미등록");
  const [reserveStatus, setReserveStatus] = useState("미등록");
  const [mintApprovals, setMintApprovals] = useState(0);
  const [burnApprovals, setBurnApprovals] = useState(0);

  const requestIssuer = () => {
    setIssuerStatus("플랫폼 승인 대기");
    pushEvent(setEvents, "발행사 등록 요청", issuerName, "발행사 관리자");
    setActor("platform");
  };

  const approveIssuer = () => {
    setIssuerStatus("운영 가능");
    pushEvent(setEvents, "발행사 등록 승인", issuerName, "플랫폼 운영자");
    setActor("issuerAdmin");
  };

  const requestMint = () => {
    setMintStatus("1차 승인 대기");
    setMintApprovals(0);
    pushEvent(setEvents, "발행 요청", issueAmount, "발행사 관리자");
    setActor("compliance");
  };

  const requestBurn = () => {
    setBurnStatus("1차 승인 대기");
    setBurnApprovals(0);
    pushEvent(setEvents, "소각 요청", burnAmount, "발행사 관리자");
    setActor("compliance");
  };

  const approveMint = (eventActor: string) => {
    const next = mintApprovals + 1;
    setMintApprovals(next);
    setMintStatus(next === 1 ? "2차 승인 대기" : "서명 대기");
    pushEvent(setEvents, "발행 승인", `${next}/2`, eventActor);
    setActor(next === 1 ? "risk" : "issuerAdmin");
  };

  const approveBurn = (eventActor: string) => {
    const next = burnApprovals + 1;
    setBurnApprovals(next);
    setBurnStatus(next === 1 ? "2차 승인 대기" : "서명 대기");
    pushEvent(setEvents, "소각 승인", `${next}/2`, eventActor);
    setActor(next === 1 ? "risk" : "issuerAdmin");
  };

  const executeMint = () => {
    setMintStatus("발행 완료");
    pushEvent(setEvents, "발행 실행", issueAmount, "Wallet Service");
  };

  const executeBurn = () => {
    setBurnStatus("소각 완료");
    pushEvent(setEvents, "소각 실행", burnAmount, "Wallet Service");
  };

  const requestReserve = () => {
    setReserveStatus("플랫폼 승인 대기");
    pushEvent(setEvents, "준비금 유동성 요청", "출금 계좌 확인", "발행사 관리자");
    setActor("platform");
  };

  const approveReserve = () => {
    setReserveStatus("처리 완료");
    pushEvent(setEvents, "준비금 처리 완료", "원화계좌 처리 기록", "플랫폼 운영자");
    setActor("issuerAdmin");
  };

  const onFieldChange = (_screenId: string, label: string, value: string) => {
    if (label === "발행사명") setIssuerName(value);
    if (label === "발행 수량") setIssueAmount(value);
    if (label === "소각 수량") setBurnAmount(value);
  };

  const values: LiveValue[] = [
    { label: "발행사", value: issuerStatus, detail: issuerName, tone: toneForStatus(issuerStatus) },
    { label: "발행", value: mintStatus, detail: `${issueAmount} · ${mintApprovals}/2`, tone: toneForStatus(mintStatus) },
    { label: "소각", value: burnStatus, detail: `${burnAmount} · ${burnApprovals}/2`, tone: toneForStatus(burnStatus) },
    { label: "준비금", value: reserveStatus, detail: "유동성 요청", tone: toneForStatus(reserveStatus) },
  ];

  let scenarioId: ScenarioId = "IS-1";
  let active: ActiveAction | undefined;
  let currentScreen: UserScreen;
  let processView: ProcessView;

  if (actor === "issuerAdmin") {
    if (issuerStatus === "등록 전") {
      active = { label: "발행사 등록 요청", run: requestIssuer };
      currentScreen = screen(
        "issuer-register",
        "form",
        "발행사 등록",
        "발행사가 플랫폼에 등록 요청을 보냅니다.",
        issuerStatus,
        [{ title: "발행사 정보", fields: [field("발행사명", issuerName), field("프로그램", "KRW 스테이블코인", "accent")] }],
        action(active.label),
      );
    } else if (issuerStatus === "운영 가능" && mintStatus === "미등록") {
      scenarioId = "FS-2";
      active = { label: "발행 요청", run: requestMint };
      currentScreen = screen(
        "issuer-mint-request",
        "form",
        "발행 요청",
        "발행 수량을 입력하면 2단계 승인으로 넘어갑니다.",
        mintStatus,
        [{ title: "발행 입력", fields: [field("발행 수량", issueAmount), field("발행사 상태", issuerStatus, "ok")] }],
        action(active.label),
      );
    } else if (mintStatus === "서명 대기") {
      scenarioId = "FS-2";
      active = { label: "발행 실행", run: executeMint };
      currentScreen = screen(
        "issuer-mint-execute",
        "processing",
        "발행 실행",
        "2단계 승인 완료 후 Wallet Service가 발행 처리를 실행합니다.",
        mintStatus,
        [{ title: "발행 상태", fields: [field("승인 상태", `${mintApprovals}/2 완료`, "ok"), field("발행 수량", issueAmount)] }],
        action(active.label),
      );
    } else if (mintStatus === "발행 완료" && burnStatus === "미등록") {
      scenarioId = "FS-3";
      active = { label: "소각 요청", run: requestBurn };
      currentScreen = screen(
        "issuer-burn-request",
        "form",
        "소각 요청",
        "소각 수량을 입력하면 2단계 승인으로 넘어갑니다.",
        burnStatus,
        [{ title: "소각 입력", fields: [field("소각 수량", burnAmount), field("발행 완료 수량", issueAmount, "ok")] }],
        action(active.label),
      );
    } else if (burnStatus === "서명 대기") {
      scenarioId = "FS-3";
      active = { label: "소각 실행", run: executeBurn };
      currentScreen = screen(
        "issuer-burn-execute",
        "processing",
        "소각 실행",
        "2단계 승인 완료 후 Wallet Service가 소각 처리를 실행합니다.",
        burnStatus,
        [{ title: "소각 상태", fields: [field("승인 상태", `${burnApprovals}/2 완료`, "ok"), field("소각 수량", burnAmount)] }],
        action(active.label),
      );
    } else if (burnStatus === "소각 완료" && reserveStatus === "미등록") {
      scenarioId = "FS-4";
      active = { label: "준비금 요청", run: requestReserve };
      currentScreen = screen(
        "issuer-reserve-request",
        "form",
        "준비금 요청",
        "발행사는 준비금 유동성 처리를 플랫폼에 요청합니다.",
        reserveStatus,
        [{ title: "준비금", fields: [field("요청 사유", "유동성 정산"), field("발행사명", issuerName)] }],
        action(active.label),
      );
    } else {
      currentScreen = screen(
        "issuer-dashboard",
        "dashboard",
        "발행사 현황",
        "발행, 소각, 준비금 처리 상태를 확인합니다.",
        issuerStatus,
        [{ title: "상태", fields: values.map((item) => field(item.label, item.value, item.tone)) }],
      );
    }
  } else if (actor === "platform") {
    if (issuerStatus === "플랫폼 승인 대기") {
      active = { label: "발행사 등록 승인", run: approveIssuer };
      currentScreen = screen(
        "issuer-platform-register",
        "approval",
        "발행사 등록 승인",
        "플랫폼 운영자는 발행사의 등록 요청을 승인합니다.",
        issuerStatus,
        [{ title: "승인 상태", fields: [field("발행사 요청", "제출 완료", "ok"), field("플랫폼 승인", "검토 중", "warn"), field("발행사명", issuerName, "accent")] }],
        action(active.label),
      );
    } else if (reserveStatus === "플랫폼 승인 대기") {
      scenarioId = "FS-4";
      active = { label: "준비금 승인", run: approveReserve };
      currentScreen = screen(
        "issuer-platform-reserve",
        "approval",
        "준비금 승인",
        "플랫폼 운영자는 준비금 유동성 처리 요청을 승인합니다.",
        reserveStatus,
        [{ title: "승인 상태", fields: [field("발행사 요청", "접수 완료", "ok"), field("플랫폼 승인", "검토 중", "warn"), field("요청 사유", "유동성 정산", "accent")] }],
        action(active.label),
      );
    } else {
      currentScreen = screen(
        "issuer-platform-dashboard",
        "dashboard",
        "플랫폼 승인함",
        "발행사 등록과 준비금 승인 대기 건을 확인합니다.",
        "대기 없음",
        [{ title: "승인함", fields: [field("발행사", issuerStatus, toneForStatus(issuerStatus)), field("준비금", reserveStatus, toneForStatus(reserveStatus))] }],
      );
    }
  } else if (actor === "compliance") {
    if (mintStatus === "1차 승인 대기") {
      scenarioId = "FS-2";
      active = { label: "발행 1차 승인", run: () => approveMint("준법감시인") };
      currentScreen = screen(
        "issuer-compliance-mint",
        "approval",
        "발행 1차 승인",
        "준법감시인이 발행 요청의 1차 승인을 처리합니다.",
        mintStatus,
        [{ title: "승인 상태", fields: [field("발행 요청", "접수 완료", "ok"), field("준법감시인", "검토 중", "warn"), field("발행 수량", issueAmount, "accent")] }],
        action(active.label),
      );
    } else if (burnStatus === "1차 승인 대기") {
      scenarioId = "FS-3";
      active = { label: "소각 1차 승인", run: () => approveBurn("준법감시인") };
      currentScreen = screen(
        "issuer-compliance-burn",
        "approval",
        "소각 1차 승인",
        "준법감시인이 소각 요청의 1차 승인을 처리합니다.",
        burnStatus,
        [{ title: "승인 상태", fields: [field("소각 요청", "접수 완료", "ok"), field("준법감시인", "검토 중", "warn"), field("소각 수량", burnAmount, "accent")] }],
        action(active.label),
      );
    } else {
      currentScreen = screen(
        "issuer-compliance-dashboard",
        "dashboard",
        "1차 승인함",
        "준법감시인 승인 대기 건을 확인합니다.",
        "대기 없음",
        [{ title: "승인 현황", fields: [field("발행", mintStatus, toneForStatus(mintStatus)), field("소각", burnStatus, toneForStatus(burnStatus))] }],
      );
    }
  } else if (actor === "risk") {
    if (mintStatus === "2차 승인 대기") {
      scenarioId = "FS-2";
      active = { label: "발행 2차 승인", run: () => approveMint("리스크 승인자") };
      currentScreen = screen(
        "issuer-risk-mint",
        "approval",
        "발행 2차 승인",
        "리스크 승인자가 2차 승인을 완료하면 발행 실행 대기로 이동합니다.",
        mintStatus,
        [{ title: "승인 상태", fields: [field("준법감시인", "승인 완료", "ok"), field("리스크 승인자", "검토 중", "warn"), field("발행 수량", issueAmount, "accent")] }],
        action(active.label),
      );
    } else if (burnStatus === "2차 승인 대기") {
      scenarioId = "FS-3";
      active = { label: "소각 2차 승인", run: () => approveBurn("리스크 승인자") };
      currentScreen = screen(
        "issuer-risk-burn",
        "approval",
        "소각 2차 승인",
        "리스크 승인자가 2차 승인을 완료하면 소각 실행 대기로 이동합니다.",
        burnStatus,
        [{ title: "승인 상태", fields: [field("준법감시인", "승인 완료", "ok"), field("리스크 승인자", "검토 중", "warn"), field("소각 수량", burnAmount, "accent")] }],
        action(active.label),
      );
    } else {
      currentScreen = screen(
        "issuer-risk-dashboard",
        "dashboard",
        "2차 승인함",
        "리스크 승인 대기 건을 확인합니다.",
        "대기 없음",
        [{ title: "승인 현황", fields: [field("발행", mintStatus, toneForStatus(mintStatus)), field("소각", burnStatus, toneForStatus(burnStatus))] }],
      );
    }
  } else {
    currentScreen = screen(
      "issuer-audit-dashboard",
      "dashboard",
      "감사 조회",
      "발행사 등록, 발행, 소각, 준비금 처리 이력을 조회합니다.",
      `${events.length} events`,
      [{ title: "감사 요약", fields: values.map((item) => field(item.label, item.value, item.tone)) }],
    );
  }

  if (actor === "auditor") {
    processView = {
      kind: "audit",
      description: "감사자는 발행 업무를 수행하지 않고 요청과 승인 이벤트만 조회합니다.",
      logs: eventLines(events),
      summary: values.map((item) => ({ label: item.label, value: item.value, tone: item.tone })),
    };
  } else if (currentScreen.layout === "approval") {
    const isMint = currentScreen.id.includes("mint");
    const approvalCount = isMint ? mintApprovals : burnApprovals;
    processView = {
      kind: "approval",
      description: currentScreen.subtitle,
      approvers: currentScreen.id.includes("register") || currentScreen.id.includes("reserve")
        ? [
            { name: "발행사 관리자", role: "요청 제출", status: "approved", note: issuerName },
            { name: "플랫폼 운영자", role: currentScreen.title, status: "pending", note: currentScreen.status },
          ]
        : [
            { name: "준법감시인", role: "1차 승인", status: approvalCount >= 1 ? "approved" : "pending", note: isMint ? issueAmount : burnAmount },
            { name: "리스크 승인자", role: "2차 승인", status: approvalCount >= 2 ? "approved" : approvalCount === 1 ? "pending" : "waiting", note: "2-of-2 정책" },
          ],
    };
  } else if (currentScreen.layout === "processing") {
    processView = {
      kind: "keygen",
      description: currentScreen.subtitle,
      progress: 78,
      nodes: [
        { label: "Wallet Service", value: currentScreen.title, tone: "accent" },
        { label: "승인 정책", value: "2-of-2 완료", tone: "ok" },
        { label: "처리 금액", value: currentScreen.id.includes("mint") ? issueAmount : burnAmount },
      ],
    };
  } else {
    processView = {
      kind: "overview",
      description: "좌측 웹 콘솔에서 발행사, 승인자, 플랫폼 운영자를 바꾸며 실제 업무 흐름을 조작합니다.",
      cards: values.map((item) => ({ label: item.label, value: item.value, detail: item.detail, tone: item.tone })),
    };
  }

  const stepView = step(`ISSUER-${actor.toUpperCase()}`, currentScreen.title, currentScreen, processView);

  return (
    <ShellGrid
      left={
        <WebContainer
          actor={issuerRoles.find((role) => role.id === actor)?.label ?? "발행사"}
          activeActionLabel={active?.label}
          canAdvance={Boolean(active)}
          onAdvance={active?.run}
          onFieldChange={onFieldChange}
          scenarioId={scenarioId}
          screen={currentScreen}
          stepIndicator={currentScreen.status}
        />
      }
      processView={processView}
      rail={<RoleRail current={actor} events={events} onSelect={setActor} roles={issuerRoles} values={values} />}
      stepView={stepView}
    />
  );
}

type PlatformActor = "platformAdmin" | "roleAdmin" | "auditor";

const platformRoles: RoleOption<PlatformActor>[] = [
  { id: "platformAdmin", label: "플랫폼 운영자", detail: "Tenant, 프로그램, 운영 주체 연결" },
  { id: "roleAdmin", label: "권한 관리자", detail: "승인자와 정책 활성화" },
  { id: "auditor", label: "감사자", detail: "설정 변경 이력 조회" },
];

function PlatformWorkspace() {
  const [actor, setActor] = useState<PlatformActor>("platformAdmin");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [tenantName, setTenantName] = useState("KFIN Tenant");
  const [programName, setProgramName] = useState("KRW 스테이블코인");
  const [tenantStatus, setTenantStatus] = useState("미생성");
  const [programStatus, setProgramStatus] = useState("미생성");
  const [issuerConnected, setIssuerConnected] = useState(false);
  const [custodyConnected, setCustodyConnected] = useState(false);
  const [policyStatus, setPolicyStatus] = useState("미설정");

  const createTenant = () => {
    setTenantStatus("활성");
    pushEvent(setEvents, "Tenant 생성", tenantName, "플랫폼 운영자");
  };

  const createProgram = () => {
    setProgramStatus("활성");
    pushEvent(setEvents, "프로그램 생성", programName, "플랫폼 운영자");
  };

  const connectActors = () => {
    setIssuerConnected(true);
    setCustodyConnected(true);
    pushEvent(setEvents, "운영 주체 연결", "발행사 · 수탁 운영자", "플랫폼 운영자");
    setActor("roleAdmin");
  };

  const configurePolicy = () => {
    setPolicyStatus("2-of-2 활성");
    pushEvent(setEvents, "승인 정책 활성화", "준법감시인 + 리스크 승인자", "권한 관리자");
  };

  const onFieldChange = (_screenId: string, label: string, value: string) => {
    if (label === "Tenant 이름") setTenantName(value);
    if (label === "프로그램명") setProgramName(value);
  };

  const values: LiveValue[] = [
    { label: "Tenant", value: tenantStatus, detail: tenantName, tone: toneForStatus(tenantStatus) },
    { label: "Program", value: programStatus, detail: programName, tone: toneForStatus(programStatus) },
    { label: "발행사 연결", value: issuerConnected ? "연결됨" : "대기", tone: issuerConnected ? "ok" : "warn" },
    { label: "수탁 연결", value: custodyConnected ? "연결됨" : "대기", tone: custodyConnected ? "ok" : "warn" },
    { label: "승인 정책", value: policyStatus, detail: "민감 요청 2-of-2", tone: toneForStatus(policyStatus) },
  ];

  let active: ActiveAction | undefined;
  let currentScreen: UserScreen;
  let processView: ProcessView;

  if (actor === "platformAdmin") {
    if (tenantStatus !== "활성") {
      active = { label: "Tenant 생성", run: createTenant };
      currentScreen = screen(
        "platform-tenant",
        "form",
        "Tenant 생성",
        "플랫폼 운영자가 금융기관 Tenant를 생성합니다.",
        tenantStatus,
        [{ title: "Tenant", fields: [field("Tenant 이름", tenantName), field("운영 리전", "ap-northeast-2", "accent")] }],
        action(active.label),
      );
    } else if (programStatus !== "활성") {
      active = { label: "프로그램 생성", run: createProgram };
      currentScreen = screen(
        "platform-program",
        "form",
        "프로그램 생성",
        "Tenant 안에 발행/수탁 프로그램을 생성합니다.",
        programStatus,
        [{ title: "Program", fields: [field("프로그램명", programName), field("Tenant 상태", tenantStatus, "ok")] }],
        action(active.label),
      );
    } else if (!issuerConnected || !custodyConnected) {
      active = { label: "발행사/수탁 연결", run: connectActors };
      currentScreen = screen(
        "platform-actors",
        "dashboard",
        "운영 주체 연결",
        "발행사와 수탁 운영자를 프로그램에 연결합니다.",
        "연결 대기",
        [{ title: "연결 상태", fields: [field("발행사 연결", issuerConnected ? "연결됨" : "대기", issuerConnected ? "ok" : "warn"), field("수탁 운영자 연결", custodyConnected ? "연결됨" : "대기", custodyConnected ? "ok" : "warn")] }],
        action(active.label),
      );
    } else {
      currentScreen = screen(
        "platform-dashboard",
        "dashboard",
        "플랫폼 현황",
        "Tenant와 프로그램 연결 상태를 확인합니다.",
        "활성",
        [{ title: "상태", fields: values.map((item) => field(item.label, item.value, item.tone)) }],
      );
    }
  } else if (actor === "roleAdmin") {
    if (issuerConnected && custodyConnected && policyStatus !== "2-of-2 활성") {
      active = { label: "승인 정책 활성화", run: configurePolicy };
      currentScreen = screen(
        "platform-policy",
        "approval",
        "승인 정책 설정",
        "권한 관리자가 민감 요청에 적용할 2-of-2 승인 정책을 활성화합니다.",
        policyStatus,
        [{ title: "정책", fields: [field("준법감시인", "1차 승인자", "ok"), field("리스크 승인자", "2차 승인자", "warn"), field("정책", "2-of-2", "accent")] }],
        action(active.label),
      );
    } else {
      currentScreen = screen(
        "platform-role-dashboard",
        "dashboard",
        "권한 정책",
        "승인자와 정책 상태를 확인합니다.",
        policyStatus,
        [{ title: "권한", fields: [field("준법감시인", "1차 승인자", "ok"), field("리스크 승인자", "2차 승인자", "ok"), field("승인 정책", policyStatus, toneForStatus(policyStatus))] }],
      );
    }
  } else {
    currentScreen = screen(
      "platform-audit-dashboard",
      "dashboard",
      "감사 조회",
      "플랫폼 설정 변경 이력을 조회합니다.",
      `${events.length} events`,
      [{ title: "감사 요약", fields: values.map((item) => field(item.label, item.value, item.tone)) }],
    );
  }

  if (actor === "auditor") {
    processView = {
      kind: "audit",
      description: "플랫폼 설정 변경은 이벤트로 남고 감사자는 조회만 수행합니다.",
      logs: eventLines(events),
      summary: values.map((item) => ({ label: item.label, value: item.value, tone: item.tone })),
    };
  } else if (currentScreen.layout === "approval") {
    processView = {
      kind: "approval",
      description: currentScreen.subtitle,
      approvers: [
        { name: "플랫폼 운영자", role: "운영 주체 연결", status: issuerConnected && custodyConnected ? "approved" : "waiting", note: "발행사 + 수탁 운영자" },
        { name: "권한 관리자", role: "승인 정책 활성화", status: policyStatus === "2-of-2 활성" ? "approved" : "pending", note: "준법감시인 + 리스크 승인자" },
      ],
    };
  } else {
    processView = {
      kind: "overview",
      description: "좌측 웹 콘솔에서 플랫폼 설정을 조작하면 Tenant, 프로그램, 액터 연결, 승인 정책 값이 바뀝니다.",
      cards: values.map((item) => ({ label: item.label, value: item.value, detail: item.detail, tone: item.tone })),
    };
  }

  const stepView = step(`PLATFORM-${actor.toUpperCase()}`, currentScreen.title, currentScreen, processView);

  return (
    <ShellGrid
      left={
        <WebContainer
          actor={platformRoles.find((role) => role.id === actor)?.label ?? "플랫폼"}
          activeActionLabel={active?.label}
          canAdvance={Boolean(active)}
          onAdvance={active?.run}
          onFieldChange={onFieldChange}
          scenarioId="PO-1"
          screen={currentScreen}
          stepIndicator={currentScreen.status}
        />
      }
      processView={processView}
      rail={<RoleRail current={actor} events={events} onSelect={setActor} roles={platformRoles} values={values} />}
      stepView={stepView}
    />
  );
}

export function ModePage({ mode }: Props) {
  const meta = modeMeta[mode];

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--ink-2)]">{meta.eyebrow}</div>
          <h1 className="mt-2 text-[28px] font-semibold leading-tight text-[var(--ink)]">{meta.title}</h1>
          <p className="mt-2 max-w-[760px] text-[14px] leading-[1.55] text-[var(--ink-2)]">{meta.summary}</p>
        </div>
        <div className="inline-flex h-7 items-center rounded-full bg-[var(--accent-soft)] px-3 text-[12px] font-semibold text-[var(--accent)]">
          직접 조작 데모
        </div>
      </div>

      {mode === "personal" && <PersonalWorkspace />}
      {mode === "custody" && <CustodyWorkspace />}
      {mode === "issuer" && <IssuerWorkspace />}
      {mode === "platform" && <PlatformWorkspace />}
    </section>
  );
}
