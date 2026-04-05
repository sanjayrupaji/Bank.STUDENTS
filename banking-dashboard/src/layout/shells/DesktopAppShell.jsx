import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { MAIN_NAV } from "../navConfig.js";
import { getPageMeta } from "./pageMeta.js";
import "./desktop-shell.css";

export function DesktopAppShell() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const meta = getPageMeta(pathname);
  const links = MAIN_NAV.filter((n) => !n.adminOnly || user?.role === "admin");

  return (
    <div className="shell-desktop">
      <aside className="shell-desktop-side">
        <div className="shell-desktop-brand">
          <span className="shell-desktop-logo" aria-hidden />
          School Bank
        </div>
        <nav className="shell-desktop-nav" aria-label="Primary">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? "shell-dnav-active" : "")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="shell-desktop-foot">
          <div className="shell-desktop-name">{user?.fullName}</div>
          <div className="shell-desktop-mail">{user?.email}</div>
          <button type="button" className="shell-desktop-logout" onClick={() => logout()}>
            Sign out
          </button>
        </div>
      </aside>
      <div className="shell-desktop-col">
        <header className="shell-desktop-header">
          <div>
            <div className="shell-desktop-breadcrumb">{meta.crumb}</div>
            <h1 className="shell-desktop-page-title">{meta.title}</h1>
          </div>
        </header>
        <div className="shell-desktop-main">
          <div className="shell-desktop-inner">
            <div className="shell-outlet shell-outlet-desktop">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
