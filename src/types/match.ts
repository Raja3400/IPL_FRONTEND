export type TeamSummary = {
  id: number;
  name: string;
  code: string;
};

export type VenueSummary = {
  id: number;
  name: string;
  city: string;
  country: string | null;
};

export type MatchListItem = {
  id: number;
  matchNumber: number;
  stage: string;
  team1: TeamSummary;
  team2: TeamSummary;
  venue: VenueSummary;
  matchStartTime: string;
  timezone: string;
  status: string;
};

export type MatchPlayer = {
  id: number;
  fullName: string;
  teamId: number;
  teamCode: string;
  role: string | null;
};

export type MatchDetail = {
  id: number;
  matchNumber: number;
  stage: string;
  status: string;
  matchStartTime: string;
  timezone: string;
  team1: TeamSummary;
  team2: TeamSummary;
  venue: VenueSummary;
  players: MatchPlayer[];
};

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};
