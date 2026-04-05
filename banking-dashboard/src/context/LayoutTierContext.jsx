import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useBreakpoint } from "../hooks/useBreakpoint.js";

const LayoutTierContext = createContext(null);

export function LayoutTierProvider({ children }) {
  const tier = useBreakpoint();
  const value = useMemo(() => ({ tier }), [tier]);

  useEffect(() => {
    document.documentElement.dataset.viewportTier = tier;
  }, [tier]);

  return (
    <LayoutTierContext.Provider value={value}>{children}</LayoutTierContext.Provider>
  );
}

export function useLayoutTier() {
  const ctx = useContext(LayoutTierContext);
  if (!ctx) throw new Error("useLayoutTier requires LayoutTierProvider");
  return ctx.tier;
}
