"use client";

import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useRef, useState, type ReactNode } from "react";
import axios from "axios";

import { authStore } from "@/stores/authStore";
import { studentAuthStore } from "@/stores/studentAuthStore";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

/**
 * Global session restore promise.
 * DashboardLayout awaits this before checking auth state, preventing
 * a race condition where the layout redirects to /login before refresh completes.
 */
let sessionRestorePromise: Promise<void> | null = null;

export function getSessionRestorePromise(): Promise<void> | null {
  return sessionRestorePromise;
}

/**
 * Silently restores the auth session on page load.
 *
 * Strategy:
 * 1. Check if a valid access token cookie exists → restore from cookies (no network call).
 *    This runs synchronously during render so DashboardLayout.useEffect sees the correct
 *    auth state before checking authStore.isAuthenticated().
 * 2. If not, call /auth/refresh using the http-only refresh cookie set by the backend.
 * 3. If refresh also fails, the user is treated as unauthenticated (no redirect here).
 *    Redirects are handled by route guards per page.
 */
function useSessionRestore() {
  // Step 1: run synchronously during render (not in useEffect) so in-memory auth state
  // is populated before any child component's useEffect checks authStore.isAuthenticated().
  // getCookieValue() returns null on the server side (SSR), making this SSR-safe.
  const initRef = useRef<{ restored: boolean; shouldRefresh: boolean } | null>(null);
  if (initRef.current === null) {
    initRef.current = authStore.init();
  }

  useEffect(() => {
    const { restored, shouldRefresh } = initRef.current!;
    if (restored) {
      sessionRestorePromise = Promise.resolve();
      return;
    }

    // Step 2: only call refresh if the user cookie says they were previously logged in.
    // This avoids hitting /auth/refresh on every public page visit (landing page, etc.)
    // for users who have never authenticated.
    if (!shouldRefresh) {
      sessionRestorePromise = Promise.resolve();
      return;
    }

    // Step 3: try to refresh using the http-only cookie set by the backend.
    // The refresh endpoint returns { accessToken } only (no user).
    // The user data was already restored from the long-lived user cookie in init().
    sessionRestorePromise = axios
      .post<{ accessToken: string }>(
        `${BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      )
      .then(({ data }) => {
        const currentUser = authStore.getUser();
        if (currentUser) {
          authStore.setAuth(data.accessToken, currentUser);
        }
      })
      .catch(() => {
        // Refresh failed — clear stale user cookie and treat as unauthenticated.
        authStore.clear();
      });
  }, []);
}

function SessionRestorer() {
  useSessionRestore();
  return null;
}

/**
 * Silently restores the student auth session on page load.
 * Mirrors SessionRestorer but uses studentAuthStore and student cookies.
 */
function useStudentSessionRestore() {
  const initRef = useRef<{ restored: boolean; shouldRefresh: boolean } | null>(null);
  if (initRef.current === null) {
    initRef.current = studentAuthStore.init();
  }

  useEffect(() => {
    const { restored, shouldRefresh } = initRef.current!;
    if (restored) return;
    if (!shouldRefresh) return;

    // Try to refresh student session using the http-only cookie
    axios
      .post<{ accessToken: string }>(
        `${BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      )
      .then(({ data }) => {
        const currentUser = studentAuthStore.getUser();
        if (currentUser) {
          studentAuthStore.setAuth(data.accessToken, currentUser);
        }
      })
      .catch(() => {
        studentAuthStore.clear();
      });
  }, []);
}

function StudentSessionRestorer() {
  useStudentSessionRestore();
  return null;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: (failureCount, error) => {
              // Do not retry on 401/403 — those are handled by the axios interceptor
              if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                if (status === 401 || status === 403) return false;
              }
              return failureCount < 1;
            },
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <SessionRestorer />
        <StudentSessionRestorer />
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
