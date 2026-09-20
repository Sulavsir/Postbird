export { API_PATHS } from "@postbird/shared";

export const API_BASE_URL = import.meta.env.DEV
  ? "/api"
  : (import.meta.env.VITE_API_URL ?? "/api");

export const AUTH_TOKEN_KEY = "postbird_token";
export const AUTH_USER_KEY = "postbird_user";

export const APP_ROUTES = {
  login: "/login",
  register: "/register",
  overview: "/",
  compose: "/compose",
  smtp: "/smtp",
  account: "/account",
  history: "/history",
  email: (id: string) => `/history/${id}`,
  inbox: "/inbox",
  attachments: "/attachments",
} as const;
