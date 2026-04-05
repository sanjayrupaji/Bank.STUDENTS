import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { MAIN_NAV } from "../navConfig.js";
import { getPageMeta } from "./pageMeta.js";
import "./large-shell.css";

export function LargeAppShell() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const meta = getPageMeta(pathname);
  const links = MAIN_NAV.filter((n) => !n.adminOnly || user?.role === "admin");

  return (
    <div className="shell-large">
      <aside className="shell-large-side">
        <div className="shell-large-brand">
          <span className="shell-large-logo" aria-hidden />
          School Bank
          <span className="shell-large-badge">Pro</span>
        </div>
        <nav className="shell-large-nav" aria-label="Primary">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? "shell-lnav-active" : "")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="shell-large-foot">
          <div className="shell-large-name">{user?.fullName}</div>
          <div className="shell-large-mail">{user?.email}</div>
          <button type="button" className="shell-large-logout" onClick={() => logout()}>
            Sign out
          </button>
        </div>
      </aside>
      <div className="shell-large-body-row">
        <div className="shell-large-col">
          <header className="shell-large-header">
            <div>
              <div className="shell-large-breadcrumb">{meta.crumb}</div>
              <h1 className="shell-large-page-title">{meta.title}</h1>
            </div>
            <div className="shell-large-header-meta">
              Signed in as
              <br />
              <strong style={{ color: "var(--text)" }}>{user?.email}</strong>
            </div>
          </header>
          <div className="shell-large-main">
            <div className="shell-large-inner">
              <div className="shell-outlet shell-outlet-large">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
        <aside className="shell-large-rail" aria-label="Workspace">
          <div className="shell-large-rail-title">Workspace</div>
          <div className="shell-large-rail-body">
            Real-time balance updates apply across all open sessions. Use Activity for full
            filters and exports. Admins get live platform metrics in the console.
          </div>
        </aside>
      </div>
    </div>
  );
}
