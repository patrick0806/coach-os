"use client";

import { createContext, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
  subscribeToAccessToken,
} from "@/lib/auth-token";
import { logout, type LoginResponse, type UserRole } from "@/services/auth.service";

interface AuthState {
  role: UserRole | null;
  personalSlug: string | null;
}

interface AuthContextValue {
  accessToken: string | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  personalSlug: string | null;
  signIn: (payload: LoginResponse) => void;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => getAccessToken());
  const [authState, setAuthState] = useState<AuthState>({
    role: null,
    personalSlug: null,
  });

  useEffect(() => {
    return subscribeToAccessToken(setToken);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken: token,
      isAuthenticated: Boolean(token),
      role: authState.role,
      personalSlug: authState.personalSlug,
      signIn: (payload) => {
        setAccessToken(payload.accessToken);
        setAuthState({
          role: payload.role,
          personalSlug: payload.personalSlug,
        });
      },
      signOut: async () => {
        try {
          await logout();
        } finally {
          clearAccessToken();
          setAuthState({
            role: null,
            personalSlug: null,
          });
        }
      },
    }),
    [authState.personalSlug, authState.role, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
