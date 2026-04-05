import { useAuth } from "../context/AuthContext.jsx";
import { useLayoutTier } from "../context/LayoutTierContext.jsx";
import { useDashboardPage } from "../hooks/useDashboardPage.js";
import { propsFrom } from "./dashboard/DashboardShared.jsx";
import { DashboardMobile } from "./dashboard/DashboardMobile.jsx";
import { DashboardTablet } from "./dashboard/DashboardTablet.jsx";
import { DashboardDesktop } from "./dashboard/DashboardDesktop.jsx";
import { DashboardLarge } from "./dashboard/DashboardLarge.jsx";
import { DashboardManager } from "./dashboard/DashboardManager.jsx";
import { DashboardTeacher } from "./dashboard/DashboardTeacher.jsx";
import "./dashboard.css";

export function DashboardPage() {
  const { user } = useAuth();
  const tier = useLayoutTier();
  const h = useDashboardPage();

  if (h.loading && !h.account && user?.role === "student") {
    return (
      <div className="dash-loading">
        <div className="dash-skeleton" />
        <div className="dash-skeleton dash-skeleton--wide" />
        <div className="dash-skeleton" />
      </div>
    );
  }

  const p = propsFrom(h);

  // 1. Role-based top-level routing
  if (user?.role === "manager") {
    return <DashboardManager {...p} />;
  }
  if (user?.role === "teacher") {
    return <DashboardTeacher {...p} />;
  }

  // 2. Responsive routing for Students
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
