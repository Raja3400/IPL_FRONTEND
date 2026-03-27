import { useAuth } from "../features/auth/AuthContext";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <section className="stack">
      <div>
        <p className="pill">Protected route</p>
        <h1 className="page-title">Welcome back</h1>
        <p className="muted">Sprint 2 adds profile completion and location data on top of the existing OTP auth flow.</p>
      </div>
      <article className="card stack">
        <div className="stat">
          <div className="stat__label">User ID</div>
          <div className="stat__value">#{user?.id}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Mobile number</div>
          <div className="stat__value">{user?.mobileNumber}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Profile status</div>
          <div className="stat__value">{user?.profileCompleted ? "Complete" : "Incomplete"}</div>
        </div>
      </article>
    </section>
  );
}
