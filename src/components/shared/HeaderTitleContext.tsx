"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

interface HeaderTitleContextValue {
  overrideTitle: string | null;
  setOverrideTitle: (title: string | null) => void;
}

const HeaderTitleContext = createContext<HeaderTitleContextValue | null>(null);

export function HeaderTitleProvider({ children }: { children: ReactNode }) {
  const [overrideTitle, setOverrideTitleState] = useState<string | null>(null);

  const setOverrideTitle = useCallback((title: string | null) => {
    setOverrideTitleState(title);
  }, []);

  const value = useMemo(
    () => ({ overrideTitle, setOverrideTitle }),
    [overrideTitle, setOverrideTitle]
  );

  return <HeaderTitleContext.Provider value={value}>{children}</HeaderTitleContext.Provider>;
}

export function useHeaderTitleOverride() {
  const context = useContext(HeaderTitleContext);

  if (!context) {
    return {
      overrideTitle: null as string | null,
      setOverrideTitle: (_title: string | null) => {},
    };
  }

  return context;
}
