import { useLayoutTier } from "../context/LayoutTierContext.jsx";
import { SkeletonCard } from "./Skeleton.jsx";
import "./lazy-route-fallback.css";

/**
 * Lazy-route placeholder shaped like the active viewport tier (not a single mobile-width strip on desktop).
 */
export function LazyRouteFallback() {
  const tier = useLayoutTier();

  if (tier === "mobile") {
    return (
      <div className="lazy-fallback lazy-fallback-mobile">
        <SkeletonCard />
        <div className="lazy-fallback-stack">
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (tier === "tablet") {
    return (
      <div className="lazy-fallback lazy-fallback-tablet">
        <div className="lazy-fallback-tablet-cols">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (tier === "large") {
    return (
      <div className="lazy-fallback lazy-fallback-wide">
        <div className="lazy-fallback-wide-toolbar" />
        <div className="lazy-fallback-wide-grid lazy-fallback-wide-grid-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="lazy-fallback lazy-fallback-wide">
      <div className="lazy-fallback-wide-toolbar" />
      <div className="lazy-fallback-wide-grid lazy-fallback-wide-grid-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
