import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "./dashboard.service";

export const DASHBOARD_QUERY_KEY = ["dashboard"] as const;

export function useDashboard() {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: dashboardService.get,
  });
}
