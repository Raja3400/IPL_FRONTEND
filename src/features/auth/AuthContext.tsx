import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren
} from "react";
import { authService } from "./authService";
import { authStorage } from "./authStorage";
import type { MeResponse } from "../../types/auth";

type AuthStatus = "loading" | "authenticated" | "anonymous";

type AuthContextValue = {
  status: AuthStatus;
  token: string | null;
  user: MeResponse | null;
  signIn: (token: string) => Promise<void>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<MeResponse | null>(null);

  useEffect(() => {
    const existingToken = authStorage.getToken();
    if (!existingToken) {
      startTransition(() => {
        setStatus("anonymous");
        setToken(null);
        setUser(null);
      });
      return;
    }

    void authService
      .getMe(existingToken)
      .then((currentUser) => {
        startTransition(() => {
          setToken(existingToken);
          setUser(currentUser);
          setStatus("authenticated");
        });
      })
      .catch(() => {
        authStorage.clearToken();
        startTransition(() => {
          setToken(null);
          setUser(null);
          setStatus("anonymous");
        });
      });
  }, []);

  async function signIn(nextToken: string) {
    authStorage.setToken(nextToken);
    const currentUser = await authService.getMe(nextToken);
    startTransition(() => {
      setToken(nextToken);
      setUser(currentUser);
      setStatus("authenticated");
    });
  }

  function signOut() {
    void authService.signOutProvider();
    authStorage.clearToken();
    startTransition(() => {
      setToken(null);
      setUser(null);
      setStatus("anonymous");
    });
  }

  async function refreshUser() {
    const currentToken = authStorage.getToken();
    if (!currentToken) {
      startTransition(() => {
        setToken(null);
        setUser(null);
        setStatus("anonymous");
      });
      return;
    }

    const currentUser = await authService.getMe(currentToken);
    startTransition(() => {
      setToken(currentToken);
      setUser(currentUser);
      setStatus("authenticated");
    });
  }

  return <AuthContext.Provider value={{ status, token, user, signIn, signOut, refreshUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export { AuthContext };
