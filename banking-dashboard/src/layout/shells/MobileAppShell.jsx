import { useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { MAIN_NAV } from "../navConfig.js";
import "./mobile-shell.css";

const icons = {
  "/": "⌂",
  "/transfer": "⇄",
  "/history": "≡",
  "/admin": "◆",
};

export function MobileAppShell() {
  const { user, logout } = useAuth();

  useEffect(() => {
    document.body.classList.add("has-mobile-bottom-nav");
    return () => document.body.classList.remove("has-mobile-bottom-nav");
  }, []);

  const links = MAIN_NAV.filter((n) => !n.adminOnly || user?.role === "admin");

  return (
    <div className="shell-mobile">
      <header className="shell-mobile-header">
        <div className="shell-mobile-brand">
          <span className="shell-mobile-logo" aria-hidden />
          <div>
            <div className="shell-mobile-title">School Bank</div>
            {user?.email ? (
              <div className="shell-mobile-user">{user.email}</div>
            ) : null}
          </div>
        </div>
        <div className="shell-mobile-actions">
          <button type="button" className="shell-mobile-btn" onClick={() => logout()}>
            Sign out
          </button>
        </div>
      </header>

      <main className="shell-mobile-main">
        <div className="shell-outlet shell-outlet-mobile">
          <Outlet />
        </div>
      </main>

      <nav className="shell-mobile-nav" aria-label="Primary">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => (isActive ? "shell-mnav-active" : "")}
          >
            <span aria-hidden>{icons[item.to] || "·"}</span>
            <span>{item.shortLabel}</span>
            <span className="shell-mnav-dot" aria-hidden />
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
