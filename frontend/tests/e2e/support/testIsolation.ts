import { randomUUID } from "crypto"
import type { APIRequestContext } from "@playwright/test"

const API_URL = "http://localhost:3000/api/v1"

// Default plan slug for registration — the cheapest plan (Básico)
const DEFAULT_PLAN_ID_PLACEHOLDER = "WILL_BE_FETCHED_ON_FIRST_CALL"

interface IsolatedCoach {
  email: string
  password: string
  accessToken: string
  tenantId: string
}

/**
 * Fetches available plans and returns the first plan ID.
 * Used to register a new coach during smoke test setup.
 */
async function fetchFirstPlanId(request: APIRequestContext): Promise<string> {
  const response = await request.get(`${API_URL}/plans`)
  const body = await response.json()
  const plans: Array<{ id: string }> = Array.isArray(body) ? body : body.content ?? []
  if (!plans.length) {
    throw new Error("No plans available — seed data may be missing")
  }
  return plans[0].id
}

/**
 * Creates an isolated coach account for smoke tests.
 *
 * Each call registers a brand-new coach with a UUID-based email so runs
 * never share state. Data accumulates in the database but is scoped to
 * that tenant and never interferes with other coaches.
 *
 * Note: there is no delete-account API, so cleanup is intentionally omitted.
 * Smoke test data is isolated by tenantId.
 */
export async function createIsolatedCoach(
  request: APIRequestContext
): Promise<IsolatedCoach> {
  const id = randomUUID().slice(0, 8)
  const email = `smoke-${id}@e2e.test`
  const password = "Smoke@1234567"

  let planId: string
  try {
    planId = await fetchFirstPlanId(request)
  } catch {
    throw new Error(
      "Could not fetch plans — make sure the backend is running and seed data is applied"
    )
  }

  const registerResponse = await request.post(`${API_URL}/auth/register`, {
    data: {
      name: `Smoke Coach ${id}`,
      email,
      password,
      planId,
    },
  })

  if (!registerResponse.ok()) {
    const body = await registerResponse.json().catch(() => ({}))
    throw new Error(
      `Coach registration failed (${registerResponse.status()}): ${JSON.stringify(body)}`
    )
  }

  const body = await registerResponse.json()
  const accessToken: string = body.accessToken ?? body.data?.accessToken
  // In Coach OS, each personal IS the tenant — personal.id === tenantId
  const tenantId: string =
    body.user?.tenantId ??
    body.data?.user?.tenantId ??
    body.personal?.tenantId ??
    body.personal?.id ??
    body.data?.personal?.id

  if (!accessToken || !tenantId) {
    throw new Error(
      `Unexpected registration response shape: ${JSON.stringify(body)}`
    )
  }

  return { email, password, accessToken, tenantId }
}

/**
 * Injects session cookies for a real coach account.
 * Use after createIsolatedCoach() to authenticate the Playwright page.
 */
export async function injectCoachSession(
  page: import("@playwright/test").Page,
  coach: IsolatedCoach
): Promise<void> {
  const user = {
    id: "smoke-user",
    name: "Smoke Coach",
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
}

export { DEFAULT_PLAN_ID_PLACEHOLDER }
