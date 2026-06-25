import { useCallback, useEffect, useRef, useState } from "react";

type PollState<T> = {
  data: T | undefined;
  error: string | undefined;
  loading: boolean;
  refresh: () => void;
};

// 주기적으로 fetcher를 호출해 최신 상태를 유지하는 훅 (대시보드 라이브용).
// 첫 로딩 후에는 background refetch라 화면 깜빡임 없이 data를 갱신한다.
export function usePolling<T>(fetcher: () => Promise<T>, intervalMs = 5000, enabled = true): PollState<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const mounted = useRef(true);

  const run = useCallback(async () => {
    try {
      const next = await fetcherRef.current();
      if (!mounted.current) return;
      setData(next);
      setError(undefined);
    } catch (e) {
      if (!mounted.current) return;
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    if (!enabled) {
      setLoading(false);
      return () => {
        mounted.current = false;
      };
    }
    void run();
    const id = window.setInterval(run, intervalMs);
    return () => {
      mounted.current = false;
      window.clearInterval(id);
    };
  }, [run, intervalMs, enabled]);

  return { data, error, loading, refresh: run };
}
