import {
  API_PATHS,
  type SmtpConfigurationInput,
  type SmtpUpdateInput,
} from "@postbird/shared";
import { apiClient } from "../../lib/api-client";

export interface SmtpConfigurationSummary {
  id: string;
  provider: SmtpConfigurationInput["provider"];
  label: string;
  host: string;
  port: number;
  security: SmtpConfigurationInput["security"];
  username: string;
  isEnabled: boolean;
  hasPassword: boolean;
  lastVerifiedAt: string | null;
}

export const smtpService = {
  list: () => apiClient<SmtpConfigurationSummary[]>(API_PATHS.smtp.root),
  create: (input: SmtpConfigurationInput) =>
    apiClient<SmtpConfigurationSummary>(API_PATHS.smtp.root, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  update: (id: string, input: SmtpUpdateInput) =>
    apiClient<SmtpConfigurationSummary>(API_PATHS.smtp.byId(id), {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  remove: (id: string) =>
    apiClient<{ deleted: boolean; id: string }>(API_PATHS.smtp.byId(id), {
      method: "DELETE",
    }),
  test: (id: string) =>
    apiClient<{ verified: boolean }>(API_PATHS.smtp.test(id), {
      method: "POST",
    }),
};
