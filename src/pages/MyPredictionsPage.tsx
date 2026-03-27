import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { useAuth } from "../features/auth/AuthContext";
import { predictionService } from "../features/predictions/predictionService";
import type { PredictionResponse } from "../types/prediction";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function MyPredictionsPage() {
  const { token } = useAuth();
  const [predictions, setPredictions] = useState<PredictionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    void predictionService
      .getMyPredictions(token)
      .then((items) => {
        setPredictions(items);
        setError(null);
      })
      .catch((nextError: unknown) => setError(nextError instanceof Error ? nextError.message : "Failed to load predictions"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <LoadingState message="Loading your predictions..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <section className="stack">
      <div style={{ padding: "0 1rem" }}>
        <p className="pill">My Predictions</p>
        <h1 className="page-title">Prediction History</h1>
        <p className="muted">
          Review your strategy and track incoming points. Watch closely as matches conclude and results unlock.
        </p>
      </div>

      {predictions.length === 0 ? (
        <EmptyState title="No predictions yet" message="You have not submitted any predictions yet." action={<Link to="/matches" className="button-link button-link--primary">Browse matches</Link>} />
      ) : (
        <div className="match-grid">
          {predictions.map((prediction) => {
            const scored = prediction.scoredAt !== null;
            return (
              <article key={prediction.id} className="match-card match-card--prediction" style={{ border: scored ? "1px solid rgba(0,255,136,0.3)" : "1px solid rgba(255,255,255,0.05)" }}>
                <div className="match-card__topline">
                  <span style={{ color: "var(--brand-primary)", fontWeight: 700 }}>Match {prediction.matchNumber}</span>
                  <span className={`status-badge status-badge--${scored ? "live" : prediction.isLocked ? "completed" : "upcoming"}`} style={{ padding: "0.25rem 0.75rem" }}>{scored ? "SCORED" : prediction.isLocked ? "LOCKED" : "OPEN"}</span>
                </div>

                <div className="stack stack--tight" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "1rem", marginBottom: "0.5rem" }}>
                  <h2 className="match-card__title" style={{ fontSize: "1.4rem" }}>{prediction.team1.code} <span style={{ color: "var(--text-muted)", fontSize: "1rem" }}>vs</span> {prediction.team2.code}</h2>
                  <p className="match-card__subtitle" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    Winner pick: <span style={{ color: "#fff", fontWeight: 600 }}>{prediction.predictedWinnerTeam.name}</span>
                  </p>
                </div>

                <dl className="match-meta">
                  <div><dt>Submitted</dt><dd>{formatDate(prediction.submittedAt)}</dd></div>
                  <div><dt>Predicted score</dt><dd>{prediction.team1.code} {prediction.predictedTeam1Score} / {prediction.team2.code} {prediction.predictedTeam2Score}</dd></div>
                  <div><dt>Status</dt><dd style={{ color: scored ? "#00ff88" : "var(--text-main)" }}>{scored ? `Scored on ${formatDate(prediction.scoredAt!)}` : "Pending"}</dd></div>

                  {scored && (
                    <div style={{ marginTop: "0.5rem", background: "rgba(0,255,136,0.1)", padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(0,255,136,0.2)" }}>
                      <dt style={{ color: "#00ff88" }}>Points Earned</dt>
                      <dd style={{ color: "#00ff88", fontSize: "1.5rem", textShadow: "0 0 10px rgba(0,255,136,0.4)", marginTop: 0 }}>+{prediction.pointsAwarded}</dd>
                    </div>
                  )}
                </dl>

                <div className="cta-row cta-row--compact" style={{ marginTop: "auto", paddingTop: "1rem" }}>
                  <Link to={`/matches/${prediction.matchId}`} className="button-link">Open Match</Link>
                  {scored && <Link to={`/predictions/${prediction.matchId}`} className="button-link button-link--primary">Score Detail</Link>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
