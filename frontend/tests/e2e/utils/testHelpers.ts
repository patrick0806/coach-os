import { randomUUID } from "crypto"
import type { Page, APIRequestContext } from "@playwright/test"

// =============================================================================
// Constants
// =============================================================================

export const API_URL = "http://localhost:3000/api/v1"
export const ADMIN_EMAIL = "admin@test.com"
export const ADMIN_PASSWORD = "123456"
export const SMOKE_PASSWORD = "Smoke@1234567"

// =============================================================================
// Unique data generators
// =============================================================================

export function uniqueId(): string {
  return randomUUID().slice(0, 8)
}

export function uniqueEmail(prefix = "e2e"): string {
  return `${prefix}-${uniqueId()}@e2e.test`
}

export function uniqueName(prefix = "E2E"): string {
  return `${prefix} ${uniqueId()}`
}

// =============================================================================
// Admin auth helpers
// =============================================================================

export async function loginAsAdmin(
  page: Page,
  request: APIRequestContext
): Promise<{ accessToken: string }> {
  const response = await request.post(`${API_URL}/auth/login`, {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  })
  if (!response.ok()) {
    throw new Error(`Admin login failed: ${response.status()}`)
  }
  const body = await response.json()
  const accessToken: string = body.accessToken ?? body.data?.accessToken
  const user = body.user ?? body.data?.user

  const now = Math.floor(Date.now() / 1000)
  await page.context().addCookies([
    {
      name: "coach_os_at",
      value: accessToken,
      domain: "localhost",
      path: "/",
      expires: now + 900,
    },
    {
      name: "coach_os_user",
      value: JSON.stringify(user),
      domain: "localhost",
      path: "/",
      expires: now + 30 * 24 * 3600,
    },
  ])

  return { accessToken }
}

// =============================================================================
// Coach registration (smoke)
// =============================================================================

interface RegisteredCoach {
  email: string
  password: string
  name: string
  accessToken: string
  tenantId: string
}

export async function registerCoach(
  request: APIRequestContext,
  overrides: { name?: string; email?: string } = {}
): Promise<RegisteredCoach> {
  const id = uniqueId()
  const name = overrides.name ?? `Smoke Coach ${id}`
  const email = overrides.email ?? `smoke-${id}@e2e.test`

  // Fetch first plan
  const plansResponse = await request.get(`${API_URL}/plans`)
  const plansBody = await plansResponse.json()
  const plans = Array.isArray(plansBody) ? plansBody : plansBody.content ?? []
  if (!plans.length) throw new Error("No plans available")
  const planId = plans[0].id

  const registerResponse = await request.post(`${API_URL}/auth/register`, {
    data: { name, email, password: SMOKE_PASSWORD, planId },
  })

  if (!registerResponse.ok()) {
    const body = await registerResponse.json().catch(() => ({}))
    throw new Error(`Registration failed (${registerResponse.status()}): ${JSON.stringify(body)}`)
  }

  const body = await registerResponse.json()
  const accessToken = body.accessToken ?? body.data?.accessToken
  const tenantId =
    body.user?.tenantId ??
    body.data?.user?.tenantId ??
    body.personal?.id ??
    body.data?.personal?.id

  if (!accessToken || !tenantId) {
    throw new Error(`Unexpected registration response: ${JSON.stringify(body)}`)
  }

  return { email, password: SMOKE_PASSWORD, name, accessToken, tenantId }
}

export async function injectCoachSession(
  page: Page,
  coach: RegisteredCoach
): Promise<void> {
  const user = {
    id: "smoke-user",
    name: coach.name,
    email: coach.email,
    role: "PERSONAL",
    tenantId: coach.tenantId,
  }
  const now = Math.floor(Date.now() / 1000)
  await page.context().addCookies([
    {
      name: "coach_os_at",
      value: coach.accessToken,
      domain: "localhost",
      path: "/",
      expires: now + 900,
    },
    {
      name: "coach_os_user",
      value: JSON.stringify(user),
      domain: "localhost",
      path: "/",
      expires: now + 30 * 24 * 3600,
    },
  ])

  // Pre-populate tour progress in localStorage to prevent driver.js overlay
  // from blocking interactions during smoke tests
  const ALL_TOUR_PAGES = [
    "students",
    "exercises",
    "training",
    "schedule",
    "availability",
    "services",
    "landingPage",
    "profile",
  ]
  await page.addInitScript((pages) => {
    localStorage.setItem("coach_os_tour_progress", JSON.stringify(pages))
    localStorage.setItem("coach_os_toured_pages", JSON.stringify(pages))
  }, ALL_TOUR_PAGES)

  // Also mark tour progress on the backend so server-side checks pass
  try {
    for (const tourPage of ALL_TOUR_PAGES) {
      await page.request.post(
        `${API_URL}/profile/tour-progress/${tourPage}`,
        { headers: { Authorization: `Bearer ${coach.accessToken}` } }
      ).catch(() => {})
    }
  } catch {
    // Best effort — tour progress API may not exist in all environments
  }
}

// =============================================================================
// Student creation via API
// =============================================================================

interface CreatedStudent {
  id: string
  name: string
  email: string
}

export async function createStudentViaApi(
  request: APIRequestContext,
  accessToken: string,
  overrides: { name?: string; email?: string } = {}
): Promise<CreatedStudent> {
  const name = overrides.name ?? uniqueName("Student")
  const email = overrides.email ?? uniqueEmail("student")

  const response = await request.post(`${API_URL}/students`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    data: { name, email },
  })

  if (!response.ok()) {
    const body = await response.json().catch(() => ({}))
    throw new Error(`Create student failed (${response.status()}): ${JSON.stringify(body)}`)
  }

  const body = await response.json()
  const student = body.data ?? body
  return { id: student.id, name: student.name, email: student.email }
}

// =============================================================================
// Debounce wait helper
// =============================================================================

export async function waitForDebounce(page: Page, ms = 400): Promise<void> {
  await page.waitForTimeout(ms)
}

// =============================================================================
// Double-click guard helper
// =============================================================================

export async function doubleClickButton(page: Page, selector: string): Promise<void> {
  const button = page.locator(selector).first()
  await button.click()
  await button.click({ delay: 50 })
}
