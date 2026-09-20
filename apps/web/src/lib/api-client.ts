import { API_BASE_URL, AUTH_TOKEN_KEY, AUTH_USER_KEY } from "../constants";

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

type ApiPayload<T> = {
  success: boolean;
  data?: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
  error?: { code: string; message: string };
};

function authHeaders(): HeadersInit {
  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function expireSessionIfNeeded(path: string, status: number) {
  if (status !== 401 || path.startsWith("/auth/")) return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
  if (
    window.location.pathname !== "/login" &&
    window.location.pathname !== "/register"
  ) {
    window.location.assign("/register");
  }
}

function htmlInsteadOfJsonMessage(status: number): string {
  const apiUrl = API_BASE_URL || "/api";
  if (status === 404) {
    return `The API was not found at ${apiUrl}. If the dashboard is on Vercel, set VITE_API_URL to your public Express URL (for example https://your-api.example.com/api) and rebuild.`;
  }
  return `The server returned a web page instead of JSON (${status}). The API may be down, or VITE_API_URL still points at the frontend.`;
}

async function readApiPayload<T>(
  response: Response,
  path: string,
): Promise<ApiPayload<T>> {
  const contentType = response.headers.get("content-type") ?? "";
  const body = await response.text();
  const looksLikeHtml =
    contentType.includes("text/html") ||
    body.trimStart().startsWith("<!") ||
    body.trimStart().startsWith("<html");

  if (looksLikeHtml) {
    expireSessionIfNeeded(path, response.status);
    throw new ApiClientError(
      "API_UNREACHABLE",
      htmlInsteadOfJsonMessage(response.status || 502),
      response.status || 502,
    );
  }

  if (!body) {
    expireSessionIfNeeded(path, response.status);
    throw new ApiClientError(
      "EMPTY_RESPONSE",
      response.ok
        ? "The API returned an empty response."
        : `Request failed (${response.status}).`,
      response.status || 502,
    );
  }

  let payload: ApiPayload<T>;
  try {
    payload = JSON.parse(body) as ApiPayload<T>;
  } catch {
    expireSessionIfNeeded(path, response.status);
    throw new ApiClientError(
      "INVALID_RESPONSE",
      `The API returned an unexpected response (${response.status || "unknown"}).`,
      response.status || 502,
    );
  }
  return payload;
}

async function requestJson(path: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...authHeaders(),
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiClientError(
      "NETWORK_ERROR",
      "Could not reach the API. Check your connection and that the backend is running.",
      0,
    );
  }
}

export async function apiClient<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await requestJson(path, init);
  const payload = await readApiPayload<T>(response, path);
  if (!response.ok || !payload.success || payload.data === undefined) {
    expireSessionIfNeeded(path, response.status);
    throw new ApiClientError(
      payload.error?.code ?? "REQUEST_FAILED",
      payload.error?.message ?? `Request failed (${response.status}).`,
      response.status,
    );
  }
  return payload.data;
}

export async function apiClientWithMeta<T>(
  path: string,
): Promise<{
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
}> {
  const response = await requestJson(path);
  const payload = await readApiPayload<T>(response, path);
  if (!response.ok || !payload.success || payload.data === undefined) {
    expireSessionIfNeeded(path, response.status);
    throw new ApiClientError(
      payload.error?.code ?? "REQUEST_FAILED",
      payload.error?.message ?? `Request failed (${response.status}).`,
      response.status,
    );
  }
  return { data: payload.data, meta: payload.meta };
}

export async function downloadAuthenticatedFile(
  path: string,
  filename: string,
): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: authHeaders(),
    });
  } catch {
    throw new ApiClientError(
      "NETWORK_ERROR",
      "Could not reach the API to download the file.",
      0,
    );
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (
    !response.ok ||
    contentType.includes("text/html")
  ) {
    throw new ApiClientError(
      "DOWNLOAD_FAILED",
      response.ok
        ? "The API returned a web page instead of the file."
        : "Unable to download the file.",
      response.status,
    );
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
