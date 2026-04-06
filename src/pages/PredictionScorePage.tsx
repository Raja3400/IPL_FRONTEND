import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { useAuth } from "../features/auth/AuthContext";
import { predictionService } from "../features/predictions/predictionService";
import type { PredictionScoreResponse } from "../types/prediction";

const breakdownLabels: Record<string, string> = {
  winner: "Match Winner",
  tossWinner: "Toss Winner",
  highestRunScorer: "Highest Run Scorer",
  highestWicketTaker: "Highest Wicket Taker",
  mostSixes: "Most Sixes",
  mostFours: "Most Fours",
  mostCatches: "Most Catches",
  manOfTheMatch: "Player of the Match",
  bestEconomyBowler: "Best Economical Bowler",
  longestSix: "Best Economical Bowler",
  bestStriker: "Best Striker",
  team1Score: "Team 1 Score",
  team2Score: "Team 2 Score",
  status: "Match Status"
};

const teamBreakdownKeys = new Set(["winner", "tossWinner"]);
const playerBreakdownKeys = new Set([
  "highestRunScorer",
  "highestWicketTaker",
  "mostSixes",
  "mostFours",
  "mostCatches",
  "manOfTheMatch",
  "bestEconomyBowler",
  "longestSix",
  "bestStriker"
]);

