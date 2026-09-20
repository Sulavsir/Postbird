import { API_PATHS } from "../../constants";
import { apiClient } from "../../lib/api-client";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
}
export interface AuthSession {
  user: AuthUser;
  token: string;
}
export const authService = {
  login: (input: { email: string; password: string }) =>
    apiClient<AuthSession>(API_PATHS.auth.login, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  register: (input: {
    email: string;
    password: string;
    displayName: string;
  }) =>
    apiClient<AuthSession>(API_PATHS.auth.register, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  me: () => apiClient<AuthUser>(API_PATHS.auth.me),
};
