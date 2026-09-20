export { API_PATHS } from "@postbird/shared";

export const API_BASE_URL = import.meta.env.DEV
  ? "/api"
  : (import.meta.env.VITE_API_URL ?? "/api");

export const AUTH_TOKEN_KEY = "postbird_token";

export const APP_ROUTES = {
  login: "/login",
  register: "/register",
  overview: "/",
  compose: "/compose",
  smtp: "/smtp",
  history: "/history",
  email: (id: string) => `/history/${id}`,
  inbox: "/inbox",
  attachments: "/attachments",
} as const;
