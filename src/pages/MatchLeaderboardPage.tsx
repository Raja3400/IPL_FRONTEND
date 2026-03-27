import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ErrorState } from "../components/ErrorState";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { useAuth } from "../features/auth/AuthContext";
import { leaderboardService } from "../features/leaderboard/leaderboardService";
import { INDIA_COUNTRY, INDIA_STATE_OPTIONS, buildSelectOptions, getCitiesForState } from "../lib/indiaLocations";
import type { LeaderboardFilters, MatchLeaderboardResponse } from "../types/leaderboard";

const emptyFilters: LeaderboardFilters = { country: INDIA_COUNTRY, state: "", city: "" };

function formatDate(value: string | undefined) {
  if (!value) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function MatchLeaderboardPage() {
  const { matchId } = useParams();
  const { token } = useAuth();
  const [filters, setFilters] = useState<LeaderboardFilters>(emptyFilters);
  const [draftFilters, setDraftFilters] = useState<LeaderboardFilters>(emptyFilters);
  const [page, setPage] = useState(0);
  const [leaderboard, setLeaderboard] = useState<MatchLeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !matchId) {
      setLoading(false);
      setError("Leaderboard unavailable");
      return;
    }

    setLoading(true);
    void leaderboardService
      .getMatchLeaderboard(token, Number(matchId), filters, page, 20)
      .then((res) => {
        setLeaderboard(res);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load leaderboard"))
      .finally(() => setLoading(false));
  }, [filters, matchId, page, token]);

  const stateOptions = useMemo(() => buildSelectOptions(INDIA_STATE_OPTIONS, draftFilters.state), [draftFilters.state]);
  const cityOptions = useMemo(() => buildSelectOptions(getCitiesForState(draftFilters.state), draftFilters.city), [draftFilters.city, draftFilters.state]);

  const applyFilters = () => {
    setPage(0);
    setFilters(draftFilters);
  };

  const resetFilters = () => {
    setDraftFilters(emptyFilters);
    setFilters(emptyFilters);
    setPage(0);
  };

  const updateDraftFilter = (field: keyof LeaderboardFilters, value: string) => {
    setDraftFilters((current) => {
      if (field === "state") {
        const nextState = value;
        const nextCityOptions = getCitiesForState(nextState);
        const shouldClearCity = current.city ? !nextCityOptions.some((city) => city.toLowerCase() === current.city.toLowerCase()) : false;
        return { ...current, state: nextState, city: shouldClearCity ? "" : current.city };
      }

      return { ...current, [field]: value };
    });
  };

  if (loading) return <LoadingState message="Fetching current rankings..." />;
  if (error || !leaderboard) return <ErrorState message={error ?? "Not found"} action={<Link to="/matches" className="button-link">Arena</Link>} />;

  const matchSummary = leaderboard.matchSummary;
  const hasNextPage = (leaderboard.page + 1) * leaderboard.size < leaderboard.totalEntries;

  return (
    <section className="stack">
      <div className="score-hero" style={{ background: "linear-gradient(135deg, rgba(23,32,51,0.6), rgba(10,14,23,0.9))", padding: "2.5rem", borderRadius: "24px", border: "1px solid var(--border-glass)" }}>
        <div style={{ flex: 1 }}>
          <p className="pill">Global Match Rankings</p>
          <h1 className="page-title">
            {matchSummary?.team1?.name} <span style={{ color: "var(--text-muted)" }}>vs</span> {matchSummary?.team2?.name}
          </h1>
          <p className="muted" style={{ marginBottom: "1.5rem" }}>
            {matchSummary ? `Match ${matchSummary.matchNumber} • ${formatDate(matchSummary.matchStartTime)}` : "Unavailable"}
          </p>
          <div className="cta-row" style={{ marginTop: "0" }}>
            <Link to={`/matches/${leaderboard.matchId}`} className="button-link button-link--ghost">
              Match Details
            </Link>
            <Link to={`/predictions/${leaderboard.matchId}`} className="button-link button-link--primary">
              My Score
            </Link>
          </div>
        </div>
        <div className="score-chip" style={{ background: "linear-gradient(135deg, rgba(0,229,255,0.1), transparent)", border: "1px solid var(--brand-primary)", minWidth: "220px" }}>
          <span className="score-chip__label">Your Rank</span>
          <span className="score-chip__value" style={{ color: "var(--brand-primary)", textShadow: "0 0 20px rgba(0,229,255,0.5)" }}>
            {leaderboard.currentUserRank ? `#${leaderboard.currentUserRank.rank}` : "TBD"}
          </span>
          {leaderboard.currentUserRank && <span style={{ marginTop: "0.5rem", fontWeight: 600, color: "#fff" }}>{leaderboard.currentUserRank.pointsAwarded} pts</span>}
        </div>
      </div>

      <article className="card form-section" style={{ padding: "1.5rem" }}>
        <h2 className="section-title" style={{ fontSize: "1.1rem", color: "var(--text-muted)" }}>
          Filter Competitors
        </h2>
        <div className="prediction-form__grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          <label className="field">
            <span className="field__label">Country</span>
            <select className="input" value={draftFilters.country} onChange={(event) => updateDraftFilter("country", event.target.value)}>
              <option value={INDIA_COUNTRY}>{INDIA_COUNTRY}</option>
            </select>
          </label>
          <label className="field">
            <span className="field__label">State</span>
            <select className="input" value={draftFilters.state} onChange={(event) => updateDraftFilter("state", event.target.value)}>
              <option value="">All states</option>
              {stateOptions.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">City</span>
            <select className="input" value={draftFilters.city} onChange={(event) => updateDraftFilter("city", event.target.value)} disabled={!draftFilters.state}>
              <option value="">{draftFilters.state ? "All cities" : "Select a state first"}</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="cta-row" style={{ marginTop: "1rem" }}>
          <button type="button" className="button button-link--primary" onClick={applyFilters}>
            Search
          </button>
          <button type="button" className="button button--ghost" onClick={resetFilters}>
            Clear
          </button>
        </div>
      </article>

      {leaderboard.items.length === 0 ? (
        <EmptyState title="No competitors found" message={leaderboard.availabilityMessage ?? "No matching competitors found for the selected filters."} />
      ) : (
        <article className="card" style={{ padding: "1rem", background: "transparent", border: "none", boxShadow: "none" }}>
          <div className="leaderboard-table" role="table">
            <div className="leaderboard-table__header" role="row" style={{ background: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "1rem" }}>
              <span>Rank</span>
              <span>Competitor</span>
              <span>Location</span>
              <span>Points</span>
              <span>Error Margin</span>
            </div>
            {leaderboard.items.map((item) => (
              <div key={`${item.rank}-${item.userId}`} className={item.currentUser ? "leaderboard-table__row leaderboard-table__row--current" : "leaderboard-table__row"} role="row" style={{ margin: "0.5rem 0", background: item.currentUser ? "linear-gradient(90deg, rgba(0,229,255,0.1), transparent)" : "var(--bg-surface)" }}>
                <span style={{ fontSize: "1.25rem", fontWeight: 900, color: item.rank <= 3 ? "var(--brand-primary)" : "inherit" }}>#{item.rank}</span>
                <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                  {item.userName}
                  {item.currentUser && <span style={{ marginLeft: "0.75rem", background: "var(--brand-primary)", color: "#000", padding: "0.1rem 0.5rem", borderRadius: "4px", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>You</span>}
                </span>
                <span className="muted">{[item.city, item.state, item.country].filter(Boolean).join(", ") || "Unknown Location"}</span>
                <span style={{ fontWeight: 800, color: "#00ff88" }}>{item.pointsAwarded}</span>
                <span className="muted">{item.combinedScoreError ?? "--"}</span>
              </div>
            ))}
          </div>
          <div className="pagination-row" style={{ marginTop: "1rem", paddingTop: "1.5rem", borderTop: "none" }}>
            <button type="button" className="button button--ghost" disabled={leaderboard.page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}>
              Previous Page
            </button>
            <span className="muted">Division {leaderboard.page + 1}</span>
            <button type="button" className="button button--ghost" disabled={!hasNextPage} onClick={() => setPage((current) => current + 1)}>
              Next Page
            </button>
          </div>
        </article>
      )}
    </section>
  );
}

