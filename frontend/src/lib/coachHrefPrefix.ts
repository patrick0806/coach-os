/**
 * Server-side equivalent of useCoachHref — computes href prefix from the host header.
 */
export function getCoachHrefPrefix(slug: string, host: string): string {
  const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || "coachos.com.br"
  const hostname = host.split(":")[0]
  if (hostname.endsWith(BASE_DOMAIN) && hostname !== BASE_DOMAIN) return ""
  return `/coach/${slug}`
}
