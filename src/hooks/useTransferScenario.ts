import { useCallback, useEffect } from "react";
import { runTransfer, setupTransfer, TransferClientError } from "@/api/transferClient";
import type { Scenario } from "@/scenarios/types";
import { demoStore, useDemoStore } from "@/store/demoStore";

// 실데이터로 구동하는 zkTransfer 시나리오 (현재 ZT-1).
const TRANSFER_SCENARIOS = new Set<string>(["ZT-1"]);

/**
 * ZT-1 실연동 훅.
 *
 * <p>진입 시 어댑터 /demo/setup으로 계정을 준비하고(sessionId를 adapterRuns.runId에 보관),
 * "전송 요청" 스텝에서 {@link runTransferStep}이 /demo/transfer를 호출해 실제 txHash를
 * 화면 값(scenarioValues)에 주입한다.</p>
 */
export function useTransferScenario(scenario: Scenario) {
  const supported = TRANSFER_SCENARIOS.has(scenario.id);
  const run = useDemoStore((state) => state.adapterRuns[scenario.id]);

  // 진입 시 setup (계정 준비). 최초 1회만 계정을 만들고 이후 세션만 새로 발급된다(어댑터가 재사용).
  useEffect(() => {
    if (!supported) return;
    let cancelled = false;

    demoStore.setAdapterRun(scenario.id, { status: "loading", error: undefined });
    (async () => {
      try {
        const res = await setupTransfer();
        if (cancelled) return;
        demoStore.setScenarioValues(scenario.id, {
          "수신 주소": res.receiverEna,
          수신자: res.receiverEna,
        });
        demoStore.setAdapterRun(scenario.id, { status: "success", runId: res.sessionId, error: undefined });
      } catch (error) {
        if (cancelled) return;
        demoStore.setAdapterRun(scenario.id, { status: "error", error: getMessage(error) });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [supported, scenario.id]);

  // "전송 요청" 시 호출: 비공개 전송 실행 → 실제 txHash를 화면에 반영.
  const runTransferStep = useCallback(async () => {
    if (!supported) return;
    const sessionId = demoStore.getState().adapterRuns[scenario.id]?.runId;
    if (!sessionId) throw new Error("계정 준비 중입니다. 잠시 후 다시 시도하세요.");

    const res = await runTransfer(sessionId);
    demoStore.setScenarioValues(scenario.id, {
      txHash: res.txHash,
      상태: "confirmed",
    });
    return res;
  }, [supported, scenario.id]);

  return {
    supported,
    status: run?.status ?? "idle",
    error: run?.error,
    runTransferStep,
  };
}

function getMessage(error: unknown) {
  if (error instanceof TransferClientError) return error.message;
  if (error instanceof Error) return error.message;
  return "Transfer adapter request failed.";
}
