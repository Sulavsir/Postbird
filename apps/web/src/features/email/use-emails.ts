import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SendEmailInput } from "@postbird/shared";
import { useAuth } from "../auth/auth-context";
import { DASHBOARD_QUERY_KEY } from "../dashboard/use-dashboard";
import { emailService } from "./email.service";

export const EMAILS_QUERY_KEY = ["emails"] as const;

export function useEmails(page = 1) {
  const { token, user } = useAuth();
  return useQuery({
    queryKey: [...EMAILS_QUERY_KEY, user?.id ?? "anon", page],
    queryFn: () => emailService.list(page),
    enabled: Boolean(token),
  });
}

export function useEmail(id: string | undefined) {
  const { token, user } = useAuth();
  return useQuery({
    queryKey: [...EMAILS_QUERY_KEY, "detail", user?.id ?? "anon", id],
    queryFn: () => emailService.get(id!),
    enabled: Boolean(token && id),
  });
}

export function useDeleteEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => emailService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EMAILS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
    },
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
