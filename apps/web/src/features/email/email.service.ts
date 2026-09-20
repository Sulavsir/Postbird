import { API_PATHS, type SendEmailInput } from "@postbird/shared";
import { apiClient, apiClientWithMeta } from "../../lib/api-client";

export type { SendEmailInput };

export interface EmailRecipient {
  id: string;
  address: string;
  type: "TO" | "CC" | "BCC";
}

export interface EmailAttachment {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt?: string;
}

export interface TrackingEvent {
  id: string;
  type: "OPEN" | "CLICK";
  url: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface EmailRecord {
  id: string;
  subject: string;
  body: string;
  status: string;
  trackingId: string;
  trackOpens: boolean;
  trackClicks: boolean;
  openCount: number;
  firstOpenedAt: string | null;
  lastOpenedAt: string | null;
  sentAt: string | null;
  createdAt: string;
  recipients: EmailRecipient[];
  attachments?: EmailAttachment[];
  trackingEvents?: TrackingEvent[];
  smtpConfiguration?: {
    id?: string;
    label: string;
    provider: string;
    username?: string;
  };
}

export interface SentEmailResult {
  id: string;
  status: string;
  trackingId: string;
}

export const emailService = {
  list: (page = 1, limit = 20) =>
    apiClientWithMeta<EmailRecord[]>(
      `${API_PATHS.emails.root}?page=${page}&limit=${limit}`,
    ),
  get: (id: string) => apiClient<EmailRecord>(API_PATHS.emails.byId(id)),
  send: (input: SendEmailInput) =>
    apiClient<SentEmailResult>(API_PATHS.emails.send, {
      method: "POST",
      body: JSON.stringify(input),
    }),
};
