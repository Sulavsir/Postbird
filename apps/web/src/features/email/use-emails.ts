import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SendEmailInput } from "@postbird/shared";
import { DASHBOARD_QUERY_KEY } from "../dashboard/use-dashboard";
import { emailService } from "./email.service";

export const EMAILS_QUERY_KEY = ["emails"] as const;

export function useEmails(page = 1) {
  return useQuery({
    queryKey: [...EMAILS_QUERY_KEY, page],
    queryFn: () => emailService.list(page),
  });
}

export function useEmail(id: string | undefined) {
  return useQuery({
    queryKey: [...EMAILS_QUERY_KEY, "detail", id],
    queryFn: () => emailService.get(id!),
    enabled: Boolean(id),
  });
}

export function useSendEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SendEmailInput) => emailService.send(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EMAILS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
    },
  });
}
