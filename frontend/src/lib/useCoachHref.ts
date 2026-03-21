"use client"

import { usePathname } from "next/navigation"
import { useCallback } from "react"

/**
 * Returns a function that builds coach-context-aware hrefs.
 *
 * In subdomain mode (production):
 *   useCoachHref("joao")("/aluno/treinos") → "/aluno/treinos"
 *   useCoachHref("joao")("/login")         → "/login"
 *
 * In direct route mode (dev):
 *   useCoachHref("joao")("/aluno/treinos") → "/coach/joao/aluno/treinos"
 *   useCoachHref("joao")("/login")         → "/coach/joao/login"
 *
 * Detection: if the current pathname starts with /coach/, we're in direct mode.
 */
export function useCoachHref(slug: string) {
  const pathname = usePathname()
  const isDirectRoute = pathname.startsWith("/coach/")
  const prefix = isDirectRoute ? `/coach/${slug}` : ""

  return useCallback(
    (path: string) => `${prefix}${path}`,
    [prefix],
  )
}

/**
 * Server-side equivalent — computes href prefix from the host header.
 */
export function getCoachHrefPrefix(slug: string, host: string): string {
  const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "coachos.com.br"
  const hostname = host.split(":")[0]
  if (hostname.endsWith(BASE_DOMAIN) && hostname !== BASE_DOMAIN) return ""
  return `/coach/${slug}`
}
