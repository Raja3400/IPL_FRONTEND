import { apiClient } from "../../services/apiClient";
import type { ProfileResponse, UpsertProfileRequest } from "../../types/profile";

export const profileService = {
  getProfile(token: string) {
    return apiClient.request<ProfileResponse>("/profile", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },
  saveProfile(token: string, payload: UpsertProfileRequest) {
    return apiClient.request<ProfileResponse>("/profile", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
  }
};
