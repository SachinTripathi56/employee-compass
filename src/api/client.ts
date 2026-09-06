/**
 * Centralized API client for the FastAPI backend.
 * All network access goes through here — never fetch directly in components.
 */
import { API_BASE_URL, USE_DEMO_DATA } from "@/lib/env";
import { mockRequest } from "./mock/handler";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

/** Friendly, non-technical messages. Raw backend traces are never surfaced. */
export function friendlyMessage(status: number, fallback?: string): string {
  switch (status) {
    case 400:
      return "That request wasn't valid. Please check the details and try again.";
    case 401:
      return "Your session has expired. Please sign in again.";
    case 403:
      return "You don't have permission to view this.";
    case 404:
      return "We couldn't find what you were looking for.";
    case 409:
      return "This conflicts with existing data. Please refresh and retry.";
    case 422:
      return "Some fields need attention. Please review and try again.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    default:
      if (status >= 500) return "Something went wrong on our side. Please try again shortly.";
      return fallback || "Something went wrong. Please try again.";
  }
}

type TokenGetter = () => Promise<string | null>;

let tokenGetter: TokenGetter = async () => null;

/** Registered once by the auth provider so requests carry the Clerk token. */
export function registerTokenGetter(getter: TokenGetter) {
  tokenGetter = getter;
}

let unauthorizedHandler: (() => void) | null = null;
export function onUnauthorized(handler: () => void) {
  unauthorizedHandler = handler;
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  formData?: FormData;
  signal?: AbortSignal;
}

function buildPath(path: string, query?: RequestOptions["query"]) {
  if (!query) return path;
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? "GET";
  const fullPath = buildPath(path, options.query);

  if (USE_DEMO_DATA) {
    return mockRequest<T>(method, fullPath, options.body ?? options.formData);
  }

  const token = await tokenGetter();
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (options.body !== undefined && !options.formData) headers["Content-Type"] = "application/json";

  const init: RequestInit = { method, headers };
  const payload = options.formData ?? (options.body !== undefined ? JSON.stringify(options.body) : null);
  if (payload !== null) init.body = payload;
  if (options.signal) init.signal = options.signal;

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${fullPath}`, init);

  } catch {
    throw new ApiError(0, "We couldn't reach the server. Check your connection and try again.");
  }

  if (res.status === 401) unauthorizedHandler?.();

  if (!res.ok) {
    let details: unknown;
    try {
      details = await res.json();
    } catch {
      details = undefined;
    }
    throw new ApiError(res.status, friendlyMessage(res.status), details);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

/** Download a backend-generated file (report, export) as a blob. */
export async function apiDownload(path: string, filename: string): Promise<void> {
  if (USE_DEMO_DATA) return;
  const token = await tokenGetter();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new ApiError(res.status, friendlyMessage(res.status));
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
