import { useState } from "react";
import type { ReactNode } from "react";
import type { ScenarioMode } from "@/scenarios/types";

type Props = {
  mode: ScenarioMode;
};

type EventItem = {
  id: string;
  title: string;
  detail: string;
};

type StatusTone = "neutral" | "ok" | "warn" | "accent";

const modeMeta: Record<ScenarioMode, { title: string; surface: "web" | "mobile"; host: string }> = {
  personal: { title: "개인 지갑", surface: "mobile", host: "app.zkwallet.io" },
  custody: { title: "수탁", surface: "web", host: "custody.zkwallet.io" },
  issuer: { title: "발행사", surface: "web", host: "issuer.zkwallet.io" },
  platform: { title: "플랫폼", surface: "web", host: "platform.zkwallet.io" },
};

function makeEventId(index: number) {
  return `EVT-${String(1001 + index).padStart(4, "0")}`;
}

function StatusBadge({ children, tone = "neutral" }: { children: string; tone?: StatusTone }) {
  const colors: Record<StatusTone, string> = {
    neutral: "bg-[var(--surface-2)] text-[var(--ink-2)]",
    ok: "bg-[var(--ok-soft)] text-[var(--ok)]",
    warn: "bg-[var(--warn-soft)] text-[var(--warn)]",
    accent: "bg-[var(--accent-soft)] text-[var(--accent)]",
  };

  return <span className={`inline-flex h-6 items-center rounded px-2 text-[11px] font-semibold ${colors[tone]}`}>{children}</span>;
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-[var(--ink-2)]">{label}</span>
      <input
        className="h-10 w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 text-[13px] text-[var(--ink)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}

function ActionButton({
  children,
  disabled,
  onClick,
  variant = "primary",
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      className={`h-10 rounded-md px-3 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
        variant === "primary"
          ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
          : "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-2)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
      }`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
      <div className="text-[12px] text-[var(--ink-2)]">{label}</div>
      <div className="mt-2 break-all font-mono text-[17px] font-semibold text-[var(--ink)]">{value}</div>
      {detail && <div className="mt-2 text-[12px] leading-[1.45] text-[var(--muted)]">{detail}</div>}
    </div>
  );
}

function StateBoard({
  events,
  metrics,
  title,
}: {
  events: EventItem[];
  metrics: { label: string; value: string; detail?: string }[];
  title: string;
}) {
  return (
    <aside className="space-y-4">
      <div>
        <div className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--ink-2)]">상태 보드</div>
        <div className="mt-1 text-[18px] font-semibold text-[var(--ink)]">{title}</div>
      </div>

      <div className="grid gap-2">
        {metrics.map((metric) => (
          <MetricCard detail={metric.detail} key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </div>

      <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
        <div className="mb-3 text-[13px] font-semibold">이벤트</div>
        <div className="space-y-2">
          {events.length === 0 ? (
            <div className="rounded-md bg-[var(--surface-2)] px-3 py-3 text-[12px] text-[var(--ink-2)]">아직 이벤트가 없습니다.</div>
          ) : (
            events.map((event) => (
              <div className="rounded-md bg-[var(--surface-2)] px-3 py-2" key={event.id}>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[12px] font-semibold">{event.title}</div>
                  <div className="font-mono text-[10px] text-[var(--muted)]">{event.id}</div>
                </div>
                <div className="mt-1 text-[11px] leading-[1.35] text-[var(--ink-2)]">{event.detail}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}

function BrowserFrame({
  children,
  host,
  menu,
  page,
  setPage,
}: {
  children: ReactNode;
  host: string;
  menu: string[];
  page: string;
  setPage: (page: string) => void;
}) {
  return (
    <section className="min-w-0">
      <div className="mb-4">
        <div className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--ink-2)]">사용자 화면</div>
        <div className="mt-1 text-[15px] font-semibold text-[var(--ink)]">웹 콘솔</div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_2px_8px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.08)]">
        <div className="flex h-9 items-center gap-3 border-b border-[var(--line)] bg-[var(--surface-2)] px-4">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex h-5 flex-1 items-center rounded bg-[var(--surface)] px-2.5">
            <span className="truncate font-mono text-[11px] text-[var(--muted)]">https://{host}/console</span>
          </div>
        </div>

        <div className="flex min-h-[690px]">
          <div className="w-[148px] shrink-0 border-r border-[var(--line)] bg-[var(--surface-2)]/55 p-3">
            <div className="mb-3 px-2 text-[12px] font-semibold text-[var(--ink)]">zkWallet</div>
            <div className="space-y-1">
              {menu.map((item) => (
                <button
                  className={`h-9 w-full rounded-md px-2 text-left text-[12px] font-semibold ${
                    page === item ? "bg-[var(--accent)] text-white" : "text-[var(--ink-2)] hover:bg-[var(--surface)]"
                  }`}
                  key={item}
                  onClick={() => setPage(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </section>
  );
}

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <section className="mx-auto w-[340px]">
      <div className="mb-4">
        <div className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--ink-2)]">사용자 화면</div>
        <div className="mt-1 text-[15px] font-semibold text-[var(--ink)]">모바일 앱</div>
      </div>

      <div className="relative h-[700px] w-[340px] rounded-[58px] bg-[var(--bezel)] p-[12px] shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
        <div className="relative flex h-full flex-col overflow-hidden rounded-[46px] bg-[var(--surface)]">
          <div className="flex h-12 items-center justify-between px-6 pt-2 text-[12px] font-semibold">
            <span>9:41</span>
            <span>5G 100%</span>
          </div>
          <div className="flex h-12 items-center justify-between border-b border-[var(--line)] px-5">
            <div className="text-[16px] font-semibold">zkWallet</div>
            <StatusBadge tone="accent">Demo</StatusBadge>
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}

function PersonalWorkspace() {
  const [tab, setTab] = useState("홈");
  const [walletReady, setWalletReady] = useState(false);
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("25,000 KRW");
  const [recipient, setRecipient] = useState("0x72bd...23a9");
  const [txStatus, setTxStatus] = useState("대기");
  const [signId, setSignId] = useState("");
  const [events, setEvents] = useState<EventItem[]>([]);

  const push = (title: string, detail: string) => {
    setEvents((prev) => [{ id: makeEventId(prev.length), title, detail }, ...prev]);
  };

  const createWallet = () => {
    const nextAddress = `0x91f3...${2200 + events.length}`;
    setWalletReady(true);
    setAddress(nextAddress);
    push("지갑 생성", `${nextAddress} 준비 완료`);
    setTab("지갑");
  };

  const requestSign = () => {
    const nextSignId = `SIGN-${1210 + events.length}`;
    setTxStatus("서명 중");
    setSignId(nextSignId);
    push("서명 요청", `${amount} · ${nextSignId}`);
  };

  const completeTx = () => {
    setTxStatus("완료");
    push("거래 완료", `${amount} · ${recipient}`);
  };

  const metrics = [
    { label: "지갑 상태", value: walletReady ? "생성 완료" : "미생성", detail: address || "지갑 생성 전" },
    { label: "거래 상태", value: txStatus, detail: signId || "Sign ID 대기" },
    { label: "최근 금액", value: amount, detail: recipient },
  ];

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[420px_minmax(320px,1fr)]">
      <PhoneFrame>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {tab === "홈" && (
            <div className="space-y-4">
              <div className="rounded-[18px] bg-[var(--accent)] p-5 text-white">
                <div className="text-[13px] opacity-80">잔액</div>
                <div className="mt-2 text-[28px] font-bold">{walletReady ? "0 KRW" : "-"}</div>
                <div className="mt-2 break-all font-mono text-[11px] opacity-80">{address || "지갑을 만들면 주소가 표시됩니다"}</div>
              </div>
              <ActionButton disabled={walletReady} onClick={createWallet}>지갑 만들기</ActionButton>
            </div>
          )}
          {tab === "지갑" && (
            <div className="space-y-3">
              <MetricCard label="지갑 상태" value={walletReady ? "사용 가능" : "미생성"} />
              <MetricCard label="지갑 주소" value={address || "대기 중"} />
              <MetricCard label="보안 상태" value={walletReady ? "활성" : "대기"} />
            </div>
          )}
          {tab === "보내기" && (
            <div className="space-y-4">
              <Field label="금액" onChange={setAmount} value={amount} />
              <Field label="받는 주소" onChange={setRecipient} value={recipient} />
              <div className="flex flex-col gap-2">
                <ActionButton disabled={!walletReady || txStatus !== "대기"} onClick={requestSign}>서명 요청</ActionButton>
                <ActionButton disabled={txStatus !== "서명 중"} onClick={completeTx}>거래 완료 확인</ActionButton>
              </div>
              <MetricCard detail={signId || "대기 중"} label="거래 상태" value={txStatus} />
            </div>
          )}
          {tab === "내역" && (
            <div className="space-y-2">
              {events.map((event) => (
                <div className="rounded-[14px] border border-[var(--line)] p-3" key={event.id}>
                  <div className="text-[13px] font-semibold">{event.title}</div>
                  <div className="mt-1 text-[12px] text-[var(--ink-2)]">{event.detail}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-4 border-t border-[var(--line)]">
          {["홈", "지갑", "보내기", "내역"].map((item) => (
            <button
              className={`h-14 text-[11px] font-semibold ${tab === item ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}
              key={item}
              onClick={() => setTab(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </PhoneFrame>

      <StateBoard events={events} metrics={metrics} title="개인 지갑 상태" />
    </div>
  );
}

function CustodyWorkspace() {
  const [page, setPage] = useState("대시보드");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [company, setCompany] = useState("대한자산운용 주식회사");
  const [adminA, setAdminA] = useState("이수민");
  const [adminB, setAdminB] = useState("최종원");
  const [custodyStatus, setCustodyStatus] = useState("대기");
  const [walletId, setWalletId] = useState("");
  const [depositAmount, setDepositAmount] = useState("500,000 KRW");
  const [depositStatus, setDepositStatus] = useState("대기");
  const [withdrawAmount, setWithdrawAmount] = useState("120,000 KRW");
  const [withdrawAddress, setWithdrawAddress] = useState("0x8a74...9f11");
  const [withdrawStatus, setWithdrawStatus] = useState("대기");
  const [approvalCount, setApprovalCount] = useState(0);
  const [signId, setSignId] = useState("");

  const push = (title: string, detail: string) => {
    setEvents((prev) => [{ id: makeEventId(prev.length), title, detail }, ...prev]);
  };

  const requestCustody = () => {
    setCustodyStatus("승인 대기");
    push("수탁 등록 요청", `${company} · ${adminA}, ${adminB}`);
    setPage("승인함");
  };

  const approveCustody = () => {
    setCustodyStatus("승인 완료");
    push("수탁 등록 승인", company);
  };

  const createWallet = () => {
    const nextWalletId = `CST-WALLET-${1200 + events.length}`;
    setCustodyStatus("운영 가능");
    setWalletId(nextWalletId);
    push("수탁 지갑 생성", nextWalletId);
    setPage("대시보드");
  };

  const registerDeposit = () => {
    setDepositStatus("완료");
    push("입금 반영", depositAmount);
  };

  const requestWithdraw = () => {
    setWithdrawStatus("승인 중");
    setApprovalCount(0);
    push("출금 요청", `${withdrawAmount} · ${withdrawAddress}`);
    setPage("승인함");
  };

  const approveWithdraw = () => {
    const next = approvalCount + 1;
    setApprovalCount(next);
    push("출금 승인", `${next}/2`);
    if (next >= 2) setWithdrawStatus("승인 완료");
  };

  const signWithdraw = () => {
    const nextSignId = `SIGN-${1250 + events.length}`;
    setSignId(nextSignId);
    setWithdrawStatus("전송 완료");
    push("출금 전송 완료", `${withdrawAmount} · ${nextSignId}`);
  };

  const metrics = [
    { label: "수탁 상태", value: custodyStatus, detail: company },
    { label: "Wallet ID", value: walletId || "미생성", detail: "수탁 등록 승인 후 생성" },
    { label: "입금 상태", value: depositStatus, detail: depositAmount },
    { label: "출금 상태", value: withdrawStatus, detail: signId || `${approvalCount}/2 승인` },
  ];

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(720px,1fr)_360px]">
      <BrowserFrame host="custody.zkwallet.io" menu={["대시보드", "수탁 등록", "입금", "출금", "승인함", "감사 로그"]} page={page} setPage={setPage}>
        <div className="border-b border-[var(--line)] px-5 py-4">
          <div className="text-[18px] font-semibold">{page}</div>
          <div className="mt-1 text-[12px] text-[var(--ink-2)]">Custody Program</div>
        </div>
        <div className="p-5">
          {page === "대시보드" && (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
            </div>
          )}
          {page === "수탁 등록" && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="법인명" onChange={setCompany} value={company} />
                <Field label="참여자 1" onChange={setAdminA} value={adminA} />
                <Field label="참여자 2" onChange={setAdminB} value={adminB} />
              </div>
              <div className="flex gap-2">
                <ActionButton disabled={custodyStatus !== "대기"} onClick={requestCustody}>수탁 등록 요청</ActionButton>
                <ActionButton disabled={custodyStatus !== "승인 완료"} onClick={createWallet}>지갑 생성</ActionButton>
              </div>
            </div>
          )}
          {page === "입금" && (
            <div className="space-y-4">
              <Field label="입금 수량" onChange={setDepositAmount} value={depositAmount} />
              <ActionButton disabled={custodyStatus !== "운영 가능"} onClick={registerDeposit}>입금 반영</ActionButton>
            </div>
          )}
          {page === "출금" && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="출금 수량" onChange={setWithdrawAmount} value={withdrawAmount} />
                <Field label="목적지 주소" onChange={setWithdrawAddress} value={withdrawAddress} />
              </div>
              <div className="flex gap-2">
                <ActionButton disabled={custodyStatus !== "운영 가능" || withdrawStatus !== "대기"} onClick={requestWithdraw}>출금 요청</ActionButton>
                <ActionButton disabled={withdrawStatus !== "승인 완료"} onClick={signWithdraw}>전송 완료</ActionButton>
              </div>
            </div>
          )}
          {page === "승인함" && (
            <div className="space-y-3">
              {custodyStatus === "승인 대기" && <ApprovalRow label="수탁 등록 승인" detail={company} onApprove={approveCustody} />}
              {withdrawStatus === "승인 중" && <ApprovalRow label="출금 승인" detail={`${withdrawAmount} · ${approvalCount}/2`} onApprove={approveWithdraw} />}
              {custodyStatus !== "승인 대기" && withdrawStatus !== "승인 중" && <EmptyState label="대기 중인 승인 요청이 없습니다." />}
            </div>
          )}
          {page === "감사 로그" && <EventList events={events} />}
        </div>
      </BrowserFrame>
      <StateBoard events={events} metrics={metrics} title="수탁 운영 상태" />
    </div>
  );
}

function ApprovalRow({ detail, label, onApprove }: { detail: string; label: string; onApprove: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--line)] p-4">
      <div>
        <div className="text-[14px] font-semibold">{label}</div>
        <div className="mt-1 text-[12px] text-[var(--ink-2)]">{detail}</div>
      </div>
      <ActionButton onClick={onApprove}>승인</ActionButton>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="rounded-lg border border-[var(--line)] p-8 text-center text-[14px] text-[var(--ink-2)]">{label}</div>;
}

function EventList({ events }: { events: EventItem[] }) {
  if (events.length === 0) return <EmptyState label="이벤트가 없습니다." />;
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--line)]">
      {events.map((event) => (
        <div className="grid gap-3 border-b border-[var(--line-2)] px-4 py-3 last:border-b-0 md:grid-cols-[100px_160px_minmax(0,1fr)]" key={event.id}>
          <div className="font-mono text-[12px] text-[var(--accent)]">{event.id}</div>
          <div className="text-[13px] font-semibold">{event.title}</div>
          <div className="text-[13px] text-[var(--ink-2)]">{event.detail}</div>
        </div>
      ))}
    </div>
  );
}

function SimpleWebWorkspace({ mode }: { mode: "issuer" | "platform" }) {
  const meta = modeMeta[mode];
  const menu = mode === "issuer" ? ["대시보드", "발행", "소각", "준비금", "승인함", "감사 로그"] : ["대시보드", "Tenant", "프로그램", "권한", "승인 정책", "감사 로그"];
  const [page, setPage] = useState(menu[0]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [primaryName, setPrimaryName] = useState(mode === "issuer" ? "KFIN Corp." : "KFIN Tenant");
  const [amount, setAmount] = useState(mode === "issuer" ? "1,000,000 KRW" : "KRW 스테이블코인");
  const [status, setStatus] = useState("준비 중");
  const [requestId, setRequestId] = useState("");

  const push = (title: string, detail: string) => {
    setEvents((prev) => [{ id: makeEventId(prev.length), title, detail }, ...prev]);
  };

  const submit = (label: string) => {
    const nextRequestId = `${mode === "issuer" ? "ISS" : "PLT"}-${1300 + events.length}`;
    setRequestId(nextRequestId);
    setStatus("완료");
    push(label, `${primaryName} · ${amount} · ${nextRequestId}`);
  };

  const metrics = [
    { label: mode === "issuer" ? "발행사" : "Tenant", value: primaryName, detail: status },
    { label: mode === "issuer" ? "요청 금액" : "프로그램", value: amount, detail: requestId || "요청 전" },
    { label: "상태", value: status, detail: events[0]?.title ?? "이벤트 대기" },
  ];

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(720px,1fr)_360px]">
      <BrowserFrame host={meta.host} menu={menu} page={page} setPage={setPage}>
        <div className="border-b border-[var(--line)] px-5 py-4">
          <div className="text-[18px] font-semibold">{page}</div>
          <div className="mt-1 text-[12px] text-[var(--ink-2)]">{meta.title}</div>
        </div>
        <div className="p-5">
          {page === "대시보드" && <div className="grid gap-3 md:grid-cols-3">{metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}</div>}
          {page !== "대시보드" && page !== "감사 로그" && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <Field label={mode === "issuer" ? "조직명" : "Tenant 이름"} onChange={setPrimaryName} value={primaryName} />
                <Field label={mode === "issuer" ? "요청 수량" : "프로그램명"} onChange={setAmount} value={amount} />
              </div>
              <ActionButton onClick={() => submit(`${page} 저장`)}>{page} 저장</ActionButton>
            </div>
          )}
          {page === "감사 로그" && <EventList events={events} />}
        </div>
      </BrowserFrame>
      <StateBoard events={events} metrics={metrics} title={`${meta.title} 상태`} />
    </div>
  );
}

export function ModePage({ mode }: Props) {
  const meta = modeMeta[mode];

  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <div className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--ink-2)]">
            {meta.surface === "mobile" ? "Mobile App" : "Web Console"}
          </div>
          <h1 className="mt-2 text-[28px] font-semibold leading-tight text-[var(--ink)]">{meta.title}</h1>
        </div>
        <StatusBadge tone="accent">{meta.surface === "mobile" ? "앱 조작" : "웹 조작"}</StatusBadge>
      </div>

      {mode === "personal" && <PersonalWorkspace />}
      {mode === "custody" && <CustodyWorkspace />}
      {mode === "issuer" && <SimpleWebWorkspace mode="issuer" />}
      {mode === "platform" && <SimpleWebWorkspace mode="platform" />}
    </section>
  );
}
