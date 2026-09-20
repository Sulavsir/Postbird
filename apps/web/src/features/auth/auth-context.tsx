import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { AUTH_TOKEN_KEY } from "../../constants";
import type { AuthSession, AuthUser } from "./auth.service";

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  setSession: (session: AuthSession) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    window.localStorage.getItem(AUTH_TOKEN_KEY),
  );
  const [user, setUser] = useState<AuthUser | null>(null);
  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      setSession: (session) => {
        window.localStorage.setItem(AUTH_TOKEN_KEY, session.token);
        setToken(session.token);
        setUser(session.user);
      },
      logout: () => {
        window.localStorage.removeItem(AUTH_TOKEN_KEY);
        setToken(null);
        setUser(null);
      },
    }),
    [token, user],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
