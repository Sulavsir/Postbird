import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "../../constants";
import { authService, type AuthSession, type AuthUser } from "./auth.service";

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  setSession: (session: AuthSession) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): AuthUser | null {
  const raw = window.localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() =>
    window.localStorage.getItem(AUTH_TOKEN_KEY),
  );
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);

  function resetQueries() {
    void queryClient.cancelQueries();
    queryClient.clear();
  }

  useEffect(() => {
    if (!token) return;
    void authService
      .me()
      .then((current) => {
        window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(current));
        setUser(current);
      })
      .catch(() => {
        /* api-client expires invalid tokens */
      });
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      setSession: (session) => {
        window.localStorage.setItem(AUTH_TOKEN_KEY, session.token);
        window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
        resetQueries();
        setToken(session.token);
        setUser(session.user);
      },
      logout: () => {
        window.localStorage.removeItem(AUTH_TOKEN_KEY);
        window.localStorage.removeItem(AUTH_USER_KEY);
        resetQueries();
        setToken(null);
        setUser(null);
      },
    }),
    [token, user, queryClient],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
