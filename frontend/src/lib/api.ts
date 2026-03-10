import axios from "axios";

import { clearAccessToken, getAccessToken, setAccessToken } from "@/lib/auth-token";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

let refreshPromise: Promise<string> | null = null;
let isRedirectingToBlocked = false;

interface AccessTokenPayload {
  role?: "PERSONAL" | "STUDENT" | "ADMIN";
  personalSlug?: string | null;
}

function decodeAccessTokenPayload(token: string): AccessTokenPayload | null {
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const normalizedPayload = payloadBase64.padEnd(Math.ceil(payloadBase64.length / 4) * 4, "=");
    const payloadJson = atob(normalizedPayload);
    return JSON.parse(payloadJson) as AccessTokenPayload;
  } catch {
    return null;
  }
}

function getStudentSlugFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/([^/]+)\/alunos(?:\/|$)/);
  return match?.[1] ?? null;
}

function resolveTenantBlockedRedirectPath(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const pathname = window.location.pathname;
  const payload = getAccessToken() ? decodeAccessTokenPayload(getAccessToken() as string) : null;

  if (payload?.role === "PERSONAL" || pathname.startsWith("/painel")) {
    return "/painel/bloqueado";
  }

  if (payload?.role === "STUDENT") {
    const slugFromToken = payload.personalSlug ?? null;
    if (slugFromToken) {
      return `/${slugFromToken}/alunos/bloqueado`;
    }
  }

  const slugFromPath = getStudentSlugFromPathname(pathname);
  if (slugFromPath) {
    return `/${slugFromPath}/alunos/bloqueado`;
  }

  return "/login";
}

function isTenantBlockedError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const data = error.response?.data as { error?: string; code?: string } | undefined;
  return (
    error.response?.status === 403 &&
    data?.error === "tenant_blocked" &&
    ["trial_expired", "payment_required", "subscription_inactive"].includes(data.code ?? "")
  );
}

function redirectToTenantBlockedIfNeeded() {
  if (typeof window === "undefined" || isRedirectingToBlocked) {
    return;
  }

  const destination = resolveTenantBlockedRedirectPath();
  if (!destination || window.location.pathname === destination) {
    return;
  }

  isRedirectingToBlocked = true;
  window.location.replace(destination);
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (isTenantBlockedError(error)) {
      redirectToTenantBlockedIfNeeded();
      return Promise.reject(error);
    }

    if (!axios.isAxiosError(error) || !error.config) {
      return Promise.reject(error);
    }

    const originalConfig = error.config as typeof error.config & { _retry?: boolean };
    const statusCode = error.response?.status;
    const isAuthEndpoint = (originalConfig.url ?? "").includes("/auth/");

    if (statusCode !== 401 || originalConfig._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    originalConfig._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post<{ accessToken: string }>(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            {},
            { withCredentials: true },
          )
          .then((response) => {
            setAccessToken(response.data.accessToken);
            return response.data.accessToken;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newToken = await refreshPromise;
      originalConfig.headers.Authorization = `Bearer ${newToken}`;

      return api(originalConfig);
    } catch (refreshError) {
      clearAccessToken();
      return Promise.reject(refreshError);
    }
  },
);
