"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type MoonReadyContextValue = {
  moonSceneReady: boolean;
  markMoonReady: () => void;
};

const MoonReadyContext = createContext<MoonReadyContextValue | null>(null);

export function MoonReadyProvider({ children }: { children: ReactNode }) {
  const [moonSceneReady, setMoonSceneReady] = useState(false);
  const markMoonReady = useCallback(() => {
    setMoonSceneReady(true);
  }, []);

  const value = useMemo(
    () => ({ moonSceneReady, markMoonReady }),
    [moonSceneReady, markMoonReady],
  );

  return (
    <MoonReadyContext.Provider value={value}>
      {children}
    </MoonReadyContext.Provider>
  );
}

export function useMoonReady(): MoonReadyContextValue {
  const ctx = useContext(MoonReadyContext);
  if (!ctx) {
    throw new Error("useMoonReady must be used within MoonReadyProvider");
  }
  return ctx;
}
