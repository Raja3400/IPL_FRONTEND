export type AuthProviderMode = "mock" | "firebase";

const rawProvider = (import.meta.env.VITE_AUTH_PROVIDER ?? "mock").toLowerCase();

export const authProvider: AuthProviderMode = rawProvider === "firebase" ? "firebase" : "mock";

export function isFirebaseAuthEnabled() {
  return authProvider === "firebase";
}
