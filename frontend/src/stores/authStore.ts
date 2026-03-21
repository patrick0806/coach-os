// Client-only module — all cookie access is guarded by typeof document checks.
import { AUTH_TOKEN_COOKIE, AUTH_USER_COOKIE, TOKEN_TTL_MINUTES } from "@/lib/authCookies";
import type { AuthUser } from "@/types/auth.types";

// --- Types ---

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
};

type Subscriber = (state: AuthState) => void;

// User cookie lives longer than the access token so we know to attempt refresh
// even after the access token has expired. Without it, we'd call refresh on every
// public page visit — including the landing page for unauthenticated users.
const USER_TTL_MINUTES = 30 * 24 * 60; // 30 days

// --- Cookie helpers (client-only) ---

const COOKIE_DOMAIN = process.env.NEXT_PUBLIC_COOKIE_DOMAIN ?? "";

function setCookie(name: string, value: string, minutes: number): void {
  const expires = new Date(Date.now() + minutes * 60 * 1000).toUTCString();
  let cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  if (COOKIE_DOMAIN) cookie += `; domain=${COOKIE_DOMAIN}`;
  document.cookie = cookie;
}

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string): void {
  let cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  if (COOKIE_DOMAIN) cookie += `; domain=${COOKIE_DOMAIN}`;
  document.cookie = cookie;
}

// --- In-memory state ---

const state: AuthState = { accessToken: null, user: null };
const subscribers = new Set<Subscriber>();

function notify(): void {
  subscribers.forEach((fn) => fn({ ...state }));
}

// --- Store ---

export const authStore = {
  /**
   * Attempt to restore session from cookies on page load.
   *
   * Returns:
   * - `restored: true`  — full restore, no network needed
   * - `shouldRefresh: true` — user cookie exists but access token expired → try /auth/refresh
   * - both false — user is not logged in, skip refresh
   */
  init(): { restored: boolean; shouldRefresh: boolean } {
    const token = getCookieValue(AUTH_TOKEN_COOKIE);
    const userRaw = getCookieValue(AUTH_USER_COOKIE);

    if (token && userRaw) {
      try {
        state.accessToken = token;
        state.user = JSON.parse(userRaw) as AuthUser;
        return { restored: true, shouldRefresh: false };
      } catch {
        this.clear();
      }
    }

    // Access token expired but user was previously logged in — attempt refresh
    if (!token && userRaw) {
      try {
        state.user = JSON.parse(userRaw) as AuthUser;
      } catch {
        deleteCookie(AUTH_USER_COOKIE);
      }
      return { restored: false, shouldRefresh: true };
    }

    return { restored: false, shouldRefresh: false };
  },

  getToken(): string | null {
    return state.accessToken;
  },

  getUser(): AuthUser | null {
    return state.user;
  },

  isAuthenticated(): boolean {
    return !!state.accessToken;
  },

  setAuth(accessToken: string, user: AuthUser): void {
    state.accessToken = accessToken;
    state.user = user;
    // Access token cookie: short-lived (matches JWT expiry)
    setCookie(AUTH_TOKEN_COOKIE, accessToken, TOKEN_TTL_MINUTES);
    // User cookie: long-lived (used as "was logged in" indicator for refresh decisions)
    setCookie(AUTH_USER_COOKIE, JSON.stringify(user), USER_TTL_MINUTES);
    notify();
  },

  setOnboardingCompleted(): void {
    if (!state.user) return;
    state.user = { ...state.user, onboardingCompleted: true };
    setCookie(AUTH_USER_COOKIE, JSON.stringify(state.user), USER_TTL_MINUTES);
    notify();
  },

  clear(): void {
    state.accessToken = null;
    state.user = null;
    deleteCookie(AUTH_TOKEN_COOKIE);
    deleteCookie(AUTH_USER_COOKIE);
    notify();
  },

  subscribe(fn: Subscriber): () => void {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  },
};
