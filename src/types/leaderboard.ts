export type LeaderboardFilters = {
  country: string;
  state: string;
  city: string;
};

export type MatchLeaderboardItem = {
  rank: number;
  userId: number;
  userName: string;
  city: string | null;
  state: string | null;
  country: string | null;
  pointsAwarded: number;
  combinedScoreError: number | null;
  submittedAt: string;
  currentUser: boolean;
};

export type CurrentUserMatchRank = {
  matchId: number;
  userId: number;
  rank: number;
  pointsAwarded: number;
  combinedScoreError: number | null;
};

export type MatchLeaderboardResponse = {
  matchId: number;
  matchSummary: import("./prediction").ScoreMatchSummary;
  filtersApplied: LeaderboardFilters;
  leaderboardAvailable: boolean;
  availabilityMessage: string | null;
  totalEntries: number;
  page: number;
  size: number;
  items: MatchLeaderboardItem[];
  currentUserRank: CurrentUserMatchRank | null;
};

export type TournamentLeaderboardItem = {
  rank: number;
  userId: number;
  userName: string;
  city: string | null;
  state: string | null;
  country: string | null;
  totalPoints: number;
  matchesPredicted: number;
  matchesScored: number;
  totalCombinedScoreError: number;
  currentUser: boolean;
};

export type CurrentUserTournamentSummary = {
  userId: number;
  userName: string;
  rank: number | null;
  totalPoints: number;
  matchesPredicted: number;
  matchesScored: number;
  totalCombinedScoreError: number;
};

export type TournamentLeaderboardResponse = {
  filtersApplied: LeaderboardFilters;
  totalEntries: number;
  page: number;
  size: number;
  items: TournamentLeaderboardItem[];
  currentUserSummary: CurrentUserTournamentSummary | null;
  message: string | null;
};
