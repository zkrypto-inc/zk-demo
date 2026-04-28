export function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-[60px] items-center border-b border-[var(--line)] bg-[rgba(250,250,250,0.92)] px-5 backdrop-blur xl:px-8 2xl:px-10">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-2)]">zkWallet Custody Demo</div>
        <div className="mt-0.5 text-[14px] font-semibold text-[var(--ink)]">금융기관 운영 데모</div>
      </div>
    </header>
  );
}
