// Client-only module.
import axios, { type InternalAxiosRequestConfig } from "axios";

import { authStore } from "@/stores/authStore";
import type { AuthTokensResponse } from "@/types/auth.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // sends http-only refresh cookie automatically
  headers: { "Content-Type": "application/json" },
});

// --- Request interceptor: attach access token ---

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = authStore.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response interceptor: auto-refresh on 401 ---
//
// Uses a queue to handle concurrent requests that fail with 401:
// - First failure triggers a single refresh call.
// - All other failures while refresh is in-flight are queued.
// - After refresh, queued requests are replayed with the new token.
// - If refresh fails, all queued requests are rejected and user is redirected.

type FailedRequest = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

function flushQueue(error: unknown, token: string | null): void {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token!)
  );
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only handle 401 and only retry once per request
    if (error.response?.status !== 401 || original?._retry) {
      return Promise.reject(error);
    }

    // Skip refresh for auth endpoints — 401 here means invalid credentials, not expired token
    const authPaths = ["/auth/login", "/auth/register", "/auth/refresh"];
    if (authPaths.some((path) => original?.url?.includes(path))) {
      return Promise.reject(error);
    }

    // If a refresh is already in flight, queue this request
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      // Use a plain axios call (not the api instance) to avoid interceptor loops
      const { data } = await axios.post<{ data: AuthTokensResponse }>(
        `${BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const { accessToken, user } = data.data;
      authStore.setAuth(accessToken, user);
      flushQueue(null, accessToken);

      original.headers.Authorization = `Bearer ${accessToken}`;
      return api(original);
    } catch (refreshError) {
      flushQueue(refreshError, null);
      authStore.clear();

      // Redirect to login only on the client
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
