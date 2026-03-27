import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { useAuth } from "../features/auth/AuthContext";
import { leaderboardService } from "../features/leaderboard/leaderboardService";
import { INDIA_COUNTRY, INDIA_STATE_OPTIONS, buildSelectOptions, getCitiesForState } from "../lib/indiaLocations";
import type { LeaderboardFilters, TournamentLeaderboardResponse } from "../types/leaderboard";

const emptyFilters: LeaderboardFilters = { country: INDIA_COUNTRY, state: "", city: "" };

export function TournamentLeaderboardPage() {
  const { token } = useAuth();
  const [filters, setFilters] = useState<LeaderboardFilters>(emptyFilters);
  const [draftFilters, setDraftFilters] = useState<LeaderboardFilters>(emptyFilters);
  const [page, setPage] = useState(0);
  const [leaderboard, setLeaderboard] = useState<TournamentLeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Leaderboard unavailable");
      return;
    }

    setLoading(true);
    void leaderboardService
      .getTournamentLeaderboard(token, filters, page, 20)
      .then((res) => {
        setLeaderboard(res);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load tournament leaderboard"))
      .finally(() => setLoading(false));
  }, [filters, page, token]);

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

  if (loading) {
    return <LoadingState message="Calculating tournament standings..." />;
  }

  if (error || !leaderboard) {
    return <ErrorState message={error ?? "Leaderboard not found"} />;
  }

  const hasNextPage = (leaderboard.page + 1) * leaderboard.size < leaderboard.totalEntries;
  const currentUserSummary = leaderboard.currentUserSummary;
  const hasEntries = leaderboard.items.length > 0;

  return (
    <section className="stack">
      <div
        className="score-hero"
        style={{ background: "linear-gradient(135deg, rgba(23,32,51,0.6), rgba(10,14,23,0.9))", padding: "2.5rem", borderRadius: "24px", border: "1px solid var(--border-glass)" }}
      >
        <div style={{ flex: 1 }}>
          <p className="pill" style={{ background: "rgba(112,0,255,0.2)", color: "#b366ff", border: "1px solid #b366ff" }}>
            Season 2026 Rankings
          </p>
          <h1
            className="page-title"
            style={{ fontSize: "3rem", letterSpacing: "-0.03em", background: "linear-gradient(90deg, #fff, #b366ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            Tournament Leaderboard
          </h1>
          <p className="muted" style={{ fontSize: "1.1rem" }}>
            Track your overall standing across all scored IPL matches.
          </p>
        </div>
        <div className="score-chip" style={{ background: "linear-gradient(135deg, rgba(112,0,255,0.2), transparent)", border: "1px solid #7000ff", minWidth: "220px" }}>
          <span className="score-chip__label" style={{ color: "#b366ff" }}>Global Rank</span>
          <span className="score-chip__value" style={{ color: "#fff", textShadow: "0 0 20px rgba(112,0,255,0.6)" }}>
            {currentUserSummary?.rank ? `#${currentUserSummary.rank}` : "Not ranked yet"}
          </span>
          <span style={{ marginTop: "0.5rem", fontWeight: 600, color: "#00ff88" }}>
            {currentUserSummary?.totalPoints ?? 0} pts
          </span>
          <span className="muted" style={{ marginTop: "0.5rem" }}>
            {currentUserSummary ? `${currentUserSummary.matchesScored} scored / ${currentUserSummary.matchesPredicted} predicted` : "No scored predictions yet"}
          </span>
        </div>
      </div>

      <article className="card form-section" style={{ padding: "1.5rem" }}>
        <h2 className="section-title" style={{ fontSize: "1.1rem", color: "var(--text-muted)" }}>Filter Competitors</h2>
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
          <button type="button" className="button button-link--primary" style={{ background: "linear-gradient(135deg, #7000ff, #b366ff)" }} onClick={applyFilters}>Search Rankings</button>
          <button type="button" className="button button--ghost" onClick={resetFilters}>Clear</button>
        </div>
      </article>

      {!hasEntries ? (
        <EmptyState title="No tournament standings yet" message={leaderboard.message ?? "Tournament rankings appear once scored predictions are available."} />
      ) : (
        <article className="card" style={{ padding: "1rem", background: "transparent", border: "none", boxShadow: "none" }}>
          <div className="leaderboard-table" role="table">
            <div className="leaderboard-table__header leaderboard-table__header--tournament" role="row" style={{ background: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "1rem" }}>
              <span>Rank</span>
              <span>Competitor</span>
              <span>Location</span>
              <span>Predicted</span>
              <span>Scored</span>
              <span>Points</span>
            </div>
            {leaderboard.items.map((item) => (
              <div
                key={`${item.rank}-${item.userId}`}
                className={item.currentUser ? "leaderboard-table__row leaderboard-table__row--tournament leaderboard-table__row--current" : "leaderboard-table__row leaderboard-table__row--tournament"}
                role="row"
                style={{ margin: "0.5rem 0", background: item.currentUser ? "linear-gradient(90deg, rgba(112,0,255,0.2), transparent)" : "var(--bg-surface)" }}
              >
                <span style={{ fontSize: "1.25rem", fontWeight: 900, color: item.rank <= 3 ? "#b366ff" : "inherit" }}>#{item.rank}</span>
                <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                  {item.userName}
                  {item.currentUser && <span style={{ marginLeft: "0.75rem", background: "#b366ff", color: "#000", padding: "0.1rem 0.5rem", borderRadius: "4px", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>You</span>}
                </span>
                <span className="muted">{[item.city, item.state, item.country].filter(Boolean).join(", ") || "Unknown"}</span>
                <span style={{ fontWeight: 600 }}>{item.matchesPredicted}</span>
                <span style={{ fontWeight: 600, color: "var(--brand-primary)" }}>{item.matchesScored}</span>
                <span style={{ fontWeight: 800, color: "#00ff88", fontSize: "1.2rem" }}>{item.totalPoints}</span>
              </div>
            ))}
          </div>
          <div className="pagination-row" style={{ marginTop: "1rem", paddingTop: "1.5rem", borderTop: "none" }}>
            <button type="button" className="button button--ghost" disabled={leaderboard.page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}>Previous Page</button>
            <span className="muted">Division {leaderboard.page + 1}</span>
            <button type="button" className="button button--ghost" disabled={!hasNextPage} onClick={() => setPage((current) => current + 1)}>Next Page</button>
          </div>
        </article>
      )}
    </section>
  );
}
