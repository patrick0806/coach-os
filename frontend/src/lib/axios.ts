// Client-only module.
import axios, { type InternalAxiosRequestConfig } from "axios";

import { authStore } from "@/stores/authStore";
import type { RefreshTokenResponse } from "@/types/auth.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export const api = axios.create({
  baseURL: `${BASE_URL}/v1`,
  withCredentials: true, // sends http-only refresh cookie automatically
  headers: { "Content-Type": "application/json" },
});

export const apiV2 = axios.create({
  baseURL: `${BASE_URL}/v2`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// --- Shared interceptor setup ---

// Single correlation ID per browser tab — all requests share it so we can
// trace the full user session flow in Better Stack.
const sessionCorrelationId = crypto.randomUUID();

function attachAuthToken(config: InternalAxiosRequestConfig) {
  const token = authStore.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers["x-correlation-id"] = sessionCorrelationId;
  return config;
}

api.interceptors.request.use(attachAuthToken);
apiV2.interceptors.request.use(attachAuthToken);

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

function createResponseInterceptor(instance: typeof api) {
  instance.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (!axios.isAxiosError(error)) return Promise.reject(error);

      const original = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Handle 403 from blocked tenant (subscription issues)
      if (error.response?.status === 403) {
        const code = error.response?.data?.code as string | undefined;
        if (typeof window !== "undefined") {
          const reasonMap: Record<string, string> = {
            payment_required: "payment",
            trial_expired: "trial",
            subscription_inactive: "inactive",
          };
          const reason = code ? reasonMap[code] : undefined;
          if (reason) {
            window.location.href = `/assinatura/bloqueado?reason=${reason}`;
            return Promise.reject(error);
          }
        }
      }

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
          return instance(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        // Use a plain axios call (not the api instance) to avoid interceptor loops.
        // The refresh endpoint returns { accessToken } directly — no { data: ... } wrapper
        // because BuildResponseInterceptor only unwraps if the payload has a .data field.
        const { data } = await axios.post<RefreshTokenResponse>(
          `${BASE_URL}/v1/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = data;
        // Preserve the existing user — refresh only rotates the access token
        const currentUser = authStore.getUser();
        if (currentUser) {
          authStore.setAuth(accessToken, currentUser);
        }
        flushQueue(null, accessToken);

        original.headers.Authorization = `Bearer ${accessToken}`;
        return instance(original);
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
}

createResponseInterceptor(api);
createResponseInterceptor(apiV2);
