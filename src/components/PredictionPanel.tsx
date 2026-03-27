import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import { predictionService } from "../features/predictions/predictionService";
import { ApiError } from "../services/apiClient";
import type { MatchDetail } from "../types/match";
import type { PredictionRequest, PredictionResponse } from "../types/prediction";

type PredictionFormState = {
  predictedWinnerTeamId: string;
  predictedTossWinnerTeamId: string;
  highestRunScorerPlayerId: string;
  highestWicketTakerPlayerId: string;
  mostSixesPlayerId: string;
  mostFoursPlayerId: string;
  mostCatchesPlayerId: string;
  manOfMatchPlayerId: string;
  longestSixPlayerId: string;
  bestStrikerPlayerId: string;
  predictedTeam1Score: string;
  predictedTeam2Score: string;
};

const emptyForm: PredictionFormState = {
  predictedWinnerTeamId: "",
  predictedTossWinnerTeamId: "",
  highestRunScorerPlayerId: "",
  highestWicketTakerPlayerId: "",
  mostSixesPlayerId: "",
  mostFoursPlayerId: "",
  mostCatchesPlayerId: "",
  manOfMatchPlayerId: "",
  longestSixPlayerId: "",
  bestStrikerPlayerId: "",
  predictedTeam1Score: "",
  predictedTeam2Score: ""
};

