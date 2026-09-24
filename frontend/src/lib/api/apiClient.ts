import type { ApiError } from "@/types";

export const API_BASE_URL = (
  import.meta.env["VITE_API_BASE_URL"] || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

/** Connect directly to live backend API */
export const USE_MOCK_API = false;

const TOKEN_KEY = "pocketsmart.token";

export function getFullApiUrl(path: string): string {
  let base = API_BASE_URL;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (base.endsWith("/api/v1") && cleanPath.startsWith("/api/v1")) {
    base = base.slice(0, -"/api/v1".length);
  }
  return `${base}${cleanPath}`;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export function toApiError(error: unknown): ApiError {
  if (error && typeof error === "object" && "message" in error) {
    const e = error as ApiError;
    return { message: e.message || "Something went wrong", status: e.status, code: e.code };
  }
  return { message: "Something went wrong" };
}

export async function apiRequest<TResponse>(
  path: string,
  options: { method?: string; body?: unknown; signal?: AbortSignal } = {},
): Promise<TResponse> {
  const token = getToken();
  const init: RequestInit = {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
  if (options.signal) init.signal = options.signal;
  if (options.body !== undefined) init.body = JSON.stringify(options.body);
  const targetUrl = getFullApiUrl(path);
  const response = await fetch(targetUrl, init);

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = (await response.json()) as { detail?: string; message?: string };
      message = data.detail ?? data.message ?? message;
    } catch {
      /* keep default message */
    }
    const error: ApiError = { message, status: response.status };
    throw error;
  }

  if (response.status === 204) return undefined as TResponse;
  return (await response.json()) as TResponse;
}
