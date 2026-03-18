import type { Page, Route } from "@playwright/test"
import { MOCK_TENANT_ID } from "../fixtures/exercises.fixtures"
import { MOCK_STUDENT_USER } from "../fixtures/studentWorkout.fixtures"

const STUDENT_TOKEN_COOKIE = "student_at"
const STUDENT_USER_COOKIE = "student_user"

// Fake credentials — safe, non-real values used only in behavioral tests
const FAKE_ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtb2NrLXVzZXIifQ.mock-sig"

export const MOCK_USER = {
  id: "mock-user-id",
  name: "Coach Test",
  email: "test@coach.com",
  role: "PERSONAL",
  tenantId: MOCK_TENANT_ID,
}

/**
 * Injects fake auth cookies so authStore.init() restores session without
 * making any network call to /auth/refresh.
 *
 * Requires both cookies (coach_os_at + coach_os_user) — when both are present,
 * authStore.init() returns restored=true and skips the refresh call entirely.
 */
export async function injectMockAuth(page: Page): Promise<void> {
  const now = Math.floor(Date.now() / 1000)
  await page.context().addCookies([
    {
      name: "coach_os_at",
      value: FAKE_ACCESS_TOKEN,
      domain: "localhost",
      path: "/",
      expires: now + 900, // 15 min
    },
    {
      name: "coach_os_user",
      value: JSON.stringify(MOCK_USER),
      domain: "localhost",
      path: "/",
      expires: now + 30 * 24 * 3600, // 30 days
    },
  ])
}

/**
 * Injects fake student auth cookies so studentAuthStore.init() restores session
 * without making any network call to /auth/refresh.
 *
 * Requires both cookies (student_at + student_user) — when both are present,
 * studentAuthStore.init() returns restored=true and skips the refresh call.
 */
export async function injectStudentMockAuth(page: Page): Promise<void> {
  const now = Math.floor(Date.now() / 1000)
  await page.context().addCookies([
    {
      name: STUDENT_TOKEN_COOKIE,
      value: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdHVkZW50LXVzZXIifQ.mock-student-sig",
      domain: "localhost",
      path: "/",
      expires: now + 900, // 15 min
    },
    {
      name: STUDENT_USER_COOKIE,
      value: JSON.stringify(MOCK_STUDENT_USER),
      domain: "localhost",
      path: "/",
      expires: now + 30 * 24 * 3600, // 30 days
    },
  ])
}

// =============================================================================
// Generic helpers
// =============================================================================

/**
 * Mocks a GET endpoint with a static response.
 */
export async function mockGet(
  page: Page,
  pattern: string,
  response: object,
  status = 200
): Promise<void> {
  await page.route(pattern, (route: Route) => {
    if (route.request().method() === "GET") {
      route.fulfill({ status, contentType: "application/json", json: response })
    } else {
      route.fallback()
    }
  })
}

/**
 * Mocks a POST endpoint with a static response.
 */
export async function mockPost(
  page: Page,
  pattern: string,
  response: object,
  status = 201
): Promise<void> {
  await page.route(pattern, (route: Route) => {
    if (route.request().method() === "POST") {
      route.fulfill({ status, contentType: "application/json", json: response })
    } else {
      route.fallback()
    }
  })
}

/**
 * Mocks a GET list endpoint with two responses:
 * - First call → initialResponse
 * - Subsequent calls → afterMutationResponse
 *
 * Covers the React Query refetch triggered by invalidateQueries after a mutation.
 */
export async function mockGetStateful(
  page: Page,
  pattern: string,
  initialResponse: object,
  afterMutationResponse: object
): Promise<void> {
  let callCount = 0
  await page.route(pattern, (route: Route) => {
    if (route.request().method() === "GET") {
      const response = callCount === 0 ? initialResponse : afterMutationResponse
      callCount++
      route.fulfill({ status: 200, contentType: "application/json", json: response })
    } else {
      route.fallback()
    }
  })
}

// =============================================================================
// Dashboard
// =============================================================================

export async function mockDashboardStats(
  page: Page,
  stats: object = { activeStudents: 0, totalStudents: 0, programTemplates: 0, activeStudentPrograms: 0 }
): Promise<void> {
  await page.route("**/api/v1/dashboard/stats*", (route: Route) => {
    if (route.request().method() === "GET") {
      route.fulfill({ status: 200, contentType: "application/json", json: stats })
    } else {
      route.fallback()
    }
  })
}

// =============================================================================
// Plans
// =============================================================================

export async function mockPlansList(page: Page, plans: object[]): Promise<void> {
  await page.route("**/api/v1/plans*", (route: Route) => {
    if (route.request().method() === "GET") {
      route.fulfill({ status: 200, contentType: "application/json", json: plans })
    } else {
      route.fallback()
    }
  })
}

