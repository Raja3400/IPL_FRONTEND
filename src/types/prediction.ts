import type { MatchPlayer, TeamSummary } from "./match";

export type PredictionRequest = {
  matchId: number;
  predictedWinnerTeamId: number;
  predictedTossWinnerTeamId: number | null;
  highestRunScorerPlayerId: number;
  highestWicketTakerPlayerId: number;
  mostSixesPlayerId: number;
  mostFoursPlayerId: number;
  mostCatchesPlayerId: number;
  manOfMatchPlayerId: number;
  bestEconomyBowlerPlayerId: number;
  longestSixPlayerId?: number | null;
  bestStrikerPlayerId: number;
  predictedTeam1Score: number;
  predictedTeam2Score: number;
};

export type PredictionResponse = {
  id: number;
  matchId: number;
  matchNumber: number;
  matchStatus: string;
  matchStartTime: string;
  team1: TeamSummary;
  team2: TeamSummary;
  predictedWinnerTeam: TeamSummary;
  predictedTossWinnerTeam: TeamSummary | null;
  highestRunScorerPlayer: MatchPlayer;
  highestWicketTakerPlayer: MatchPlayer;
  mostSixesPlayer: MatchPlayer;
  mostFoursPlayer: MatchPlayer;
  mostCatchesPlayer: MatchPlayer;
  manOfMatchPlayer: MatchPlayer;
  bestEconomyBowlerPlayer: MatchPlayer;
  longestSixPlayer: MatchPlayer | null;
  bestStrikerPlayer: MatchPlayer;
  predictedTeam1Score: number;
  predictedTeam2Score: number;
  isLocked: boolean;
  isTossWinnerLocked: boolean;
  pointsAwarded: number;
  scoredAt: string | null;
  submittedAt: string;
  updatedAt: string;
};

export type ScoreBreakdownEntry = {
  predicted?: string | number | null;
  actual?: string | number | null;
  matched?: boolean;
  points: number;
  difference?: number;
  reason?: string;
  resultStatus?: string;
};

export type ScoreBreakdown = Record<string, ScoreBreakdownEntry>;

export type ScoreMatchSummary = {
  id: number;
  matchNumber: number;
  stage: string;
  status: string;
  matchStartTime: string;
  timezone: string;
  team1: TeamSummary;
  team2: TeamSummary;
  venue: {
    id: number;
    name: string;
    city: string;
    country: string | null;
  };
};

export type PredictionSelectionDetail = {
  winnerTeam: TeamSummary | null;
  tossWinnerTeam: TeamSummary | null;
  highestRunScorerPlayer: MatchPlayer | null;
  highestWicketTakerPlayer: MatchPlayer | null;
  mostSixesPlayer: MatchPlayer | null;
  mostFoursPlayer: MatchPlayer | null;
  mostCatchesPlayer: MatchPlayer | null;
  manOfMatchPlayer: MatchPlayer | null;
  bestEconomyBowlerPlayer: MatchPlayer | null;
  longestSixPlayer: MatchPlayer | null;
  bestStrikerPlayer: MatchPlayer | null;
  team1Score: number | null;
  team2Score: number | null;
};

export type ActualResultDetail = {
  resultStatus: string;
  winnerTeam: TeamSummary | null;
  tossWinnerTeam: TeamSummary | null;
  highestRunScorerPlayer: MatchPlayer | null;
  highestWicketTakerPlayer: MatchPlayer | null;
  mostSixesPlayer: MatchPlayer | null;
  mostFoursPlayer: MatchPlayer | null;
  mostCatchesPlayer: MatchPlayer | null;
  manOfMatchPlayer: MatchPlayer | null;
  bestEconomyBowlerPlayer: MatchPlayer | null;
  longestSixPlayer: MatchPlayer | null;
  bestStrikerPlayer: MatchPlayer | null;
  team1Score: number | null;
  team2Score: number | null;
};

export type PredictionScoreResponse = {
  predictionId: number;
  matchId: number;
  pointsAwarded: number;
  totalPoints: number;
  scoreBreakdown: ScoreBreakdown;
  scoredAt: string | null;
  resultStatus: string;
  matchSummary: ScoreMatchSummary;
  myPrediction: PredictionSelectionDetail;
  actualResult: ActualResultDetail;
};
