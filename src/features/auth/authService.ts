import { apiClient } from "../../services/apiClient";
import { firebaseAuthService } from "../../services/firebaseAuthService";
import { isFirebaseAuthEnabled } from "./authProvider";
import type { AuthResponse, FirebaseLoginRequest, MeResponse, RequestOtpRequest, RequestOtpResponse, VerifyOtpRequest } from "../../types/auth";

export const authService = {
  requestOtp(payload: RequestOtpRequest) {
    return apiClient.request<RequestOtpResponse>("/auth/request-otp", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  verifyOtp(payload: VerifyOtpRequest) {
    return apiClient.request<AuthResponse>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  firebaseLogin(payload: FirebaseLoginRequest) {
    return apiClient.request<AuthResponse>("/auth/firebase-login", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  getMe(token: string) {
    return apiClient.request<MeResponse>("/users/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },
  async signOutProvider() {
    if (isFirebaseAuthEnabled()) {
      await firebaseAuthService.signOut();
    }
  }
};
