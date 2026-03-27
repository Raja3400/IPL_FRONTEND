import { apiClient } from "../../services/apiClient";
import type { ApiEnvelope } from "../../types/match";
import type { PredictionRequest, PredictionResponse, PredictionScoreResponse } from "../../types/prediction";

export const predictionService = {
  async createPrediction(token: string, payload: PredictionRequest) {
    const response = await apiClient.request<ApiEnvelope<PredictionResponse>>("/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    return response.data;
  },
  async updatePrediction(token: string, matchId: number, payload: PredictionRequest) {
    const response = await apiClient.request<ApiEnvelope<PredictionResponse>>(`/predictions/${matchId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    return response.data;
  },
  async getPredictionForMatch(token: string, matchId: number) {
    const response = await apiClient.request<ApiEnvelope<PredictionResponse>>(`/predictions/${matchId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },
  async getMyPredictions(token: string) {
    const response = await apiClient.request<ApiEnvelope<PredictionResponse[]>>("/predictions/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },
  async getPredictionScore(token: string, matchId: number) {
    const response = await apiClient.request<ApiEnvelope<PredictionScoreResponse>>(`/predictions/${matchId}/score`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
};
