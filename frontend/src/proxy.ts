import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { AUTH_TOKEN_COOKIE, AUTH_USER_COOKIE } from "@/lib/authCookies";
import { STUDENT_TOKEN_COOKIE, STUDENT_USER_COOKIE } from "@/lib/studentAuthCookies";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasToken = request.cookies.has(AUTH_TOKEN_COOKIE);
  const hasUser = request.cookies.has(AUTH_USER_COOKIE);

  const hasStudentToken = request.cookies.has(STUDENT_TOKEN_COOKIE);
  const hasStudentUser = request.cookies.has(STUDENT_USER_COOKIE);

  // Protect /dashboard/** — redirect to /login if no session at all
  if (pathname.startsWith("/dashboard")) {
    if (!hasToken && !hasUser) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // hasUser (possibly expired token) — let pass, SessionRestorer handles refresh
    return NextResponse.next();
  }

  // Protect /aluno/** — redirect to / if no student session at all
  if (pathname.startsWith("/aluno")) {
    if (!hasStudentToken && !hasStudentUser) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // hasStudentUser (possibly expired token) — let pass, StudentSessionRestorer handles refresh
    return NextResponse.next();
  }

  // Redirect already authenticated coaches away from auth pages
  if (
    hasToken &&
    (pathname === "/login" ||
      pathname === "/cadastro" ||
      pathname === "/esqueci-senha")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect already authenticated students away from coach login pages
  if (hasStudentToken && pathname.match(/^\/personais\/[^/]+\/login$/)) {
    return NextResponse.redirect(new URL("/aluno/treinos", request.url));
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
    "/aluno/:path*",
    "/login",
    "/cadastro",
    "/esqueci-senha",
    "/redefinir-senha",
    "/personais/:slug/login",
  ],
};