// =============================================================================
// Auth
// =============================================================================

export async function mockAuthLogin(
  page: Page,
  response: object = { accessToken: FAKE_ACCESS_TOKEN, user: MOCK_USER }
): Promise<void> {
  await page.route("**/api/v1/auth/login*", (route: Route) => {
    if (route.request().method() === "POST") {
      route.fulfill({ status: 200, contentType: "application/json", json: response })
    } else {
      route.fallback()
    }
  })
}

export async function mockAuthLoginFail(page: Page): Promise<void> {
  await page.route("**/api/v1/auth/login*", (route: Route) => {
    if (route.request().method() === "POST") {
      route.fulfill({
        status: 401,
        contentType: "application/json",
        json: { message: "Credenciais inválidas", statusCode: 401 },
      })
    } else {
      route.fallback()
    }
  })
}

export async function mockPasswordResetRequest(page: Page): Promise<void> {
  await page.route("**/api/v1/auth/password-reset/request*", (route: Route) => {
    if (route.request().method() === "POST") {
      route.fulfill({ status: 200, contentType: "application/json", json: {} })
    } else {
      route.fallback()
    }
  })
}

// =============================================================================
// Exercises
// =============================================================================

export async function mockExercisesList(
  page: Page,
  response: object
): Promise<void> {
  await page.route("**/api/v1/exercises*", (route: Route) => {
    if (
      route.request().method() === "GET" &&
      !route.request().url().match(/\/exercises\/[^/?]+(?:\?|$)/)
    ) {
      route.fulfill({ status: 200, contentType: "application/json", json: response })
    } else {
      route.fallback()
    }
  })
}

export async function mockExercisesListStateful(
  page: Page,
  initialResponse: object,
  afterMutationResponse: object
): Promise<void> {
  let callCount = 0
  await page.route("**/api/v1/exercises*", (route: Route) => {
    const method = route.request().method()
    const url = route.request().url()
    const isListGet =
      method === "GET" && !url.match(/\/exercises\/[^/?]+(?:\?|$)/)

    if (isListGet) {
      const response = callCount === 0 ? initialResponse : afterMutationResponse
      callCount++
      route.fulfill({ status: 200, contentType: "application/json", json: response })
    } else {
      route.fallback()
    }
  })
}

export async function mockCreateExercise(
  page: Page,
  createdExercise: object
): Promise<void> {
  await page.route("**/api/v1/exercises", (route: Route) => {
    if (route.request().method() === "POST") {
      route.fulfill({ status: 201, contentType: "application/json", json: createdExercise })
    } else {
      route.fallback()
    }
  })
}

export async function mockUpdateExercise(
  page: Page,
  updatedExercise: object
): Promise<void> {
  await page.route("**/api/v1/exercises/**", (route: Route) => {
    if (route.request().method() === "PUT") {
      route.fulfill({ status: 200, contentType: "application/json", json: updatedExercise })
    } else {
      route.fallback()
    }
  })
}

export async function mockDeleteExercise(page: Page): Promise<void> {
  await page.route("**/api/v1/exercises/**", (route: Route) => {
    if (route.request().method() === "DELETE") {
      route.fulfill({ status: 204 })
    } else {
      route.fallback()
    }
  })
}

// =============================================================================
// Students
// =============================================================================

export async function mockStudentsList(
  page: Page,
  response: object
): Promise<void> {
  await page.route("**/api/v1/students*", (route: Route) => {
    const method = route.request().method()
    const url = route.request().url()
    const isListGet =
      method === "GET" &&
      !url.match(/\/students\/[^/?]+(?:\?|$)/) &&
      !url.includes("/invite") &&
      !url.includes("/programs")

    if (isListGet) {
      route.fulfill({ status: 200, contentType: "application/json", json: response })
    } else {
      route.fallback()
    }
  })
}

export async function mockStudentsListStateful(
  page: Page,
  initialResponse: object,
  afterMutationResponse: object
): Promise<void> {
  let callCount = 0
  await page.route("**/api/v1/students*", (route: Route) => {
    const method = route.request().method()
    const url = route.request().url()
    const isListGet =
      method === "GET" &&
      !url.match(/\/students\/[^/?]+(?:\?|$)/) &&
      !url.includes("/invite") &&
      !url.includes("/programs")

    if (isListGet) {
      const response = callCount === 0 ? initialResponse : afterMutationResponse
      callCount++
      route.fulfill({ status: 200, contentType: "application/json", json: response })
    } else {
      route.fallback()
    }
  })
}

