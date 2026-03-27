import { apiClient } from "../../services/apiClient";
import type { ApiEnvelope } from "../../types/match";
import type { MatchLeaderboardResponse, LeaderboardFilters, TournamentLeaderboardResponse } from "../../types/leaderboard";

function buildQuery(filters: LeaderboardFilters, page: number, size: number) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size)
  });

  if (filters.country.trim()) {
    params.set("country", filters.country.trim());
  }
  if (filters.state.trim()) {
    params.set("state", filters.state.trim());
  }
  if (filters.city.trim()) {
    params.set("city", filters.city.trim());
  }

  return params.toString();
}

export const leaderboardService = {
  async getMatchLeaderboard(token: string, matchId: number, filters: LeaderboardFilters, page = 0, size = 20) {
    const response = await apiClient.request<ApiEnvelope<MatchLeaderboardResponse>>(
      `/leaderboards/matches/${matchId}?${buildQuery(filters, page, size)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  },
  async getTournamentLeaderboard(token: string, filters: LeaderboardFilters, page = 0, size = 20) {
    const response = await apiClient.request<ApiEnvelope<TournamentLeaderboardResponse>>(
      `/leaderboards/tournament?${buildQuery(filters, page, size)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  }
};
