import { API_PATHS } from "@postbird/shared";
import {
  apiClient,
  downloadAuthenticatedFile,
} from "../../lib/api-client";

export interface AttachmentSummary {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  emailId: string | null;
  createdAt: string;
}

export const attachmentService = {
  list: () => apiClient<AttachmentSummary[]>(API_PATHS.attachments.root),
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiClient<AttachmentSummary>(API_PATHS.attachments.root, {
      method: "POST",
      body: form,
      headers: {},
    });
  },
  remove: (id: string) =>
    apiClient<{ deleted: boolean }>(API_PATHS.attachments.byId(id), {
      method: "DELETE",
    }),
  download: (id: string, filename: string) =>
    downloadAuthenticatedFile(API_PATHS.attachments.download(id), filename),
};
