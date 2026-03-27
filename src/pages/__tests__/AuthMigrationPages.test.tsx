import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoginPage } from "../LoginPage";
import { VerifyOtpPage } from "../VerifyOtpPage";
import { AuthContext } from "../../features/auth/AuthContext";
import { authService } from "../../features/auth/authService";
import { firebaseAuthService } from "../../services/firebaseAuthService";

let firebaseMode = false;

vi.mock("../../features/auth/authProvider", () => ({
  isFirebaseAuthEnabled: () => firebaseMode
}));

vi.mock("../../features/auth/authService", () => ({
  authService: {
    requestOtp: vi.fn(),
    verifyOtp: vi.fn(),
    firebaseLogin: vi.fn(),
    getMe: vi.fn(),
    signOutProvider: vi.fn()
  }
}));

vi.mock("../../services/firebaseAuthService", () => ({
  firebaseAuthService: {
    prepareRecaptcha: vi.fn(),
    sendOtp: vi.fn(),
    verifyOtp: vi.fn(),
    getFirebaseIdToken: vi.fn(),
    signOut: vi.fn()
  }
}));

describe("Firebase auth migration pages", () => {
  beforeEach(() => {
    firebaseMode = false;
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the login page", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Log in with mobile OTP/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/\+919876543210/i)).toBeInTheDocument();
  });

  it("mock mode requests OTP through the existing auth service", async () => {
    const user = userEvent.setup();
    vi.mocked(authService.requestOtp).mockResolvedValue({ message: "OTP generated successfully", expiresInSeconds: 300, demoOtp: "123456" });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    await user.type(screen.getByPlaceholderText(/\+919876543210/i), "+917891234560");
    await user.click(screen.getByRole("button", { name: /Request OTP/i }));

    await waitFor(() => expect(authService.requestOtp).toHaveBeenCalledWith({ mobileNumber: "+917891234560" }));
  });

  it("firebase mode sends OTP through the firebase auth service", async () => {
    const user = userEvent.setup();
    firebaseMode = true;
    vi.mocked(firebaseAuthService.sendOtp).mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    await user.type(screen.getByPlaceholderText(/\+919876543210/i), "+917891234560");
    await user.click(screen.getByRole("button", { name: /Request OTP/i }));

    await waitFor(() => expect(firebaseAuthService.sendOtp).toHaveBeenCalledWith("+917891234560", "firebase-recaptcha-container"));
  });

  it("firebase verify flow exchanges the id token for the app JWT", async () => {
    const user = userEvent.setup();
    firebaseMode = true;
    const signIn = vi.fn().mockResolvedValue(undefined);
    const firebaseUser = { uid: "firebase-user-1" };

    vi.mocked(firebaseAuthService.verifyOtp).mockResolvedValue(firebaseUser as never);
    vi.mocked(firebaseAuthService.getFirebaseIdToken).mockResolvedValue("firebase-id-token");
    vi.mocked(authService.firebaseLogin).mockResolvedValue({
      accessToken: "app-jwt",
      tokenType: "Bearer",
      expiresInSeconds: 3600,
      userId: 1,
      mobileNumber: "+917891234560"
    });

    render(
      <MemoryRouter initialEntries={["/verify-otp?mobile=%2B917891234560"]}>
        <AuthContext.Provider value={{ status: "anonymous", token: null, user: null, signIn, signOut: vi.fn(), refreshUser: vi.fn() }}>
          <Routes>
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await user.type(screen.getByPlaceholderText(/123456/i), "741852");
    await user.click(screen.getByRole("button", { name: /Verify OTP/i }));

    await waitFor(() => expect(firebaseAuthService.verifyOtp).toHaveBeenCalledWith("741852"));
    expect(firebaseAuthService.getFirebaseIdToken).toHaveBeenCalled();
    expect(authService.firebaseLogin).toHaveBeenCalledWith({ idToken: "firebase-id-token" });
    expect(signIn).toHaveBeenCalledWith("app-jwt");
  });
});
