// Client-only module — all cookie access is guarded by typeof document checks.
import { AUTH_TOKEN_COOKIE, AUTH_USER_COOKIE, TOKEN_TTL_MINUTES } from "@/lib/authCookies";
import type { AuthUser } from "@/types/auth.types";

// --- Types ---

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
};

type Subscriber = (state: AuthState) => void;

// --- Cookie helpers (client-only) ---

function setCookie(name: string, value: string, minutes: number): void {
  const expires = new Date(Date.now() + minutes * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
}

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
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
   * Returns true if a valid session was found.
   */
  init(): boolean {
    const token = getCookieValue(AUTH_TOKEN_COOKIE);
    const userRaw = getCookieValue(AUTH_USER_COOKIE);

    if (token && userRaw) {
      try {
        state.accessToken = token;
        state.user = JSON.parse(userRaw) as AuthUser;
        return true;
      } catch {
        this.clear();
      }
    }

    return false;
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
    setCookie(AUTH_TOKEN_COOKIE, accessToken, TOKEN_TTL_MINUTES);
    // Store non-sensitive user data so SSR and page refresh can restore state
    setCookie(AUTH_USER_COOKIE, JSON.stringify(user), TOKEN_TTL_MINUTES);
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
