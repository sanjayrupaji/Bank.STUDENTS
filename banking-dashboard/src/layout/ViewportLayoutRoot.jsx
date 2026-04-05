import { useLayoutTier } from "../context/LayoutTierContext.jsx";
import { MobileAppShell } from "./shells/MobileAppShell.jsx";
import { TabletAppShell } from "./shells/TabletAppShell.jsx";
import { DesktopAppShell } from "./shells/DesktopAppShell.jsx";
import { LargeAppShell } from "./shells/LargeAppShell.jsx";

const SHELLS = {
  mobile: MobileAppShell,
  tablet: TabletAppShell,
  desktop: DesktopAppShell,
  large: LargeAppShell,
};

/**
 * Exactly one shell component mounts for the current viewport tier.
 * `key={tier}` forces a full unmount/remount when crossing breakpoints so structure never "morphs".
 */
export function ViewportLayoutRoot() {
  const tier = useLayoutTier();
  const Shell = SHELLS[tier] ?? SHELLS.desktop;
  return <Shell key={tier} />;
}
