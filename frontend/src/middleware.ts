import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type UserRole = "PERSONAL" | "STUDENT" | "ADMIN";

interface AccessTokenPayload {
  role?: UserRole;
  personalSlug?: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";
const AUTH_ROUTES = new Set(["/login", "/cadastro"]);

function decodeAccessTokenPayload(token: string): AccessTokenPayload | null {
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const normalizedPayload = payloadBase64.padEnd(Math.ceil(payloadBase64.length / 4) * 4, "=");
    const payloadJson = atob(normalizedPayload);
    return JSON.parse(payloadJson) as AccessTokenPayload;
  } catch {
    return null;
  }
}

function isStudentRoute(pathname: string) {
  return /^\/(?!painel|admin)[^/]+\/alunos(?:\/|$)/.test(pathname);
}

function buildLoginRedirect(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

function getRoleHome(role: UserRole, personalSlug: string | null | undefined) {
  if (role === "PERSONAL") {
    return "/painel";
  }

  if (role === "ADMIN") {
    return "/admin";
  }

  if (personalSlug) {
    return `/${personalSlug}/alunos/painel`;
  }

  return "/login";
}

async function getSessionFromRefreshToken(request: NextRequest) {
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        Cookie: `refreshToken=${refreshToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { accessToken?: string };
    if (!data.accessToken) {
      return null;
    }

    const payload = decodeAccessTokenPayload(data.accessToken);
    if (!payload?.role) {
      return null;
    }

    return {
      accessToken: data.accessToken,
      role: payload.role,
      personalSlug: payload.personalSlug ?? null,
    };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requiresPersonal = pathname.startsWith("/painel");
  const requiresAdmin = pathname.startsWith("/admin");
  const requiresStudent = isStudentRoute(pathname);
  const isAuthRoute = AUTH_ROUTES.has(pathname);
  const isProtectedRoute = requiresPersonal || requiresAdmin || requiresStudent;

  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  const session = await getSessionFromRefreshToken(request);

  if (!session) {
    if (isProtectedRoute) {
      return buildLoginRedirect(request);
    }

    return NextResponse.next();
  }

  const roleHome = getRoleHome(session.role, session.personalSlug);

  if (isAuthRoute) {
    return NextResponse.redirect(new URL(roleHome, request.url));
  }

  if (requiresPersonal && session.role !== "PERSONAL") {
    return NextResponse.redirect(new URL(roleHome, request.url));
  }

  if (requiresAdmin && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL(roleHome, request.url));
  }

  if (requiresStudent) {
    if (session.role !== "STUDENT") {
      return NextResponse.redirect(new URL(roleHome, request.url));
    }

    const routeSlug = pathname.split("/")[1] ?? null;
    if (session.personalSlug && routeSlug !== session.personalSlug) {
      return NextResponse.redirect(new URL(roleHome, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/cadastro", "/painel/:path*", "/admin/:path*", "/:slug/alunos/:path*"],
};