export async function mockCreateStudent(
  page: Page,
  createdStudent: object
): Promise<void> {
  await page.route("**/api/v1/students", (route: Route) => {
    if (route.request().method() === "POST") {
      route.fulfill({ status: 201, contentType: "application/json", json: createdStudent })
    } else {
      route.fallback()
    }
  })
}

export async function mockGenerateInviteLink(
  page: Page,
  link = "http://localhost:3001/convite?token=mock-invite-token-abc123"
): Promise<void> {
  await page.route("**/api/v1/students/invite-link*", (route: Route) => {
    if (route.request().method() === "POST") {
      route.fulfill({
        status: 201,
        contentType: "application/json",
        json: { inviteLink: link },
      })
    } else {
      route.fallback()
    }
  })
}

// =============================================================================
// Program Templates
// =============================================================================

export async function mockProgramTemplatesList(
  page: Page,
  response: object
): Promise<void> {
  await page.route("**/api/v1/program-templates*", (route: Route) => {
    const method = route.request().method()
    const url = route.request().url()
    const isListGet =
      method === "GET" && !url.match(/\/program-templates\/[^/?]+(?:\?|$)/)

    if (isListGet) {
      route.fulfill({ status: 200, contentType: "application/json", json: response })
    } else {
      route.fallback()
    }
  })
}

export async function mockProgramTemplatesListStateful(
  page: Page,
  initialResponse: object,
  afterMutationResponse: object
): Promise<void> {
  let callCount = 0
  await page.route("**/api/v1/program-templates*", (route: Route) => {
    const method = route.request().method()
    const url = route.request().url()
    const isListGet =
      method === "GET" && !url.match(/\/program-templates\/[^/?]+(?:\?|$)/)

    if (isListGet) {
      const response = callCount === 0 ? initialResponse : afterMutationResponse
      callCount++
      route.fulfill({ status: 200, contentType: "application/json", json: response })
    } else {
      route.fallback()
    }
  })
}

export async function mockCreateProgramTemplate(
  page: Page,
  created: object
): Promise<void> {
  await page.route("**/api/v1/program-templates", (route: Route) => {
    if (route.request().method() === "POST") {
      route.fulfill({ status: 201, contentType: "application/json", json: created })
    } else {
      route.fallback()
    }
  })
}

export async function mockUpdateProgramTemplate(
  page: Page,
  updated: object
): Promise<void> {
  await page.route("**/api/v1/program-templates/**", (route: Route) => {
    if (route.request().method() === "PUT") {
      route.fulfill({ status: 200, contentType: "application/json", json: updated })
    } else {
      route.fallback()
    }
  })
}

export async function mockDeleteProgramTemplate(page: Page): Promise<void> {
  await page.route("**/api/v1/program-templates/**", (route: Route) => {
    if (route.request().method() === "DELETE") {
      route.fulfill({ status: 204 })
    } else {
      route.fallback()
    }
  })
}

export async function mockDuplicateProgramTemplate(
  page: Page,
  duplicated: object
): Promise<void> {
  await page.route("**/api/v1/program-templates/**/duplicate*", (route: Route) => {
    if (route.request().method() === "POST") {
      route.fulfill({ status: 201, contentType: "application/json", json: duplicated })
    } else {
      route.fallback()
    }
  })
}

export async function mockProgramTemplateDetail(
  page: Page,
  templateId: string,
  detail: object
): Promise<void> {
  await page.route(`**/api/v1/program-templates/${templateId}*`, (route: Route) => {
    if (route.request().method() === "GET") {
      route.fulfill({ status: 200, contentType: "application/json", json: detail })
    } else {
      route.fallback()
    }
  })
}

// =============================================================================
// Scheduling
// =============================================================================

export async function mockCalendar(page: Page, entries: object[]): Promise<void> {
  await page.route("**/api/v1/calendar*", (route: Route) => {
    if (route.request().method() === "GET") {
      route.fulfill({ status: 200, contentType: "application/json", json: entries })
    } else {
      route.fallback()
    }
  })
}

export async function mockAppointmentsList(page: Page, response: object): Promise<void> {
  await page.route("**/api/v1/appointments*", (route: Route) => {
    const method = route.request().method()
    const url = route.request().url()
    const isListGet =
      method === "GET" && !url.match(/\/appointments\/[^/?]+(?:\?|$)/)
    if (isListGet) {
      route.fulfill({ status: 200, contentType: "application/json", json: response })
    } else {
      route.fallback()
    }
  })
}

export async function mockCreateAppointment(page: Page, created: object): Promise<void> {
  await page.route("**/api/v1/appointments", (route: Route) => {
    if (route.request().method() === "POST") {
      route.fulfill({ status: 201, contentType: "application/json", json: created })
    } else {
      route.fallback()
    }
  })
}

