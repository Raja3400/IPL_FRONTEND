import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import { predictionService } from "../features/predictions/predictionService";
import { ApiError } from "../services/apiClient";
import type { MatchDetail, MatchPlayer } from "../types/match";
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
  bestEconomyBowlerPlayerId: string;
  bestStrikerPlayerId: string;
  predictedTeam1Score: string;
  predictedTeam2Score: string;
};

type RoleKey = MatchPlayer["role"];

type PlayerPickerProps = {
  label: string;
  field: keyof PredictionFormState;
  value: string;
  options: MatchPlayer[];
  disabled: boolean;
  onChange: (field: keyof PredictionFormState, value: string) => void;
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
  bestEconomyBowlerPlayerId: "",
  bestStrikerPlayerId: "",
  predictedTeam1Score: "",
  predictedTeam2Score: ""
};

const playerPredictionFields: Array<keyof PredictionFormState> = [
  "highestRunScorerPlayerId",
  "highestWicketTakerPlayerId",
  "mostSixesPlayerId",
  "mostFoursPlayerId",
  "mostCatchesPlayerId",
  "manOfMatchPlayerId",
  "bestEconomyBowlerPlayerId",
  "bestStrikerPlayerId"
];

function RoleIcon({ role, className }: { role: RoleKey; className?: string }) {
  if (role === "BATTER") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M16.8 2.8 21.2 7.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M7.2 20.5 5 18.3 14.9 8.4 17.1 10.6 7.2 20.5Z" fill="currentColor" />
        <path d="M4.5 21.5c-.9-.9-.9-2.3 0-3.2l1.1-1.1 2.2 2.2-1.1 1.1c-.9.9-2.3.9-3.2 0Z" fill="currentColor" />
      </svg>
    );
  }

  if (role === "BOWLER") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M8 13.7c2.6-5 6.7-8.7 12.2-10.7-1 2.7-2.5 4.9-4.4 6.6 1.8-.2 3.6.1 5.2.8-1.8 1.9-4 3.1-6.6 3.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8.5" cy="15.5" r="5" fill="currentColor" />
        <path d="M5.3 13.3c1.1 1.1 1.9 2.4 2.2 3.9" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M9.5 11.8c1.1 1.1 1.9 2.4 2.2 3.9" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (role === "WICKET_KEEPER") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4.5 6.2c1.8-.8 3.3-.8 4.7 0l1.1 6.8L8 20H4l-1.6-7 2.1-6.8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M19.5 6.2c-1.8-.8-3.3-.8-4.7 0L13.7 13l2.3 7H20l1.6-7-2.1-6.8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9.2 6.2 8 11.4M14.8 6.2l1.2 5.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }

  if (role === "ALL_ROUNDER") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M13.5 4.2 18 8.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M8.2 19.8 6.2 17.8l7.7-7.8 2 2.1-7.7 7.7Z" fill="currentColor" />
        <circle cx="18.2" cy="17.7" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M16.1 16.3c.7.6 1.2 1.4 1.4 2.4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    );
  }

  return <span className={className} aria-hidden="true">.</span>;
}

const roleLegend: Array<{ key: NonNullable<RoleKey>; label: string }> = [
  { key: "BATTER", label: "Batter" },
  { key: "BOWLER", label: "Bowler" },
  { key: "WICKET_KEEPER", label: "Wicket Keeper" },
  { key: "ALL_ROUNDER", label: "All-Rounder" }
];

