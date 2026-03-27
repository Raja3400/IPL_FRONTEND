import { useAuth } from "../features/auth/AuthContext";
import { NavLink, Outlet } from "react-router-dom";

const publicNavItems = [
  { to: "/", label: "Arena" },
  { to: "/matches", label: "Matches" }
];

export function AppShell() {
  const { status, user, signOut } = useAuth();
  const navItems = status === "authenticated"
    ? [
        ...publicNavItems,
        { to: "/dashboard", label: "Dashboard" },
        { to: "/profile", label: "Profile" },
        { to: "/my-predictions", label: "My Picks" },
        { to: "/leaderboard/tournament", label: "Rankings" }
      ]
    : [...publicNavItems, { to: "/login", label: "Login" }];

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar__inner">
          <div className="brand" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 15px var(--brand-glow)'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="brand__title">IPL PREDICTOR</span>
            </div>
          </div>
          <div className="topbar__actions">
            <nav className="nav" aria-label="Primary navigation">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => (isActive ? "nav__link nav__link--active" : "nav__link")}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            {status === "authenticated" ? (
              <div className="session-box">
                <span className="session-box__text">
                  <span style={{ color: '#fff', fontWeight: 600 }}>{user?.mobileNumber}</span>
                  <span style={{ 
                    display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', 
                    background: user?.profileCompleted ? '#00e5ff' : '#ff0055',
                    marginLeft: '8px', boxShadow: user?.profileCompleted ? '0 0 8px #00e5ff' : '0 0 8px #ff0055' 
                  }} title={user?.profileCompleted ? "Profile complete" : "Profile pending"}></span>
                </span>
                <button className="button button--ghost" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} type="button" onClick={signOut}>
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