function toFormState(prediction: PredictionResponse): PredictionFormState {
  return {
    predictedWinnerTeamId: String(prediction.predictedWinnerTeam.id),
    predictedTossWinnerTeamId: String(prediction.predictedTossWinnerTeam.id),
    highestRunScorerPlayerId: String(prediction.highestRunScorerPlayer.id),
    highestWicketTakerPlayerId: String(prediction.highestWicketTakerPlayer.id),
    mostSixesPlayerId: String(prediction.mostSixesPlayer.id),
    mostFoursPlayerId: String(prediction.mostFoursPlayer.id),
    mostCatchesPlayerId: String(prediction.mostCatchesPlayer.id),
    manOfMatchPlayerId: String(prediction.manOfMatchPlayer.id),
    longestSixPlayerId: String(prediction.longestSixPlayer.id),
    bestStrikerPlayerId: String(prediction.bestStrikerPlayer.id),
    predictedTeam1Score: String(prediction.predictedTeam1Score),
    predictedTeam2Score: String(prediction.predictedTeam2Score)
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function PredictionPanel({ match }: { match: MatchDetail }) {
  const { status, token } = useAuth();
  const [form, setForm] = useState<PredictionFormState>(emptyForm);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(status === "authenticated");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !token) {
      setLoading(false);
      setPrediction(null);
      setForm(emptyForm);
      return;
    }

    setLoading(true);
    void predictionService
      .getPredictionForMatch(token, match.id)
      .then((currentPrediction) => {
        setPrediction(currentPrediction);
        setForm(toFormState(currentPrediction));
        setError(null);
      })
      .catch((nextError: unknown) => {
        if (nextError instanceof ApiError && nextError.status === 404) {
          setPrediction(null);
          setForm(emptyForm);
          setError(null);
          return;
        }
        setError(nextError instanceof Error ? nextError.message : "Failed to load prediction");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [match.id, status, token]);

  const teamOptions = useMemo(() => [match.team1, match.team2], [match.team1, match.team2]);
  const playerOptions = match.players;
  const formLocked = prediction?.isLocked || match.status !== "UPCOMING";
  const lockMessage = match.status !== "UPCOMING"
    ? `Prediction closed for this match because it is currently ${match.status.toLowerCase()}.`
    : "Prediction closed for this match. Predictions are locked for this match once the scheduled start time is reached.";

  if (status === "loading") {
    return <section className="card"><p className="muted">Checking your session...</p></section>;
  }

  if (status === "anonymous") {
    return (
      <section className="card stack">
        <div>
          <p className="pill">Prediction</p>
          <h2 className="section-title">Sign in to submit your picks</h2>
          <p className="muted">Predictions are available only for authenticated users and are always validated on the backend.</p>
        </div>
        <Link to="/login" className="button-link button-link--primary">Go to login</Link>
      </section>
    );
  }

  function updateField(field: keyof PredictionFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    if (successMessage) {
      setSuccessMessage(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }

    const payload: PredictionRequest = {
      matchId: match.id,
      predictedWinnerTeamId: Number(form.predictedWinnerTeamId),
      predictedTossWinnerTeamId: Number(form.predictedTossWinnerTeamId),
      highestRunScorerPlayerId: Number(form.highestRunScorerPlayerId),
      highestWicketTakerPlayerId: Number(form.highestWicketTakerPlayerId),
      mostSixesPlayerId: Number(form.mostSixesPlayerId),
      mostFoursPlayerId: Number(form.mostFoursPlayerId),
      mostCatchesPlayerId: Number(form.mostCatchesPlayerId),
      manOfMatchPlayerId: Number(form.manOfMatchPlayerId),
      longestSixPlayerId: Number(form.longestSixPlayerId),
      bestStrikerPlayerId: Number(form.bestStrikerPlayerId),
      predictedTeam1Score: Number(form.predictedTeam1Score),
      predictedTeam2Score: Number(form.predictedTeam2Score)
    };

    setSaving(true);
    setError(null);

    try {
      const savedPrediction = prediction
        ? await predictionService.updatePrediction(token, match.id, payload)
        : await predictionService.createPrediction(token, payload);
      setPrediction(savedPrediction);
      setForm(toFormState(savedPrediction));
      setSuccessMessage(prediction ? "Prediction updated successfully." : "Prediction created successfully.");
    } catch (nextError) {
      if (nextError instanceof ApiError) {
        setError(nextError.message);
      } else if (nextError instanceof Error) {
        setError(nextError.message);
      } else {
        setError("Failed to save prediction");
      }
    } finally {
      setSaving(false);
    }
  }

  function renderPlayerSelect(label: string, field: keyof PredictionFormState) {
    return (
      <label className="field">
        <span className="field__label">{label}</span>
        <select className="input" value={form[field]} onChange={(event: ChangeEvent<HTMLSelectElement>) => updateField(field, event.target.value)} required disabled={loading || saving || formLocked}>
          <option value="">Select player</option>
          {playerOptions.map((player) => (
            <option key={`${field}-${player.id}`} value={player.id}>{player.fullName} ({player.teamCode})</option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <section className="card stack" data-testid="prediction-panel">
      <div className="stack stack--tight">
        <div>
          <p className="pill">Prediction</p>
          <h2 className="section-title">Make your match prediction</h2>
          <p className="muted">Predictions can be created or updated only before the match starts. Team and player selections are always validated on the backend.</p>
        </div>
        {prediction ? <div className="inline-summary inline-summary--success"><strong>{prediction.isLocked ? "Prediction submitted" : "Prediction ready"}</strong><span>Last updated {formatDate(prediction.updatedAt)} • {match.team1.code} {prediction.predictedTeam1Score} / {match.team2.code} {prediction.predictedTeam2Score}</span></div> : null}
        {formLocked ? <div className="inline-summary inline-summary--warning"><strong>Prediction closed for this match</strong><span>{lockMessage}</span></div> : null}
      </div>
      {loading ? <p className="muted">Loading your prediction...</p> : null}
      {!loading ? (
        <form className="prediction-form" onSubmit={handleSubmit}>
          <fieldset className="prediction-form__fieldset" disabled={loading || saving || formLocked}>
            <div className="stack">
              <section className="form-section">
                <div>
                  <h3 className="section-title">Team predictions</h3>
                  <p className="muted">Pick the winning side and toss outcome.</p>
                </div>
                <div className="prediction-form__grid">
                  <label className="field">
                    <span className="field__label">Match winner</span>
                    <select className="input" value={form.predictedWinnerTeamId} onChange={(event) => updateField("predictedWinnerTeamId", event.target.value)} required>
                      <option value="">Select team</option>
                      {teamOptions.map((team) => <option key={`winner-${team.id}`} value={team.id}>{team.name}</option>)}
                    </select>
                  </label>
                  <label className="field">
                    <span className="field__label">Toss winner</span>
                    <select className="input" value={form.predictedTossWinnerTeamId} onChange={(event) => updateField("predictedTossWinnerTeamId", event.target.value)} required>
                      <option value="">Select team</option>
                      {teamOptions.map((team) => <option key={`toss-${team.id}`} value={team.id}>{team.name}</option>)}
                    </select>
                  </label>
                </div>
              </section>
              <section className="form-section">
                <div>
                  <h3 className="section-title">Player predictions</h3>
                  <p className="muted">Choose from the official squad loaded for this match.</p>
                </div>
                <div className="prediction-form__grid">
                  {renderPlayerSelect("Highest run scorer", "highestRunScorerPlayerId")}
                  {renderPlayerSelect("Highest wicket taker", "highestWicketTakerPlayerId")}
                  {renderPlayerSelect("Most sixes", "mostSixesPlayerId")}
                  {renderPlayerSelect("Most fours", "mostFoursPlayerId")}
                  {renderPlayerSelect("Most catches", "mostCatchesPlayerId")}
                  {renderPlayerSelect("Man of the match", "manOfMatchPlayerId")}
                  {renderPlayerSelect("Longest six", "longestSixPlayerId")}
                  {renderPlayerSelect("Best striker", "bestStrikerPlayerId")}
                </div>
              </section>
              <section className="form-section">
                <div>
                  <h3 className="section-title">Score predictions</h3>
                  <p className="muted">These values feed the closeness-based scoring rules after result entry.</p>
                </div>
                <div className="prediction-form__grid">
                  <label className="field"><span className="field__label">{match.team1.code} predicted score</span><input className="input" type="number" min="0" max="300" value={form.predictedTeam1Score} onChange={(event) => updateField("predictedTeam1Score", event.target.value)} required /></label>
                  <label className="field"><span className="field__label">{match.team2.code} predicted score</span><input className="input" type="number" min="0" max="300" value={form.predictedTeam2Score} onChange={(event) => updateField("predictedTeam2Score", event.target.value)} required /></label>
                </div>
              </section>
            </div>
          </fieldset>
          {error ? <p className="error-text">{error}</p> : null}
          {successMessage ? <p className="success-text">{successMessage}</p> : null}
          <button className="button" type="submit" disabled={loading || saving || formLocked}>{saving ? "Saving prediction..." : prediction ? "Update prediction" : "Submit prediction"}</button>
        </form>
      ) : null}
    </section>
  );
}