function toFormState(prediction: PredictionResponse): PredictionFormState {
  return {
    predictedWinnerTeamId: String(prediction.predictedWinnerTeam.id),
    predictedTossWinnerTeamId: prediction.predictedTossWinnerTeam ? String(prediction.predictedTossWinnerTeam.id) : "",
    highestRunScorerPlayerId: String(prediction.highestRunScorerPlayer.id),
    highestWicketTakerPlayerId: String(prediction.highestWicketTakerPlayer.id),
    mostSixesPlayerId: String(prediction.mostSixesPlayer.id),
    mostFoursPlayerId: String(prediction.mostFoursPlayer.id),
    mostCatchesPlayerId: String(prediction.mostCatchesPlayer.id),
    manOfMatchPlayerId: String(prediction.manOfMatchPlayer.id),
    bestEconomyBowlerPlayerId: String((prediction.bestEconomyBowlerPlayer ?? prediction.longestSixPlayer).id),
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

function getRoleShortLabel(role: RoleKey) {
  switch (role) {
    case "BATTER":
      return "BAT";
    case "BOWLER":
      return "BOWL";
    case "WICKET_KEEPER":
      return "WK";
    case "ALL_ROUNDER":
      return "AR";
    default:
      return "ROLE";
  }
}

function getRoleDisplayLabel(role: RoleKey) {
  switch (role) {
    case "BATTER":
      return "Batter";
    case "BOWLER":
      return "Bowler";
    case "WICKET_KEEPER":
      return "Wicket Keeper";
    case "ALL_ROUNDER":
      return "All-Rounder";
    default:
      return "Role not specified";
  }
}

function resolveMatchStartTimestamp(match: MatchDetail) {
  if (match.timezone === "Asia/Kolkata" || match.timezone === "Asia/Calcutta") {
    return Date.parse(`${match.matchStartTime}+05:30`);
  }
  return Date.parse(match.matchStartTime);
}

function PlayerPicker({ label, field, value, options, disabled, onChange }: PlayerPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const selectedPlayer = value ? options.find((player) => String(player.id) === value) ?? null : null;
  const listboxId = `${field}-listbox`;

  const filteredOptions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return options;
    }

    return options.filter((player) => {
      const searchableValue = `${player.fullName} ${player.teamCode} ${getRoleDisplayLabel(player.role)} ${getRoleShortLabel(player.role)}`.toLowerCase();
      return searchableValue.includes(normalizedQuery);
    });
  }, [options, searchQuery]);

  useEffect(() => {
    if (disabled && open) {
      setOpen(false);
      setSearchQuery("");
    }
  }, [disabled, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    }, 0);

    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setSearchQuery("");
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setSearchQuery("");
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleToggle() {
    if (open) {
      setOpen(false);
      setSearchQuery("");
      return;
    }

    setOpen(true);
    setSearchQuery("");
  }

  function handleSelect(playerId: string) {
    onChange(field, playerId);
    setOpen(false);
    setSearchQuery("");
  }

  return (
    <div className="field player-picker" ref={rootRef}>
      <span className="field__label">{label}</span>
      <button
        type="button"
        className={`input player-picker__trigger${open ? " player-picker__trigger--open" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${selectedPlayer ? `${selectedPlayer.fullName}, ${selectedPlayer.teamCode}, ${getRoleDisplayLabel(selectedPlayer.role)}` : "Select player"}`}
        aria-controls={listboxId}
        onClick={handleToggle}
        disabled={disabled}
      >
        {selectedPlayer ? (
          <span className="player-picker__trigger-content">
            <span className="player-picker__trigger-icon-wrap">
              <RoleIcon role={selectedPlayer.role} className="player-picker__trigger-icon" />
            </span>
            <span className="player-picker__trigger-copy">
              <strong>{selectedPlayer.fullName}</strong>
              <span>{selectedPlayer.teamCode} - {getRoleDisplayLabel(selectedPlayer.role)}</span>
            </span>
          </span>
        ) : (
          <span className="player-picker__placeholder">Select player</span>
        )}
        <span className="player-picker__chevron" aria-hidden="true">v</span>
      </button>
      {open ? (
        <div className="player-picker__dropdown" role="presentation">
          <div className="player-picker__search-shell">
            <input
              ref={searchInputRef}
              className="input player-picker__search-input"
              type="text"
              inputMode="search"
              autoComplete="off"
              placeholder="Search player or team"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label={`${label} search`}
            />
          </div>
          <ul className="player-picker__list" role="listbox" id={listboxId} aria-label={label}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((player) => {
                const isSelected = String(player.id) === value;
                return (
                  <li key={`${field}-${player.id}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={`player-picker__option${isSelected ? " player-picker__option--selected" : ""}`}
                      onClick={() => handleSelect(String(player.id))}
                    >
                      <span className="player-picker__option-icon-wrap" aria-hidden="true">
                        <RoleIcon role={player.role} className="player-picker__option-icon" />
                      </span>
                      <span className="player-picker__option-copy">
                        <strong>{player.fullName}</strong>
                        <span>{player.teamCode} - {getRoleDisplayLabel(player.role)}</span>
                      </span>
                      <span className="player-picker__option-tag">{getRoleShortLabel(player.role)}</span>
                    </button>
                  </li>
                );
              })
            ) : (
              <li>
                <div className="player-picker__empty-state">No players found for &quot;{searchQuery}&quot;.</div>
              </li>
            )}
          </ul>
        </div>
      ) : null}
      {selectedPlayer ? (
        <span className="player-choice-preview">
          <span className="player-choice-preview__icon-wrap">
            <RoleIcon role={selectedPlayer.role} className="player-choice-preview__icon" />
          </span>
          <span className="player-choice-preview__body">
            <strong>{selectedPlayer.fullName}</strong>
            <span>{selectedPlayer.teamCode} - {getRoleDisplayLabel(selectedPlayer.role)}</span>
          </span>
        </span>
      ) : null}
    </div>
  );
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
  const tossLockTimestamp = resolveMatchStartTimestamp(match) - (30 * 60 * 1000);
  const tossWinnerLocked = formLocked || prediction?.isTossWinnerLocked || Date.now() >= tossLockTimestamp;
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
    if (error) {
      setError(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }

    if (!form.predictedWinnerTeamId || !form.predictedTeam1Score || !form.predictedTeam2Score || playerPredictionFields.some((field) => !form[field])) {
      setError("Please complete all team, player, and score predictions before submitting.");
      return;
    }

    if (!tossWinnerLocked && !form.predictedTossWinnerTeamId) {
      setError("Please choose the toss winner before the toss prediction window closes.");
      return;
    }

    const payload: PredictionRequest = {
      matchId: match.id,
      predictedWinnerTeamId: Number(form.predictedWinnerTeamId),
      predictedTossWinnerTeamId: form.predictedTossWinnerTeamId ? Number(form.predictedTossWinnerTeamId) : null,
      highestRunScorerPlayerId: Number(form.highestRunScorerPlayerId),
      highestWicketTakerPlayerId: Number(form.highestWicketTakerPlayerId),
      mostSixesPlayerId: Number(form.mostSixesPlayerId),
      mostFoursPlayerId: Number(form.mostFoursPlayerId),
      mostCatchesPlayerId: Number(form.mostCatchesPlayerId),
      manOfMatchPlayerId: Number(form.manOfMatchPlayerId),
      bestEconomyBowlerPlayerId: Number(form.bestEconomyBowlerPlayerId),
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
      <PlayerPicker
        label={label}
        field={field}
        value={form[field]}
        options={playerOptions}
        disabled={loading || saving || formLocked}
        onChange={updateField}
      />
    );
  }

  return (
    <section className="card stack" data-testid="prediction-panel">
      <div className="stack stack--tight">
        <div>
          <p className="pill">Prediction</p>
          <h2 className="section-title">Make your match prediction</h2>
          <p className="muted">Predictions can be created or updated only before the match starts. Toss winner closes 30 minutes earlier, while the remaining fields stay open until the scheduled start time.</p>
        </div>
        {prediction ? <div className="inline-summary inline-summary--success"><strong>{prediction.isLocked ? "Prediction submitted" : "Prediction ready"}</strong><span>Last updated {formatDate(prediction.updatedAt)} - {match.team1.code} {prediction.predictedTeam1Score} / {match.team2.code} {prediction.predictedTeam2Score}</span></div> : null}
        {formLocked ? <div className="inline-summary inline-summary--warning"><strong>Prediction closed for this match</strong><span>{lockMessage}</span></div> : null}
        {!formLocked && tossWinnerLocked ? <div className="inline-summary inline-summary--warning"><strong>Toss winner locked</strong><span>The toss winner field closes 30 minutes before match start. The remaining prediction fields are still open.</span></div> : null}
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
                    <select className="input" value={form.predictedTossWinnerTeamId} onChange={(event) => updateField("predictedTossWinnerTeamId", event.target.value)} disabled={loading || saving || tossWinnerLocked} required={!tossWinnerLocked}>
                      <option value="">Select team</option>
                      {teamOptions.map((team) => <option key={`toss-${team.id}`} value={team.id}>{team.name}</option>)}
                    </select>
                  </label>
                </div>
              </section>
              <section className="form-section">
                <div className="stack stack--tight">
                  <div>
                    <h3 className="section-title">Player predictions</h3>
                    <p className="muted">Choose from the official squad loaded for this match.</p>
                  </div>
                  <div className="role-legend" aria-label="Player role legend">
                    {roleLegend.map((item) => (
                      <span key={item.key} className="role-pill" title={item.label}>
                        <span className="role-pill__icon" aria-hidden="true">
                          <RoleIcon role={item.key} className="role-pill__icon-svg" />
                        </span>
                        <span>{item.label}</span>
                      </span>
                    ))}
                  </div>
                  <p className="muted role-legend__hint">Each player picker now opens a searchable list. On mobile, tapping a picker focuses the search box so the keyboard opens right away.</p>
                </div>
                <div className="prediction-form__grid">
                  {renderPlayerSelect("Highest run scorer", "highestRunScorerPlayerId")}
                  {renderPlayerSelect("Highest wicket taker", "highestWicketTakerPlayerId")}
                  {renderPlayerSelect("Most sixes", "mostSixesPlayerId")}
                  {renderPlayerSelect("Most fours", "mostFoursPlayerId")}
                  {renderPlayerSelect("Most catches", "mostCatchesPlayerId")}
                  {renderPlayerSelect("Man of the match", "manOfMatchPlayerId")}
                  {renderPlayerSelect("Best economical bowler", "bestEconomyBowlerPlayerId")}
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
