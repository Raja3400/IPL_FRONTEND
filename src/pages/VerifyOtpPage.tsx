import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import { authService } from "../features/auth/authService";
import { isFirebaseAuthEnabled } from "../features/auth/authProvider";
import { ApiError } from "../services/apiClient";
import { firebaseAuthService } from "../services/firebaseAuthService";

type VerifyLocationState = {
  demoOtp?: string | null;
  expiresInSeconds?: number;
};

export function VerifyOtpPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const mobileNumber = searchParams.get("mobile") ?? "";
  const state = (location.state ?? {}) as VerifyLocationState;
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const firebaseMode = isFirebaseAuthEnabled();

  if (!mobileNumber) {
    return <Navigate to="/login" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (firebaseMode) {
        const firebaseUser = await firebaseAuthService.verifyOtp(otp.trim());
        const idToken = await firebaseAuthService.getFirebaseIdToken(firebaseUser);
        const response = await authService.firebaseLogin({ idToken });
        await signIn(response.accessToken);
      } else {
        const response = await authService.verifyOtp({ mobileNumber, otp: otp.trim() });
        await signIn(response.accessToken);
      }
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : requestError instanceof Error ? requestError.message : "Unable to verify OTP");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-layout">
      <article className="card auth-card">
        <p className="pill">OTP verification</p>
        <h1 className="page-title">Enter your code</h1>
        <p className="muted">We requested an OTP for {mobileNumber}. Use the 6-digit code to continue.</p>
        {!firebaseMode && state.demoOtp ? (
          <div className="demo-box">
            <strong>Demo OTP:</strong> <code>{state.demoOtp}</code>
          </div>
        ) : null}
        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>OTP</span>
            <input
              className="input"
              inputMode="numeric"
              pattern="[0-9]{6}"
              placeholder="123456"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              required
            />
          </label>
          {error ? <p className="error-text">{error}</p> : null}
          <button className="button" type="submit" disabled={submitting}>
            {submitting ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </article>
    </section>
  );
}
