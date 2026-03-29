// Client-only module.
import axios, { type InternalAxiosRequestConfig } from "axios"

import { studentAuthStore } from "@/stores/studentAuthStore"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

export const studentApi = axios.create({
  baseURL: `${BASE_URL}/v1`,
  withCredentials: true, // sends http-only refresh cookie automatically
  headers: { "Content-Type": "application/json" },
})

// --- Request interceptor: attach student access token ---

studentApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = studentAuthStore.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  config.headers["x-correlation-id"] = crypto.randomUUID()
  return config
})

// --- Response interceptor: auto-refresh on 401 ---
//
// Uses a queue to handle concurrent requests that fail with 401:
// - First failure triggers a single refresh call.
// - All other failures while refresh is in-flight are queued.
// - After refresh, queued requests are replayed with the new token.
// - If refresh fails, all queued requests are rejected and user is redirected.

type FailedRequest = {
  resolve: (token: string) => void
  reject: (err: unknown) => void
}

let isRefreshing = false
let failedQueue: FailedRequest[] = []

function flushQueue(error: unknown, token: string | null): void {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token!)
  )
  failedQueue = []
}

studentApi.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error)

    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // Only handle 401 and only retry once per request
    if (error.response?.status !== 401 || original?._retry) {
      return Promise.reject(error)
    }

    // Skip refresh for auth endpoints — 401 here means invalid credentials, not expired token
    const authPaths = ["/auth/login", "/auth/register", "/auth/refresh"]
    if (authPaths.some((path) => original?.url?.includes(path))) {
      return Promise.reject(error)
    }

    // If a refresh is already in flight, queue this request
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`
        return studentApi(original)
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      // Use a plain axios call (not the studentApi instance) to avoid interceptor loops.
      const { data } = await axios.post<{ accessToken: string }>(
        `${BASE_URL}/v1/auth/refresh`,
        {},
        { withCredentials: true }
      )

      const { accessToken } = data
      // Preserve the existing student user — refresh only rotates the access token
      const currentUser = studentAuthStore.getUser()
      if (currentUser) {
        studentAuthStore.setAuth(accessToken, currentUser)
      }
      flushQueue(null, accessToken)

      original.headers.Authorization = `Bearer ${accessToken}`
      return studentApi(original)
    } catch (refreshError) {
      flushQueue(refreshError, null)
      studentAuthStore.clear()

      // Redirect to home on the client when session is fully expired
      if (typeof window !== "undefined") {
        window.location.href = "/"
      }

      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)
