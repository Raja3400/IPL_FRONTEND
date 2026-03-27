import { apiClient } from "../../services/apiClient";
import type { ApiEnvelope, MatchDetail, MatchListItem } from "../../types/match";

export const matchService = {
  async listMatches() {
    const response = await apiClient.request<ApiEnvelope<MatchListItem[]>>("/matches");
    return response.data;
  },
  async getMatchDetails(id: string) {
    const response = await apiClient.request<ApiEnvelope<MatchDetail>>(`/matches/${id}`);
    return response.data;
  }
};
