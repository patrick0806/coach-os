// Client-only module — all cookie access is guarded by typeof document checks.
import {
  STUDENT_TOKEN_COOKIE,
  STUDENT_USER_COOKIE,
  STUDENT_TOKEN_TTL_MINUTES,
} from "@/lib/studentAuthCookies"

// --- Types ---

export interface StudentUser {
  id: string
  name: string
  email: string
  role: string
  tenantId: string
  personalSlug: string
}

type StudentAuthState = {
  accessToken: string | null
  user: StudentUser | null
}

type Subscriber = (state: StudentAuthState) => void

// User cookie lives longer than the access token so we know to attempt refresh
// even after the access token has expired.
const USER_TTL_MINUTES = 30 * 24 * 60 // 30 days

// --- Cookie helpers (client-only) ---

const COOKIE_DOMAIN = process.env.NEXT_PUBLIC_COOKIE_DOMAIN ?? ""

function setCookie(name: string, value: string, minutes: number): void {
  const expires = new Date(Date.now() + minutes * 60 * 1000).toUTCString()
  let cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
  if (COOKIE_DOMAIN) cookie += `; domain=${COOKIE_DOMAIN}`
  document.cookie = cookie
}

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function deleteCookie(name: string): void {
  let cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
  if (COOKIE_DOMAIN) cookie += `; domain=${COOKIE_DOMAIN}`
  document.cookie = cookie
}

// --- In-memory state ---

const state: StudentAuthState = { accessToken: null, user: null }
const subscribers = new Set<Subscriber>()

function notify(): void {
  subscribers.forEach((fn) => fn({ ...state }))
}

// --- Store ---

export const studentAuthStore = {
  /**
   * Attempt to restore student session from cookies on page load.
   *
   * Returns:
   * - `restored: true`  — full restore, no network needed
   * - `shouldRefresh: true` — user cookie exists but access token expired → try /auth/refresh
   * - both false — student is not logged in, skip refresh
   */
  init(): { restored: boolean; shouldRefresh: boolean } {
    const token = getCookieValue(STUDENT_TOKEN_COOKIE)
    const userRaw = getCookieValue(STUDENT_USER_COOKIE)

    if (token && userRaw) {
      try {
        state.accessToken = token
        state.user = JSON.parse(userRaw) as StudentUser
        return { restored: true, shouldRefresh: false }
      } catch {
        this.clear()
      }
    }

    // Access token expired but user was previously logged in — attempt refresh
    if (!token && userRaw) {
      try {
        state.user = JSON.parse(userRaw) as StudentUser
      } catch {
        deleteCookie(STUDENT_USER_COOKIE)
      }
      return { restored: false, shouldRefresh: true }
    }

    return { restored: false, shouldRefresh: false }
  },

  getToken(): string | null {
    return state.accessToken
  },

  getUser(): StudentUser | null {
    return state.user
  },

  isAuthenticated(): boolean {
    return !!state.accessToken
  },

  setAuth(accessToken: string, user: StudentUser): void {
    state.accessToken = accessToken
    state.user = user
    // Access token cookie: short-lived (matches JWT expiry)
    setCookie(STUDENT_TOKEN_COOKIE, accessToken, STUDENT_TOKEN_TTL_MINUTES)
    // User cookie: long-lived (used as "was logged in" indicator for refresh decisions)
    setCookie(STUDENT_USER_COOKIE, JSON.stringify(user), USER_TTL_MINUTES)
    notify()
  },

  clear(): void {
    state.accessToken = null
    state.user = null
    deleteCookie(STUDENT_TOKEN_COOKIE)
    deleteCookie(STUDENT_USER_COOKIE)
    notify()
  },

  subscribe(fn: Subscriber): () => void {
    subscribers.add(fn)
    return () => subscribers.delete(fn)
  },
}
