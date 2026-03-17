"use client";

import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState, type ReactNode } from "react";
import axios from "axios";

import { authStore } from "@/stores/authStore";
import type { AuthTokensResponse } from "@/types/auth.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

/**
 * Silently restores the auth session on page load.
 *
 * Strategy:
 * 1. Check if a valid access token cookie exists → restore from cookies (no network call).
 * 2. If not, call /auth/refresh using the http-only refresh cookie set by the backend.
 * 3. If refresh also fails, the user is treated as unauthenticated (no redirect here).
 *    Redirects are handled by route guards per page.
 */
function useSessionRestore() {
  useEffect(() => {
    // Step 1: try to restore from cookies
    const restored = authStore.init();
    if (restored) return;

    // Step 2: try to refresh using the http-only cookie
    axios
      .post<{ data: AuthTokensResponse }>(
        `${BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      )
      .then(({ data }) => {
        authStore.setAuth(data.data.accessToken, data.data.user);
      })
      .catch(() => {
        // No valid session — user is unauthenticated. Route guards handle redirects.
      });
  }, []);
}

function SessionRestorer() {
  useSessionRestore();
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
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
