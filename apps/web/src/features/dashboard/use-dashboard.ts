import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../auth/auth-context";
import { dashboardService } from "./dashboard.service";

export const DASHBOARD_QUERY_KEY = ["dashboard"] as const;

export function useDashboard() {
  const { token, user } = useAuth();
  return useQuery({
    queryKey: [...DASHBOARD_QUERY_KEY, user?.id ?? "anon"],
    queryFn: dashboardService.get,
    enabled: Boolean(token),
  });
}
