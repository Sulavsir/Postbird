import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { APP_ROUTES } from "../../constants";
import { useAuth } from "../../features/auth";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const location = useLocation();
  if (!token) {
    return (
      <Navigate to={APP_ROUTES.login} replace state={{ from: location.pathname }} />
    );
  }
  return children;
}
