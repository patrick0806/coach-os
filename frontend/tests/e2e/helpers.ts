import { randomUUID } from "crypto";
import type { Page } from "@playwright/test";

export function generateUniqueEmail(): string {
  const id = randomUUID().slice(0, 8);
  return `e2e-${id}@test.com`;
}

export function generateUniqueName(): string {
  const id = randomUUID().slice(0, 8);
  return `E2E Student ${id}`;
}

export const TEST_PASSWORD = "Test1234";

export const TEST_USER = {
  name: "E2E Test User",
  password: TEST_PASSWORD,
};

export const DEMO_COACH_EMAIL = "coach@demo.com";
export const DEMO_COACH_PASSWORD = "Coach@123456";

const API_URL = "http://localhost:3000";

// Injects session cookies via direct API call — faster than going through the login UI
// authStore.init() on the client reads coach_os_at and coach_os_user from cookies to restore the session
export async function loginAsDemoCoach(page: Page): Promise<void> {
  const response = await page.request.post(`${API_URL}/api/v1/auth/login`, {
    data: { email: DEMO_COACH_EMAIL, password: DEMO_COACH_PASSWORD },
  });
  const body = await response.json();
  // Auth login returns { accessToken, user, personal } directly (no data wrapper)
  const { accessToken, user } = body;
  const now = Math.floor(Date.now() / 1000);
  await page.context().addCookies([
    {
      name: "coach_os_at",
      value: accessToken,
      domain: "localhost",
      path: "/",
      expires: now + 900, // 15 min
    },
    {
      name: "coach_os_user",
      value: JSON.stringify(user),
      domain: "localhost",
      path: "/",
      expires: now + 30 * 24 * 3600, // 30 days
    },
  ]);
  // The http-only refresh token cookie is set by the backend Set-Cookie header
  // in the request above via page.request (same browser context)
}
