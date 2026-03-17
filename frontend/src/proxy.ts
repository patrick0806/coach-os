import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { AUTH_TOKEN_COOKIE, AUTH_USER_COOKIE } from "@/lib/authCookies";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasToken = request.cookies.has(AUTH_TOKEN_COOKIE);
  const hasUser = request.cookies.has(AUTH_USER_COOKIE);

  // Protect /dashboard/** — redirect to /login if no session at all
  if (pathname.startsWith("/dashboard")) {
    if (!hasToken && !hasUser) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // hasUser (possibly expired token) — let pass, SessionRestorer handles refresh
    return NextResponse.next();
  }

  // Redirect already authenticated users away from auth pages
  if (
    hasToken &&
    (pathname === "/login" ||
      pathname === "/cadastro" ||
      pathname === "/esqueci-senha")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // /redefinir-senha without ?token → redirect to /login
  if (pathname === "/redefinir-senha") {
    const token = request.nextUrl.searchParams.get("token");
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/cadastro",
    "/esqueci-senha",
    "/redefinir-senha",
  ],
};
