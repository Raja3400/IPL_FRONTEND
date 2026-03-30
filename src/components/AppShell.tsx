import { useEffect, useState } from "react";
import { useAuth } from "../features/auth/AuthContext";
import { NavLink, Outlet } from "react-router-dom";

const publicNavItems = [
  { to: "/", label: "Arena" },
  { to: "/matches", label: "Matches" },
  { to: "/rules", label: "Rules" }
];

export function AppShell() {
  const { status, user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = status === "authenticated"
    ? [
        ...publicNavItems,
        { to: "/dashboard", label: "Dashboard" },
        { to: "/profile", label: "Profile" },
        { to: "/my-predictions", label: "My Picks" },
        { to: "/leaderboard/tournament", label: "Rankings" }
      ]
    : [...publicNavItems, { to: "/login", label: "Login" }];

  useEffect(() => {
    setMenuOpen(false);
  }, [status]);

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar__inner">
          <div className="brand" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 15px var(--brand-glow)"
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span className="brand__title">IPL PREDICTOR</span>
            </div>
          </div>

          <button
            type="button"
            className={menuOpen ? "menu-toggle menu-toggle--active" : "menu-toggle"}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
          >
            <svg className="menu-toggle__icon" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7H20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M4 12H20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M4 17H20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>

          <div className={menuOpen ? "topbar__actions topbar__actions--open" : "topbar__actions"}>
            <nav className="nav" aria-label="Primary navigation">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => (isActive ? "nav__link nav__link--active" : "nav__link")}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            {status === "authenticated" ? (
              <div className="session-box">
                <span className="session-box__text">
                  <span style={{ color: "#fff", fontWeight: 600 }}>{user?.mobileNumber}</span>
                  <span
                    style={{
                      display: "inline-block",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: user?.profileCompleted ? "#00e5ff" : "#ff0055",
                      marginLeft: "8px",
                      boxShadow: user?.profileCompleted ? "0 0 8px #00e5ff" : "0 0 8px #ff0055"
                    }}
                    title={user?.profileCompleted ? "Profile complete" : "Profile pending"}
                  ></span>
                </span>
                <button className="button button--ghost" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }} type="button" onClick={signOut}>
                  LOGOUT
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
