import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  SmtpConfigurationInput,
  SmtpUpdateInput,
} from "@postbird/shared";
import { DASHBOARD_QUERY_KEY } from "../dashboard/use-dashboard";
import { smtpService } from "./smtp.service";

export const SMTP_QUERY_KEY = ["smtp-configurations"] as const;

function invalidateSmtp(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: SMTP_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
}

export function useSmtpConfigurations() {
  return useQuery({ queryKey: SMTP_QUERY_KEY, queryFn: smtpService.list });
}

export function useCreateSmtpConfiguration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SmtpConfigurationInput) => smtpService.create(input),
    onSuccess: () => invalidateSmtp(queryClient),
  });
}

export function useUpdateSmtpConfiguration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SmtpUpdateInput }) =>
      smtpService.update(id, input),
    onSuccess: () => invalidateSmtp(queryClient),
  });
}

export function useDeleteSmtpConfiguration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => smtpService.remove(id),
    onSuccess: () => invalidateSmtp(queryClient),
  });
}

export function useTestSmtpConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => smtpService.test(id),
    onSuccess: () => invalidateSmtp(queryClient),
  });
}
