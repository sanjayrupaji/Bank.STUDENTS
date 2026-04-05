import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { MAIN_NAV } from "../navConfig.js";
import { getPageMeta } from "./pageMeta.js";
import "./tablet-shell.css";

const NAV_ICONS = {
  "/": "⌂",
  "/transfer": "⇄",
  "/history": "≡",
  "/admin": "◆",
};

export function TabletAppShell() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const meta = getPageMeta(pathname);
  const [sideCollapsed, setSideCollapsed] = useState(false);
  const links = MAIN_NAV.filter((n) => !n.adminOnly || user?.role === "admin");

  return (
    <div className="shell-tablet">
      <aside
        id="tablet-primary-nav"
        className={`shell-tablet-side${sideCollapsed ? " shell-tablet-side-collapsed" : ""}`}
        aria-label="Primary navigation"
      >
        <div className="shell-tablet-side-brand">
          <span className="shell-tablet-logo" aria-hidden />
          {!sideCollapsed ? <span className="shell-tablet-brand-text">School Bank</span> : null}
        </div>
        <nav className="shell-tablet-side-nav">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `shell-tablet-navlink${isActive ? " shell-tablet-navlink-active" : ""}`
              }
              title={item.label}
            >
              <span className="shell-tablet-nav-ico" aria-hidden>
                {NAV_ICONS[item.to] || "·"}
              </span>
              <span className="shell-tablet-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="shell-tablet-side-foot">
          {!sideCollapsed ? (
            <>
              <div className="shell-tablet-side-user">{user?.fullName || "—"}</div>
              <div className="shell-tablet-side-mail">{user?.email}</div>
            </>
          ) : null}
          <button type="button" className="shell-tablet-side-out" onClick={() => logout()}>
            {sideCollapsed ? "⎋" : "Sign out"}
          </button>
        </div>
      </aside>

      <div className="shell-tablet-workspace">
        <header className="shell-tablet-chrome">
          <button
            type="button"
            className="shell-tablet-menu-toggle"
            onClick={() => setSideCollapsed((c) => !c)}
            aria-expanded={!sideCollapsed}
            aria-controls="tablet-primary-nav"
            title={sideCollapsed ? "Expand navigation" : "Collapse navigation"}
          >
            <span className="shell-tablet-burger" aria-hidden />
          </button>
          <div className="shell-tablet-chrome-titles">
            <div className="shell-tablet-crumb">{meta.crumb}</div>
            <h1 className="shell-tablet-page-title">{meta.title}</h1>
          </div>
          <div className="shell-tablet-chrome-aside">
            <span className="shell-tablet-email-chrome">{user?.email}</span>
          </div>
        </header>

        <main className="shell-tablet-main">
          <div className="shell-tablet-inner">
            <div className="shell-outlet shell-outlet-tablet">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
