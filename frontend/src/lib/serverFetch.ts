// Server-only module — uses next/headers (not available in client components).
import { cookies } from "next/headers";

import { AUTH_TOKEN_COOKIE } from "@/lib/authCookies";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

type FetchOptions = RequestInit & {
  revalidate?: number | false;
  tags?: string[];
};

/**
 * Authenticated server-side fetch.
 * Reads the access token from cookies and attaches it as Bearer.
 * Throws on non-OK responses.
 */
export async function serverFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { revalidate, tags, ...init } = options;

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...init.headers,
    },
    next: {
      ...(revalidate !== undefined && { revalidate }),
      ...(tags?.length && { tags }),
    },
  });

  if (!response.ok) {
    throw new Error(`[serverFetch] ${response.status} ${response.statusText} — ${path}`);
  }

  const json = await response.json();
  return (json.data ?? json) as T;
}

/**
 * Public server-side fetch (no auth).
 * Designed for landing page data, plans, public profiles, etc.
 * Returns null on errors instead of throwing, to avoid breaking SSR pages.
 */
export async function publicServerFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T | null> {
  const { revalidate = 3600, tags, ...init } = options;

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init.headers,
      },
      next: {
        revalidate,
        ...(tags?.length && { tags }),
      },
    });

    if (!response.ok) return null;

    const json = await response.json();
    return (json.data ?? json) as T;
  } catch {
    return null;
  }
}