function formatDate(value: string | undefined) {
  if (!value) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatValue(value: string | number | null | undefined) {
  return value === null || value === undefined || value === "" ? "--" : String(value);
}

function parseIdentifier(value: string | number | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function formatResultStatus(value: string | number | null | undefined) {
  if (typeof value !== "string") {
    return formatValue(value);
  }

  return value.replace(/_/g, " ");
}

export function PredictionScorePage() {
  const { matchId } = useParams();
  const { token } = useAuth();
  const [score, setScore] = useState<PredictionScoreResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !matchId) {
      setLoading(false);
      setError("Score unavailable");
      return;
    }
    setLoading(true);
    void predictionService
      .getPredictionScore(token, Number(matchId))
      .then((res) => {
        setScore(res);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load detail"))
      .finally(() => setLoading(false));
  }, [matchId, token]);

  const team1Code = score?.matchSummary?.team1?.code ?? "Team 1";
  const team2Code = score?.matchSummary?.team2?.code ?? "Team 2";
  const hasDetailedSections = Boolean(score?.matchSummary && score?.myPrediction && score?.actualResult);

  const teamNameById = useMemo(() => {
    const lookup = new Map<number, string>();
    if (score?.matchSummary?.team1) {
      lookup.set(score.matchSummary.team1.id, score.matchSummary.team1.name);
    }
    if (score?.matchSummary?.team2) {
      lookup.set(score.matchSummary.team2.id, score.matchSummary.team2.name);
    }
    return lookup;
  }, [score]);

  const playerNameById = useMemo(() => {
    const lookup = new Map<number, string>();
    const players = [
      score?.myPrediction?.highestRunScorerPlayer,
      score?.myPrediction?.highestWicketTakerPlayer,
      score?.myPrediction?.mostSixesPlayer,
      score?.myPrediction?.mostFoursPlayer,
      score?.myPrediction?.mostCatchesPlayer,
      score?.myPrediction?.manOfMatchPlayer,
      score?.myPrediction?.bestEconomyBowlerPlayer,
      score?.myPrediction?.longestSixPlayer,
      score?.myPrediction?.bestStrikerPlayer,
      score?.actualResult?.highestRunScorerPlayer,
      score?.actualResult?.highestWicketTakerPlayer,
      score?.actualResult?.mostSixesPlayer,
      score?.actualResult?.mostFoursPlayer,
      score?.actualResult?.mostCatchesPlayer,
      score?.actualResult?.manOfMatchPlayer,
      score?.actualResult?.bestEconomyBowlerPlayer,
      score?.actualResult?.longestSixPlayer,
      score?.actualResult?.bestStrikerPlayer
    ];

    players.forEach((player) => {
      if (player) {
        lookup.set(player.id, player.fullName);
      }
    });

    return lookup;
  }, [score]);

  const predictionRows = useMemo(() => {
    if (!score) return [];
    return [
      ["Winner", score.myPrediction?.winnerTeam?.name],
      ["Toss", score.myPrediction?.tossWinnerTeam?.name],
      ["Highest Scorer", score.myPrediction?.highestRunScorerPlayer?.fullName],
      ["Highest Wickets", score.myPrediction?.highestWicketTakerPlayer?.fullName],
      ["Most Sixes", score.myPrediction?.mostSixesPlayer?.fullName],
      ["Most Fours", score.myPrediction?.mostFoursPlayer?.fullName],
      ["Most Catches", score.myPrediction?.mostCatchesPlayer?.fullName],
      ["POTM", score.myPrediction?.manOfMatchPlayer?.fullName],
      ["Best Economical Bowler", score.myPrediction?.bestEconomyBowlerPlayer?.fullName ?? score.myPrediction?.longestSixPlayer?.fullName],
      ["Best Striker", score.myPrediction?.bestStrikerPlayer?.fullName],
      [`${team1Code} Score`, score.myPrediction?.team1Score],
      [`${team2Code} Score`, score.myPrediction?.team2Score]
    ] as const;
  }, [score, team1Code, team2Code]);

  const actualRows = useMemo(() => {
    if (!score) return [];
    return [
      ["Winner", score.actualResult?.winnerTeam?.name],
      ["Toss", score.actualResult?.tossWinnerTeam?.name],
      ["Highest Scorer", score.actualResult?.highestRunScorerPlayer?.fullName],
      ["Highest Wickets", score.actualResult?.highestWicketTakerPlayer?.fullName],
      ["Most Sixes", score.actualResult?.mostSixesPlayer?.fullName],
      ["Most Fours", score.actualResult?.mostFoursPlayer?.fullName],
      ["Most Catches", score.actualResult?.mostCatchesPlayer?.fullName],
      ["POTM", score.actualResult?.manOfMatchPlayer?.fullName],
      ["Best Economical Bowler", score.actualResult?.bestEconomyBowlerPlayer?.fullName ?? score.actualResult?.longestSixPlayer?.fullName],
      ["Best Striker", score.actualResult?.bestStrikerPlayer?.fullName],
      [`${team1Code} Score`, score.actualResult?.team1Score],
      [`${team2Code} Score`, score.actualResult?.team2Score]
    ] as const;
  }, [score, team1Code, team2Code]);

  const resolveBreakdownValue = (key: string, value: string | number | null | undefined) => {
    if (key === "status") {
      return formatResultStatus(value);
    }

    const identifier = parseIdentifier(value);
    if (identifier !== null && teamBreakdownKeys.has(key)) {
      return teamNameById.get(identifier) ?? formatValue(value);
    }

    if (identifier !== null && playerBreakdownKeys.has(key)) {
      return playerNameById.get(identifier) ?? formatValue(value);
    }

    return formatValue(value);
  };

  if (loading) return <LoadingState message="Calculating score details..." />;
  if (error || !score) return <ErrorState message={error ?? "Not found"} action={<Link to="/my-predictions" className="button-link">Back</Link>} />;

  return (
    <section className="stack">
      <div className="score-hero">
        <div style={{ flex: 1 }}>
          <p className="pill">Scoring Results</p>
          <h1 className="page-title">{score.matchSummary?.team1?.name} vs {score.matchSummary?.team2?.name}</h1>
          <p className="muted">{score.matchSummary ? `Match ${score.matchSummary.matchNumber} • ${score.matchSummary.stage} • ${formatDate(score.matchSummary.matchStartTime)}` : "Match summary unavailable"}</p>
          <div className="cta-row" style={{ marginTop: "1.5rem" }}>
            <Link to="/my-predictions" className="button-link button-link--ghost">My Picks</Link>
            <Link to={`/leaderboard/match/${score.matchId}`} className="button-link button-link--primary">Match Leaderboard</Link>
          </div>
        </div>
        <div className="score-chip">
          <span className="score-chip__label">Points Earned</span>
          <span className="score-chip__value">{score.totalPoints ?? score.pointsAwarded ?? 0}</span>
        </div>
      </div>

      {!hasDetailedSections && <article className="card stack"><h2 className="section-title">Detail unavailable</h2><p className="muted">Detailed fields pending.</p></article>}

      <div className="match-detail-grid">
        <article className="card" style={{ borderTop: "4px solid var(--border-focus)" }}>
          <h2 className="section-title" style={{ color: "var(--brand-primary)" }}>Your Prediction</h2>
          <dl className="detail-list">{predictionRows.map(([label, value]) => <div key={label} className="detail-list__row"><dt>{label}</dt><dd>{formatValue(value)}</dd></div>)}</dl>
        </article>
        <article className="card" style={{ borderTop: "4px solid rgba(255,255,255,0.4)" }}>
          <h2 className="section-title">Actual Result</h2>
          <dl className="detail-list">{actualRows.map(([label, value]) => <div key={label} className="detail-list__row"><dt>{label}</dt><dd>{formatValue(value)}</dd></div>)}</dl>
        </article>
      </div>

      <article className="card" style={{ overflow: "hidden" }}>
        <h2 className="section-title">Score Breakdown</h2>
        <div className="breakdown-table" role="table">
          <div className="breakdown-table__header" role="row">
            <span>Market</span><span>Predicted</span><span>Actual</span><span>Points Earned</span>
          </div>
          {Object.entries(score.scoreBreakdown ?? {}).map(([key, entry]) => (
            <div key={key} className="breakdown-table__row" role="row" style={{ borderLeft: entry.matched ? "4px solid #00ff88" : "4px solid transparent" }}>
              <span>
                {breakdownLabels[key] ?? key}
                {typeof entry.matched === "boolean" && (
                  <strong className={entry.matched ? "status-text status-text--positive" : "status-text status-text--neutral"}>
                    {entry.matched ? " (+)" : " (-)"}
                  </strong>
                )}
              </span>
              <span className="muted">{entry.reason ? "--" : resolveBreakdownValue(key, entry.predicted)}</span>
              <span>{entry.reason ? entry.reason : resolveBreakdownValue(key, entry.actual)}</span>
              <span style={{ color: entry.matched ? "#00ff88" : "inherit", fontWeight: entry.matched ? 800 : 400 }}>
                {entry.points} {typeof entry.difference === "number" && <small className="muted" style={{ marginLeft: "0.5rem" }}>Diff {entry.difference}</small>}
              </span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
