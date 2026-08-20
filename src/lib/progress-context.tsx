import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getProgress } from "@/lib/server/jw";

export type ProgressData = Awaited<ReturnType<typeof getProgress>>;

type Ctx = {
  data: ProgressData | null;
  loading: boolean;
  reload: () => Promise<void>;
};

const ProgressContext = createContext<Ctx>({
  data: null,
  loading: true,
  reload: async () => {},
});

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!user) {
      setData(null);
      setLoading(false);
      return;
    }
    try {
      const next = await getProgress();
      setData(next);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isPending) return;
    void reload();
  }, [isPending, reload]);

  return (
    <ProgressContext.Provider value={{ data, loading: loading || isPending, reload }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  return useContext(ProgressContext);
}