export async function mockCreateAppointmentConflict(
  page: Page,
  conflicts: object[]
): Promise<void> {
  await page.route("**/api/v1/appointments", (route: Route) => {
    if (route.request().method() === "POST") {
      route.fulfill({
        status: 409,
        contentType: "application/json",
        json: {
          message: "Appointment has conflicts",
          conflicts,
        },
      })
    } else {
      route.fallback()
    }
  })
}

export async function mockAppointmentRequests(page: Page, response: object): Promise<void> {
  await page.route("**/api/v1/appointment-requests*", (route: Route) => {
    const method = route.request().method()
    const url = route.request().url()
    const isListGet =
      method === "GET" && !url.match(/\/appointment-requests\/[^/?]+(?:\?|$)/)
    if (isListGet) {
      route.fulfill({ status: 200, contentType: "application/json", json: response })
    } else {
      route.fallback()
    }
  })
}

export async function mockApproveAppointmentRequest(
  page: Page,
  created: object
): Promise<void> {
  await page.route("**/api/v1/appointment-requests/**/approve*", (route: Route) => {
    if (route.request().method() === "PATCH") {
      route.fulfill({ status: 200, contentType: "application/json", json: created })
    } else {
      route.fallback()
    }
  })
}

export async function mockRejectAppointmentRequest(page: Page): Promise<void> {
  await page.route("**/api/v1/appointment-requests/**/reject*", (route: Route) => {
    if (route.request().method() === "PATCH") {
      route.fulfill({ status: 200, contentType: "application/json", json: {} })
    } else {
      route.fallback()
    }
  })
}

export async function mockAvailabilityRules(page: Page, rules: object[]): Promise<void> {
  await page.route("**/api/v1/availability-rules*", (route: Route) => {
    const method = route.request().method()
    const url = route.request().url()
    const isListGet =
      method === "GET" && !url.match(/\/availability-rules\/[^/?]+(?:\?|$)/)
    if (isListGet) {
      route.fulfill({ status: 200, contentType: "application/json", json: rules })
    } else {
      route.fallback()
    }
  })
}

export async function mockCreateAvailabilityRule(page: Page, created: object): Promise<void> {
  await page.route("**/api/v1/availability-rules", (route: Route) => {
    if (route.request().method() === "POST") {
      route.fulfill({ status: 201, contentType: "application/json", json: created })
    } else {
      route.fallback()
    }
  })
}

export async function mockDeleteAvailabilityRule(page: Page): Promise<void> {
  await page.route("**/api/v1/availability-rules/**", (route: Route) => {
    if (route.request().method() === "DELETE") {
      route.fulfill({ status: 204 })
    } else {
      route.fallback()
    }
  })
}

export async function mockAvailabilityExceptions(
  page: Page,
  exceptions: object[]
): Promise<void> {
  await page.route("**/api/v1/availability-exceptions*", (route: Route) => {
    const method = route.request().method()
    const url = route.request().url()
    const isListGet =
      method === "GET" && !url.match(/\/availability-exceptions\/[^/?]+(?:\?|$)/)
    if (isListGet) {
      route.fulfill({ status: 200, contentType: "application/json", json: exceptions })
    } else {
      route.fallback()
    }
  })
}

export async function mockCreateAvailabilityException(
  page: Page,
  created: object
): Promise<void> {
  await page.route("**/api/v1/availability-exceptions", (route: Route) => {
    if (route.request().method() === "POST") {
      route.fulfill({ status: 201, contentType: "application/json", json: created })
    } else {
      route.fallback()
    }
  })
}

export async function mockDeleteAvailabilityException(page: Page): Promise<void> {
  await page.route("**/api/v1/availability-exceptions/**", (route: Route) => {
    if (route.request().method() === "DELETE") {
      route.fulfill({ status: 204 })
    } else {
      route.fallback()
    }
  })
}

export async function mockAvailabilityRulesStateful(
  page: Page,
  initialResponse: object[],
  afterMutationResponse: object[]
): Promise<void> {
  let callCount = 0
  await page.route("**/api/v1/availability-rules*", (route: Route) => {
    const method = route.request().method()
    const url = route.request().url()
    const isListGet =
      method === "GET" && !url.match(/\/availability-rules\/[^/?]+(?:\?|$)/)
    if (isListGet) {
      const response = callCount === 0 ? initialResponse : afterMutationResponse
      callCount++
      route.fulfill({ status: 200, contentType: "application/json", json: response })
    } else {
      route.fallback()
    }
  })
}
