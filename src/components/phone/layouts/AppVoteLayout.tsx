import type { UserScreen } from "@/scenarios/types";

type Props = {
  screen: UserScreen;
  canAdvance: boolean;
  activeActionLabel?: string;
  onAdvance?: () => void;
};

// zkVoting 유권자 투표 화면 — 후보를 라디오 카드로 표시한다.
// 선택 강조는 시연용 정적 표기(vote.options[].selected)이며 실제 입력은 없다.
export function AppVoteLayout({ screen, canAdvance, activeActionLabel, onAdvance }: Props) {
  const vote = screen.vote;

  return (
    <div className="flex min-h-0 flex-1 flex-col px-5">
      <div className="min-h-0 flex-1 overflow-y-auto py-2">
        {vote && (
          <>
            <div className="flex flex-col gap-2.5">
              {vote.options.map((option) => (
                <div
                  key={option.mark}
                  className={`flex items-center gap-3 rounded-[12px] border px-3.5 py-3 transition ${
                    option.selected
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[var(--line)] bg-[var(--surface)]"
                  }`}
                >
                  <span
                    className={`relative h-[18px] w-[18px] shrink-0 rounded-full border-2 ${
                      option.selected ? "border-[var(--accent)]" : "border-[var(--line)]"
                    }`}
                  >
                    {option.selected && (
                      <span className="absolute inset-[3px] rounded-full bg-[var(--accent)]" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[14.5px] font-semibold text-[var(--ink)]">
                      {option.mark} · {option.name}
                    </span>
                    {option.note && (
                      <span className="mt-0.5 block text-[12.5px] text-[var(--ink-2)]">{option.note}</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="shrink-0 pb-4 space-y-2">
        {screen.footer && (
          <div className="text-center text-[12px] leading-[1.55] text-[var(--ink-2)]">{screen.footer}</div>
        )}
        {screen.actions && screen.actions.length > 0 && (
          <div className="flex gap-2">
            {screen.actions.map((action) => {
              const isActive = canAdvance && action.label === activeActionLabel;
              return (
                <button
                  key={action.id}
                  type="button"
                  disabled={!isActive}
                  onClick={() => isActive && onAdvance?.()}
                  className={`inline-flex h-[52px] flex-1 items-center justify-center rounded-[16px] text-[15px] font-semibold transition-opacity
                    ${action.tone === "accent" ? "bg-[var(--accent)] text-white"
                    : action.tone === "bad" ? "bg-[var(--bad)] text-white"
                    : "border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)]"}
                    ${!isActive ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
                >
                  {action.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
