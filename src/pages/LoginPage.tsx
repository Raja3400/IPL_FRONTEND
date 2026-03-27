import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../features/auth/authService";
import { isFirebaseAuthEnabled } from "../features/auth/authProvider";
import { ApiError } from "../services/apiClient";
import { firebaseAuthService } from "../services/firebaseAuthService";

const RECAPTCHA_CONTAINER_ID = "firebase-recaptcha-container";

export function LoginPage() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const firebaseMode = isFirebaseAuthEnabled();

  useEffect(() => {
    if (firebaseMode) {
      try {
        firebaseAuthService.prepareRecaptcha(RECAPTCHA_CONTAINER_ID);
      } catch {
        // Firebase config errors are surfaced on submit for a clearer UX.
      }
    }
  }, [firebaseMode]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (firebaseMode) {
        await firebaseAuthService.sendOtp(mobileNumber.trim(), RECAPTCHA_CONTAINER_ID);
        navigate(`/verify-otp?mobile=${encodeURIComponent(mobileNumber.trim())}`);
      } else {
        const response = await authService.requestOtp({ mobileNumber: mobileNumber.trim() });
        navigate(`/verify-otp?mobile=${encodeURIComponent(mobileNumber.trim())}`, {
          state: {
            demoOtp: response.demoOtp,
            expiresInSeconds: response.expiresInSeconds
          }
        });
      }
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : requestError instanceof Error ? requestError.message : "Unable to request OTP");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-layout" style={{ position: 'relative' }}>
      {/* Cinematic background accent for login */}
      <div style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, overflow: 'hidden', zIndex: -1 }}>
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, var(--brand-secondary) 0%, transparent 60%)', opacity: 0.15, filter: 'blur(80px)', pointerEvents: 'none' }} />
      </div>

      <article className="card auth-card" style={{ backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="pill" style={{ marginBottom: '1rem' }}>Enter Arena</p>
        <h1 className="page-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Secure Login</h1>
        <p className="muted" style={{ marginBottom: '2rem' }}>
          {firebaseMode 
            ? "Enter your mobile number to receive a secure Firebase verification code and unlock your predictions." 
            : "Enter your mobile number to receive a one-time password and step into the tournament."}
        </p>

        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="field">
            <span style={{ color: 'var(--brand-primary)' }}>Mobile Number</span>
            <input
              className="input"
              type="tel"
              placeholder="+919876543210"
              value={mobileNumber}
              onChange={(event) => setMobileNumber(event.target.value)}
              required
              style={{ fontSize: '1.2rem', letterSpacing: '0.05em' }}
            />
          </label>
          
          {firebaseMode ? <div id={RECAPTCHA_CONTAINER_ID} style={{ margin: '1rem 0' }} /> : null}
          {error ? <p className="error-text" style={{ padding: '0.75rem', background: 'rgba(255,0,85,0.15)', borderLeft: '4px solid var(--brand-accent)' }}>{error}</p> : null}
          
          <button className="button" type="submit" disabled={submitting} style={{ marginTop: '1rem', width: '100%', padding: '1.2rem', fontSize: '1.1rem' }}>
            {submitting ? "Authenticating..." : "Request OTP"}
          </button>
        </form>
      </article>
    </section>
  );
}
