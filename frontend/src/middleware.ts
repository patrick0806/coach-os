import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { AUTH_TOKEN_COOKIE, AUTH_USER_COOKIE } from "@/lib/authCookies"
import { STUDENT_TOKEN_COOKIE, STUDENT_USER_COOKIE } from "@/lib/studentAuthCookies"

const RESERVED_SUBDOMAINS = new Set(["www", "app", "admin", "api"])
const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || "coachos.com.br"

/**
 * Extract coach subdomain from hostname.
 * Returns the subdomain slug or null if not applicable.
 *
 * Examples:
 *   joao.coachos.com.br → "joao"
 *   www.coachos.com.br  → null (reserved)
 *   coachos.com.br      → null (bare domain)
 *   localhost:3000       → null (dev)
 */
function extractSubdomain(host: string): string | null {
  const hostname = host.split(":")[0]
  if (!hostname.endsWith(BASE_DOMAIN) || hostname === BASE_DOMAIN) return null
  const sub = hostname.replace(`.${BASE_DOMAIN}`, "")
  if (RESERVED_SUBDOMAINS.has(sub) || sub.includes(".")) return null
  return sub
}

/**
 * Try to read personalSlug from the student_user cookie.
 * Used as fallback when there's no subdomain (dev mode).
 */
function getStudentSlugFromCookie(request: NextRequest): string | null {
  const raw = request.cookies.get(STUDENT_USER_COOKIE)?.value
  if (!raw) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(raw))
    return parsed?.personalSlug ?? null
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get("host") ?? ""
  const subdomain = extractSubdomain(host)

  // ─── Subdomain rewrite ───────────────────────────────────────────────
  // joao.coachos.com.br/aluno/treinos → /coach/joao/aluno/treinos
  // joao.coachos.com.br/login         → /coach/joao/login
  // joao.coachos.com.br/              → /coach/joao
  if (subdomain) {
    // Skip paths already under /coach/ (avoid double-rewrite)
    if (!pathname.startsWith("/coach/")) {
      const url = request.nextUrl.clone()
      url.pathname = `/coach/${subdomain}${pathname === "/" ? "" : pathname}`
      return NextResponse.rewrite(url)
    }
    return NextResponse.next()
  }

  // ─── /aluno/* fallback (dev mode, no subdomain) ─────────────────────
  // Rewrite /aluno/* → /coach/{slug}/aluno/* using slug from student cookie
  if (pathname.startsWith("/aluno")) {
    const slug = getStudentSlugFromCookie(request)
    if (slug) {
      const url = request.nextUrl.clone()
      url.pathname = `/coach/${slug}${pathname}`
      return NextResponse.rewrite(url)
    }
    // No cookie → not authenticated, redirect to home
    if (!request.cookies.has(STUDENT_TOKEN_COOKIE) && !request.cookies.has(STUDENT_USER_COOKIE)) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  // ─── Backward compat: /personais/[slug]/* → 301 ────────────────────
  const personaisMatch = pathname.match(/^\/personais\/([^/]+)(\/.*)?$/)
  if (personaisMatch) {
    const slug = personaisMatch[1]
    const rest = personaisMatch[2] ?? ""
    const isProd = host.endsWith(BASE_DOMAIN)
    if (isProd) {
      return NextResponse.redirect(
        `https://${slug}.${BASE_DOMAIN}${rest}`,
        301,
      )
    }
    // Dev: redirect to /coach/[slug]/*
    return NextResponse.redirect(
      new URL(`/coach/${slug}${rest}`, request.url),
      301,
    )
  }

  // ─── Coach auth guards ──────────────────────────────────────────────
  const hasToken = request.cookies.has(AUTH_TOKEN_COOKIE)
  const hasUser = request.cookies.has(AUTH_USER_COOKIE)

  // Protect /dashboard/** — redirect to /login if no session at all
  if (pathname.startsWith("/dashboard")) {
    if (!hasToken && !hasUser) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return NextResponse.next()
  }

  // Redirect already authenticated coaches away from auth pages
  if (
    hasToken &&
    (pathname === "/login" ||
      pathname === "/cadastro" ||
      pathname === "/esqueci-senha")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // /redefinir-senha without ?token → redirect to /login
  if (pathname === "/redefinir-senha") {
    const token = request.nextUrl.searchParams.get("token")
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
