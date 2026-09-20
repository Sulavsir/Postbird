import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DASHBOARD_QUERY_KEY } from "../dashboard/use-dashboard";
import { attachmentService } from "./attachment.service";

export const ATTACHMENTS_QUERY_KEY = ["attachments"] as const;

export function useAttachments() {
  return useQuery({
    queryKey: ATTACHMENTS_QUERY_KEY,
    queryFn: attachmentService.list,
  });
}

export function useUploadAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => attachmentService.upload(file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ATTACHMENTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
    },
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => attachmentService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ATTACHMENTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
    },
  });
}
