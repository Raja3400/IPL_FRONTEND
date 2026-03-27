import { StatusBadge } from "../components/StatusBadge";
import { apiClient } from "../services/apiClient";

const healthUrl = apiClient.buildUrl("/health");
const meUrl = apiClient.buildUrl("/users/me");

export function StatusPage() {
  return (
    <section className="stack">
      <div>
        <h1 className="page-title">System status</h1>
        <p className="muted">Sprint 1 keeps the foundation stable and adds the first authenticated contract layer.</p>
      </div>
      <article className="card stack">
        <StatusBadge label="Health contract ready" />
        <div>
          <strong>Public endpoint</strong>
          <div className="api-box">
            <code>GET {healthUrl}</code>
          </div>
        </div>
        <div>
          <strong>Protected endpoint</strong>
          <div className="api-box">
            <code>GET {meUrl}</code>
          </div>
        </div>
      </article>
    </section>
  );
}
