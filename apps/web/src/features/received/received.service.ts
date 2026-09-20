import { API_PATHS, type ImapSyncInput } from "@postbird/shared";
import { apiClient } from "../../lib/api-client";

export interface ReceivedEmail {
  id: string;
  uid: string;
  from: string | null;
  subject: string | null;
  receivedAt: string | null;
}

export const receivedService = {
  list: () => apiClient<ReceivedEmail[]>(API_PATHS.received.root),
  sync: (input: ImapSyncInput) =>
    apiClient<{ synced: number }>(API_PATHS.received.sync, {
      method: "POST",
      body: JSON.stringify(input),
    }),
};
