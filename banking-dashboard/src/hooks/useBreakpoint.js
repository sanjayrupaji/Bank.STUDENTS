import { useCallback, useEffect, useState } from "react";

/** @typedef {'mobile' | 'tablet' | 'desktop' | 'large'} LayoutTier */

const Q = {
  large: "(min-width: 1440px)",
  desktop: "(min-width: 1024px) and (max-width: 1439px)",
  tablet: "(min-width: 640px) and (max-width: 1023px)",
  mobile: "(max-width: 639px)",
};

/**
 * Single source of truth: first matching tier wins top-down.
 * @returns {LayoutTier}
 */
export function getLayoutTier() {
  if (typeof window === "undefined") return "desktop";
  if (window.matchMedia(Q.large).matches) return "large";
  if (window.matchMedia(Q.desktop).matches) return "desktop";
  if (window.matchMedia(Q.tablet).matches) return "tablet";
  return "mobile";
}

export function useBreakpoint() {
  const [tier, setTier] = useState(getLayoutTier);

  const update = useCallback(() => setTier(getLayoutTier()), []);

  useEffect(() => {
    const list = [
      window.matchMedia(Q.large),
      window.matchMedia(Q.desktop),
      window.matchMedia(Q.tablet),
      window.matchMedia(Q.mobile),
    ];
    list.forEach((m) => m.addEventListener("change", update));
    return () => list.forEach((m) => m.removeEventListener("change", update));
  }, [update]);

  return tier;
}
