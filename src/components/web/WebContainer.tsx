import type { ScenarioId, UserScreen } from "@/scenarios/types";
import { getProductLabelByScenarioId } from "@/scenarios/groups";
import { WebScreen } from "./WebScreen";

type Props = {
  screen: UserScreen;
  actor: string;
  scenarioId: ScenarioId;
  stepIndicator?: string;
  activeActionLabel?: string;
  canAdvance?: boolean;
  onAdvance?: () => void;
  onFieldChange?: (screenId: string, label: string, value: string) => void;
};

const navContext: Record<ScenarioId, { menuItem: string; pageTitle: string; host: string }> = {
  "PO-1": { menuItem: "설정", pageTitle: "플랫폼 설정", host: "platform.zkwallet.io" },
  "CU-1": { menuItem: "수탁 관리", pageTitle: "수탁 등록", host: "custody.zkwallet.io" },
  "CU-2": { menuItem: "수탁 관리", pageTitle: "수탁 입금", host: "custody.zkwallet.io" },
  "CU-3": { menuItem: "수탁 관리", pageTitle: "수탁 출금", host: "custody.zkwallet.io" },
  "IS-1": { menuItem: "발행사 설정", pageTitle: "발행사 등록", host: "issuer.zkwallet.io" },
  "FS-2": { menuItem: "발행 관리", pageTitle: "발행 요청", host: "issuer.zkwallet.io" },
  "FS-3": { menuItem: "발행 관리", pageTitle: "소각 요청", host: "issuer.zkwallet.io" },
  "FS-4": { menuItem: "준비금", pageTitle: "유동성 관리", host: "issuer.zkwallet.io" },
  "FU-1": { menuItem: "지갑", pageTitle: "지갑 만들기", host: "app.zkwallet.io" },
  "FU-2": { menuItem: "거래", pageTitle: "거래 서명", host: "app.zkwallet.io" },
  "FU-3": { menuItem: "결과 요약", pageTitle: "개인 사용자 결과 요약", host: "app.zkwallet.io" },
  "ZT-1": { menuItem: "정책 설정", pageTitle: "개인정보보호 기반 송금 정책 설정", host: "admin.zktransfer.io" },
  "ZT-5": { menuItem: "정책 설정", pageTitle: "QR 결제 정책", host: "admin.zktransfer.io" },
  "ZT-A": { menuItem: "감사", pageTitle: "zkTransfer 감사", host: "audit.zktransfer.io" },
  "ZK-1": { menuItem: "지갑 개설", pageTitle: "ZKPasskey 개인 사용자용", host: "app.zkpasskey.io" },
  "ZK-2": { menuItem: "지갑 복구", pageTitle: "ZKPasskey 개인 사용자용", host: "app.zkpasskey.io" },
  "ZP-1": { menuItem: "대시보드", pageTitle: "PoL 대사", host: "ops.zkpol.io" },
  "ZP-4": { menuItem: "관제", pageTitle: "이상징후 관제", host: "ops.zkpol.io" },
};

const defaultMenuItems = ["대시보드", "수탁 관리", "발행 관리", "준비금", "감사", "설정"];
const menuItemsByScenario: Partial<Record<ScenarioId, string[]>> = {
  "ZT-1": ["대시보드", "정책 설정", "거래 내역"],
  "ZT-5": ["대시보드", "정책 설정", "결제 내역"],
  "ZT-A": ["대시보드", "감사", "복호화 이력"],
  "ZK-1": ["지갑 개설", "신원 연결", "증명 생성", "계정 활성화"],
  "ZK-2": ["지갑 복구", "신원 확인", "증명 생성", "복구 완료"],
  "ZP-1": ["대시보드", "원장 이벤트", "증명 배치", "온체인 검증", "검증 내역"],
  "ZP-4": ["관제", "이상 이벤트", "증명 실패", "지급 차단", "감사 로그"],
};

export function WebContainer({
  screen,
  actor,
  scenarioId,
  stepIndicator,
  activeActionLabel,
  canAdvance = false,
  onAdvance,
  onFieldChange,
}: Props) {
  const context = screen.webContext ?? navContext[scenarioId];
  const productLabel = getProductLabelByScenarioId(scenarioId);
  const menuItems = menuItemsByScenario[scenarioId] ?? defaultMenuItems;

  return (
    <section className="flex flex-col items-center">
      <div className="mb-5 flex w-full items-center justify-between">
        <div>
          <div className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--ink-2)]">사용자 화면</div>
          <div className="mt-1 text-[15px] font-semibold text-[var(--ink)]">{actor}</div>
          {stepIndicator && (
            <div className="mt-1 font-mono text-[11px] text-[var(--muted)]">{stepIndicator}</div>
          )}
        </div>
        <div className="inline-flex h-6 items-center gap-1.5 rounded-full bg-[var(--surface-2)] px-3 text-[11px] font-medium text-[var(--ink-2)]">
          <span className="font-mono">web</span>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_2px_8px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.08)]">
        <div className="flex h-9 items-center gap-3 border-b border-[var(--line)] bg-[var(--surface-2)] px-4">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex h-5 flex-1 items-center rounded bg-[var(--surface)] px-2.5">
            <span className="truncate font-mono text-[11px] text-[var(--muted)]">
              https://{context.host}/{context.pageTitle.replace(/\s/g, "-")}
            </span>
          </div>
        </div>

        <div className="flex h-[610px]">
          <div className="hidden w-[118px] shrink-0 border-r border-[var(--line)] bg-[var(--surface-2)]/60 px-3 py-4 sm:block">
            <div className="mb-4 text-[11px] font-bold text-[var(--ink)]">{productLabel}</div>
            <div className="space-y-1">
              {menuItems.map((item) => {
                const active = item === context.menuItem || (context.menuItem === "발행사 설정" && item === "설정");
                return (
                  <div
                    className={`rounded-md px-2 py-2 text-[11px] font-semibold ${
                      active ? "bg-[var(--accent)] text-white" : "text-[var(--ink-2)]"
                    }`}
                    key={item}
                  >
                    {item}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex h-11 items-center justify-between border-b border-[var(--line)] px-4">
              <div>
                <div className="text-[12px] font-semibold text-[var(--ink)]">{context.pageTitle}</div>
                <div className="text-[10px] text-[var(--muted)]">{context.menuItem}</div>
              </div>
              <div className="rounded bg-[var(--surface-2)] px-2 py-1 font-mono text-[10px] text-[var(--ink-2)]">
                live demo
              </div>
            </div>
            <WebScreen
              activeActionLabel={activeActionLabel}
              actor={actor}
              canAdvance={canAdvance}
              onAdvance={onAdvance}
              onFieldChange={onFieldChange}
              screen={screen}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
