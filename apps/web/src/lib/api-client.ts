import { API_BASE_URL, AUTH_TOKEN_KEY } from "../constants";

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function authHeaders(): HeadersInit {
  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function expireSessionIfNeeded(path: string, status: number) {
  if (status !== 401 || path.startsWith("/auth/")) return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  if (window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
}

export async function apiClient<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const isFormData = init?.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...authHeaders(),
      ...init?.headers,
    },
  });
  const payload = (await response.json()) as {
    success: boolean;
    data?: T;
    meta?: unknown;
    error?: { code: string; message: string };
  };
  if (!response.ok || !payload.success || payload.data === undefined) {
    expireSessionIfNeeded(path, response.status);
    throw new ApiClientError(
      payload.error?.code ?? "REQUEST_FAILED",
      payload.error?.message ?? "Request failed",
      response.status,
    );
  }
  return payload.data;
}

export async function apiClientWithMeta<T>(
  path: string,
): Promise<{ data: T; meta?: { page: number; limit: number; total: number; totalPages: number } }> {
  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const payload = (await response.json()) as {
    success: boolean;
    data?: T;
    meta?: { page: number; limit: number; total: number; totalPages: number };
    error?: { code: string; message: string };
  };
  if (!response.ok || !payload.success || payload.data === undefined) {
    expireSessionIfNeeded(path, response.status);
    throw new ApiClientError(
      payload.error?.code ?? "REQUEST_FAILED",
      payload.error?.message ?? "Request failed",
      response.status,
    );
  }
  return { data: payload.data, meta: payload.meta };
}

export async function downloadAuthenticatedFile(
  path: string,
  filename: string,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    throw new ApiClientError(
      "DOWNLOAD_FAILED",
      "Unable to download the file",
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
