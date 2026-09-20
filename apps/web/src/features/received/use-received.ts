import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ImapSyncInput } from "@postbird/shared";
import { DASHBOARD_QUERY_KEY } from "../dashboard/use-dashboard";
import { receivedService } from "./received.service";

export const RECEIVED_QUERY_KEY = ["received-emails"] as const;

export function useReceivedEmails() {
  return useQuery({
    queryKey: RECEIVED_QUERY_KEY,
    queryFn: receivedService.list,
  });
}

export function useDeleteReceivedEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => receivedService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RECEIVED_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
    },
  });
}

export function useSyncInbox() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ImapSyncInput) => receivedService.sync(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RECEIVED_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
    },
  });
}
