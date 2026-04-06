import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { matchService } from "../features/matches/matchService";
import type { MatchListItem } from "../types/match";

function formatMatchDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function getStatusPriority(status: string) {
  switch (status) {
    case "LIVE":
      return 1;
    case "UPCOMING":
      return 2;
    default:
      return 3;
  }
}

function sortMatches(items: MatchListItem[]) {
  return [...items].sort((left, right) => {
    const priorityDifference = getStatusPriority(left.status) - getStatusPriority(right.status);
    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    const timeDifference = new Date(left.matchStartTime).getTime() - new Date(right.matchStartTime).getTime();
    if (timeDifference !== 0) {
      return timeDifference;
    }

    return left.matchNumber - right.matchNumber;
  });
}

export function MatchesPage() {
  const [matches, setMatches] = useState<MatchListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void matchService
      .listMatches()
      .then((items) => {
        setMatches(items);
        setError(null);
      })
      .catch((nextError: unknown) => {
        setError(nextError instanceof Error ? nextError.message : "Failed to load matches");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const sortedMatches = useMemo(() => sortMatches(matches), [matches]);

  if (loading) {
    return (
      <section className="card" style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <p className="muted" style={{ animation: "pulse-neon 1.5s infinite alternate" }}>Loading matches...</p>
      </section>
    );
  }

  if (error) {
    return <section className="card"><p className="error-text">{error}</p></section>;
  }

  return (
    <section className="stack">
      <div style={{ marginBottom: "1.5rem" }}>
        <p className="pill">Tournament Hub</p>
        <h1 className="page-title">IPL Fixtures</h1>
        <p className="muted">
          Browse upcoming battles. Select a match to predict the outcome and earn points on the leaderboard.
        </p>
      </div>

      <div className="match-grid">
        {sortedMatches.map((match) => (
          <Link key={match.id} to={`/matches/${match.id}`} className="match-card">
            <div className="match-card__topline">
              <span style={{ color: "var(--brand-primary)", fontWeight: 800 }}>M{match.matchNumber} &bull; {match.stage}</span>
              <span className={`status-badge status-badge--${match.status.toLowerCase()}`}>{match.status}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0.5rem 0" }}>
              <div style={{ textAlign: "center", flex: 1 }}>
                <div className="match-team-code" style={{ fontSize: "2rem" }}>{match.team1.code}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{match.team1.name}</div>
              </div>

              <div style={{ padding: "0 1rem", color: "var(--brand-accent)", fontWeight: 900, fontStyle: "italic", fontSize: "1.2rem", opacity: 0.8 }}>VS</div>

              <div style={{ textAlign: "center", flex: 1 }}>
                <div className="match-team-code" style={{ fontSize: "2rem" }}>{match.team2.code}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{match.team2.name}</div>
              </div>
            </div>

            <dl className="match-meta" style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <dt>Venue</dt>
                <dd style={{ textAlign: "right", fontSize: "0.85rem" }}>{match.venue.name}, {match.venue.city}</dd>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <dt>Start</dt>
                <dd style={{ color: "var(--brand-primary)", textAlign: "right" }}>{formatMatchDate(match.matchStartTime)}</dd>
              </div>
            </dl>
          </Link>
        ))}
      </div>
    </section>
  );
}
