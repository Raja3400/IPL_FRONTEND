import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PredictionPanel } from "../components/PredictionPanel";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { StatCard } from "../components/StatCard";
import { useAuth } from "../features/auth/AuthContext";
import { matchService } from "../features/matches/matchService";
import type { MatchDetail } from "../types/match";

function formatMatchDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "full", timeStyle: "short" }).format(new Date(value));
}

export function MatchDetailPage() {
  const { id } = useParams();
  const { status } = useAuth();
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Match id is missing");
      return;
    }

    void matchService
      .getMatchDetails(id)
      .then((item) => {
        setMatch(item);
        setError(null);
      })
      .catch((nextError: unknown) => {
        setError(nextError instanceof Error ? nextError.message : "Failed to load match details");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const groupedPlayers = useMemo(() => {
    if (!match) {
      return { team1Players: [], team2Players: [] };
    }
    return {
      team1Players: match.players.filter((player) => player.teamId === match.team1.id),
      team2Players: match.players.filter((player) => player.teamId === match.team2.id)
    };
  }, [match]);

  if (loading) {
    return <LoadingState message="Loading match details..." />;
  }

  if (error || !match) {
    return <ErrorState message={error ?? "Match not found"} action={<Link to="/matches" className="button-link">Back to matches</Link>} />;
  }

  return (
    <section className="stack">
      <div style={{ background: "linear-gradient(135deg, rgba(23,32,51,0.8), rgba(10,14,23,0.95))", padding: "2.5rem", borderRadius: "24px", position: "relative", overflow: "hidden", border: "1px solid var(--border-glass)" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: "300px", height: "300px", background: "radial-gradient(circle, var(--brand-secondary) 0%, transparent 60%)", opacity: 0.15, filter: "blur(50px)" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "2rem" }}>
          <div>
            <div style={{ color: "var(--brand-primary)", fontWeight: 800, letterSpacing: "0.1em", fontSize: "0.85rem", marginBottom: "0.5rem", textTransform: "uppercase" }}>Match {match.matchNumber} &bull; {match.stage}</div>
            <h1 style={{ fontSize: "2.5rem", fontWeight: 900, margin: "0 0 0.5rem", letterSpacing: "-0.02em" }}>{match.team1.code} <span style={{ color: "var(--text-muted)" }}>vs</span> {match.team2.code}</h1>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "1rem" }}>{formatMatchDate(match.matchStartTime)}</p>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <Link to="/matches" className="button-link button-link--ghost">Arena</Link>
            {status === "authenticated" ? <Link to={`/leaderboard/match/${match.id}`} className="button-link button-link--primary" style={{ boxShadow: "0 0 15px rgba(0,229,255,0.3)" }}>Leaderboard</Link> : null}
          </div>
        </div>

        <div className="admin-summary-grid" style={{ marginTop: "2.5rem" }}>
          <StatCard label="Venue" value={match.venue.name} hint={`${match.venue.city}, ${match.venue.country}`} />
          <StatCard label="Timezone" value={match.timezone} />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
             <span style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>Status</span>
             <span className={`status-badge status-badge--${match.status.toLowerCase()}`}>{match.status}</span>
          </div>
        </div>
      </div>

      <div style={{ position: "relative", margin: "1rem 0" }}>
        <PredictionPanel match={match} />
      </div>

      <div className="squad-grid" style={{ marginTop: "1rem" }}>
        <article className="card" style={{ borderTop: "4px solid var(--brand-primary)", background: "linear-gradient(180deg, rgba(0,229,255,0.05), transparent 50px)" }}>
          <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {match.team1.code} Squad
          </h2>
          <ul className="player-list">
            {groupedPlayers.team1Players.map((player) => (
              <li key={player.id} className="player-list__item" style={{ transition: "all 0.2s", border: "1px solid transparent" }} onMouseEnter={(event) => { event.currentTarget.style.borderColor = "var(--border-focus)"; }} onMouseLeave={(event) => { event.currentTarget.style.borderColor = "transparent"; }}>
                <span style={{ fontWeight: 600 }}>{player.fullName}</span>
                <span className="player-role">{player.role ? player.role.replace(/_/g, " ") : "Unspecified"}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="card" style={{ borderTop: "4px solid var(--brand-secondary)", background: "linear-gradient(180deg, rgba(112,0,255,0.05), transparent 50px)" }}>
          <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {match.team2.code} Squad
          </h2>
          <ul className="player-list">
            {groupedPlayers.team2Players.map((player) => (
              <li key={player.id} className="player-list__item" style={{ transition: "all 0.2s", border: "1px solid transparent" }} onMouseEnter={(event) => { event.currentTarget.style.borderColor = "rgba(112, 0, 255, 0.5)"; }} onMouseLeave={(event) => { event.currentTarget.style.borderColor = "transparent"; }}>
                <span style={{ fontWeight: 600 }}>{player.fullName}</span>
                <span className="player-role" style={{ color: "var(--brand-secondary)" }}>{player.role ? player.role.replace(/_/g, " ") : "Unspecified"}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
