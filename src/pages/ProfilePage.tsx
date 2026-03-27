import { useEffect, useMemo, useState, type FormEvent } from "react";
import { profileService } from "../features/profile/profileService";
import { useAuth } from "../features/auth/AuthContext";
import { ApiError } from "../services/apiClient";
import { INDIA_COUNTRY, INDIA_STATE_OPTIONS, buildSelectOptions, getCitiesForState } from "../lib/indiaLocations";

type ProfileFormState = {
  name: string;
  city: string;
  state: string;
  country: string;
};

const emptyForm: ProfileFormState = {
  name: "",
  city: "",
  state: "",
  country: INDIA_COUNTRY
};

export function ProfilePage() {
  const { token, refreshUser } = useAuth();
  const [form, setForm] = useState<ProfileFormState>(emptyForm);
  const [status, setStatus] = useState<"idle" | "loading" | "saving" | "saved">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    void profileService
      .getProfile(token)
      .then((profile) => {
        setForm({
          name: profile.name ?? "",
          city: profile.city ?? "",
          state: profile.state ?? "",
          country: INDIA_COUNTRY
        });
        setError(null);
        setStatus("idle");
      })
      .catch((nextError: unknown) => {
        setError(nextError instanceof Error ? nextError.message : "Failed to load profile");
        setStatus("idle");
      });
  }, [token]);

  const stateOptions = useMemo(() => buildSelectOptions(INDIA_STATE_OPTIONS, form.state), [form.state]);
  const cityOptions = useMemo(() => buildSelectOptions(getCitiesForState(form.state), form.city), [form.city, form.state]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }

    setError(null);
    setStatus("saving");

    try {
      await profileService.saveProfile(token, {
        name: form.name.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        country: INDIA_COUNTRY
      });
      await refreshUser();
      setStatus("saved");
    } catch (nextError) {
      if (nextError instanceof ApiError) {
        setError(nextError.message);
      } else if (nextError instanceof Error) {
        setError(nextError.message);
      } else {
        setError("Failed to save profile");
      }
      setStatus("idle");
    }
  }

  function updateField(field: keyof ProfileFormState, value: string) {
    setForm((current) => {
      if (field === "state") {
        const nextState = value;
        const nextCityOptions = getCitiesForState(nextState);
        const shouldClearCity = current.city ? !nextCityOptions.some((city) => city.toLowerCase() === current.city.toLowerCase()) : false;
        return { ...current, state: nextState, city: shouldClearCity ? "" : current.city };
      }

      return { ...current, [field]: value };
    });

    if (status === "saved") {
      setStatus("idle");
    }
  }

  return (
    <section className="stack">
      <div>
        <p className="pill">Profile</p>
        <h1 className="page-title">Complete your profile</h1>
        <p className="muted">Sprint 2 stores name and location fields needed for future leaderboard filtering.</p>
      </div>
      <article className="card auth-card card--narrow">
        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field__label">Name</span>
            <input className="input" value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
          </label>
          <label className="field">
            <span className="field__label">Country</span>
            <select className="input" value={form.country} onChange={(event) => updateField("country", event.target.value)} required>
              <option value={INDIA_COUNTRY}>{INDIA_COUNTRY}</option>
            </select>
          </label>
          <label className="field">
            <span className="field__label">State</span>
            <select className="input" value={form.state} onChange={(event) => updateField("state", event.target.value)} required>
              <option value="">Select a state</option>
              {stateOptions.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">City</span>
            <select className="input" value={form.city} onChange={(event) => updateField("city", event.target.value)} disabled={!form.state} required>
              <option value="">{form.state ? "Select a city" : "Select a state first"}</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>
          {error ? <p className="error-text">{error}</p> : null}
          {status === "saved" ? <p className="success-text">Profile saved successfully.</p> : null}
          <button className="button" type="submit" disabled={status === "saving" || status === "loading"}>
            {status === "saving" ? "Saving..." : "Save profile"}
          </button>
        </form>
      </article>
    </section>
  );
}
