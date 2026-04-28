function SignalIcon() {
  return (
    <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden="true">
      <rect x="0" y="8" width="3" height="4" rx="0.5" />
      <rect x="5" y="5.5" width="3" height="6.5" rx="0.5" />
      <rect x="10" y="3" width="3" height="9" rx="0.5" />
      <rect x="15" y="0" width="3" height="12" rx="0.5" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true">
      <circle cx="8" cy="10.5" r="1.3" fill="currentColor" />
      <path d="M5.1 7.6 Q8 5 10.9 7.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2.4 5 Q8 0.4 13.6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width="26" height="12" viewBox="0 0 26 12" aria-hidden="true">
      <rect x="0.5" y="1" width="21" height="10" rx="3" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M22 4.3v3.4c1-.5 1.6-1.1 1.6-1.7s-.6-1.2-1.6-1.7z" fill="currentColor" />
      <rect x="2" y="2.5" width="16.5" height="7" rx="1.5" fill="currentColor" />
    </svg>
  );
}

export function PhoneStatusBar() {
  return (
    <div className="flex h-[54px] shrink-0 items-center justify-between px-6 text-[var(--ink)]">
      <span className="text-[15px] font-semibold leading-none">9:41</span>
      <div className="flex items-center gap-[5px]">
        <SignalIcon />
        <WifiIcon />
        <BatteryIcon />
      </div>
    </div>
  );
}
