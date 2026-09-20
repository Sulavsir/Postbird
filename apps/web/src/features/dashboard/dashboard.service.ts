import { API_PATHS } from "@postbird/shared";
import { apiClient } from "../../lib/api-client";

export interface DashboardUser {
  id: string;
  email: string;
  displayName: string;
}

export interface DashboardEmail {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
  sentAt: string | null;
  openCount: number;
  recipients: Array<{ address: string }>;
}

export interface ReceivedEmail {
  id: string;
  from: string | null;
  subject: string | null;
  receivedAt: string | null;
}

export interface DashboardAttachment {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  emailId: string | null;
}

export interface DashboardData {
  user: DashboardUser | null;
  stats: {
    sentThisMonth: number;
    totalSent: number;
    opened: number;
    clicked: number;
    openRate: number;
    deliveryRate: number;
  };
  smtpConfigurations: Array<{
    id: string;
    provider: string;
    label: string;
    host: string;
    port: number;
    security: string;
    username: string;
    isEnabled: boolean;
    lastVerifiedAt: string | null;
  }>;
  sentEmails: DashboardEmail[];
  receivedEmails: ReceivedEmail[];
  attachments: DashboardAttachment[];
}

export const dashboardService = {
  get: () => apiClient<DashboardData>(API_PATHS.dashboard),
};
