"use client";

import { type ReactNode } from "react";

import { QueryProvider } from "@/providers/query.provider";

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return <QueryProvider>{children}</QueryProvider>;
}
