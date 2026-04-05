import { useLayoutTier } from "../context/LayoutTierContext.jsx";
import { useDashboardPage } from "../hooks/useDashboardPage.js";
import { propsFrom } from "./dashboard/DashboardShared.jsx";
import { DashboardMobile } from "./dashboard/DashboardMobile.jsx";
import { DashboardTablet } from "./dashboard/DashboardTablet.jsx";
import { DashboardDesktop } from "./dashboard/DashboardDesktop.jsx";
import { DashboardLarge } from "./dashboard/DashboardLarge.jsx";
import "./dashboard.css";

export function DashboardPage() {
  const tier = useLayoutTier();
  const h = useDashboardPage();

  if (h.loading && !h.account) {
    return (
      <div className="dash-loading">
        <div className="dash-skeleton" />
        <div className="dash-skeleton dash-skeleton--wide" />
        <div className="dash-skeleton" />
      </div>
    );
  }

  const p = propsFrom(h);

  switch (tier) {
    case "mobile":
      return <DashboardMobile {...p} />;
    case "tablet":
      return <DashboardTablet {...p} />;
    case "large":
      return <DashboardLarge {...p} />;
    case "desktop":
    default:
      return <DashboardDesktop {...p} />;
  }
}
