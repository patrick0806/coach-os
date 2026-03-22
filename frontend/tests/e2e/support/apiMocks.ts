import type { Page, Route } from "@playwright/test"
import { MOCK_TENANT_ID } from "../fixtures/exercises.fixtures"
import { MOCK_STUDENT_USER } from "../fixtures/studentWorkout.fixtures"

const STUDENT_TOKEN_COOKIE = "student_at"
const STUDENT_USER_COOKIE = "student_user"

// Fake credentials — safe, non-real values used only in behavioral tests
const FAKE_ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtb2NrLXVzZXIifQ.mock-sig"

/**
 * Injects fake auth cookies for a custom user object.
 * Useful for testing role/onboarding variants without duplicating cookie logic.
 * Also mocks tour-progress endpoints to prevent behavioral tests from hitting
 * the real backend when NEXT_PUBLIC_SHOW_TUTORIAL=true.
 */
export async function injectMockAuthAs(page: Page, user: object): Promise<void> {
  const now = Math.floor(Date.now() / 1000)
  await page.context().addCookies([
    {
      name: "coach_os_at",
      value: FAKE_ACCESS_TOKEN,
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
  // Populate localStorage before any React script runs so useTourProgress
  // sees all pages as completed via placeholderData. This prevents driver.js
  // from firing in behavioral tests (the tour fires when localStorage is empty
  // before the API response arrives). Onboarding tests override via mockGetTourProgress().
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
  await page.route("**/api/v1/profile/tour-progress**", (route: Route) => {
    if (route.request().method() === "GET") {
      route.fulfill({ status: 200, contentType: "application/json", json: ALL_TOUR_PAGES })
    } else if (route.request().method() === "POST") {
      route.fulfill({ status: 200, contentType: "application/json", json: ALL_TOUR_PAGES })
    } else {
      route.fallback()
    }
  })
}

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
 *
 * Also mocks tour-progress endpoints to prevent behavioral tests from hitting
 * the real backend when NEXT_PUBLIC_SHOW_TUTORIAL=true.
 */
export async function injectMockAuth(page: Page): Promise<void> {
  await injectMockAuthAs(page, MOCK_USER)
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
// Enums
// =============================================================================

const MOCK_MUSCLE_GROUPS = [
  { value: "peitoral", label: "Peitoral" },
  { value: "costas", label: "Costas" },
  { value: "ombros", label: "Ombros" },
  { value: "bíceps", label: "Bíceps" },
  { value: "tríceps", label: "Tríceps" },
  { value: "pernas", label: "Pernas" },
  { value: "glúteos", label: "Glúteos" },
  { value: "abdômen", label: "Abdômen" },
  { value: "panturrilha", label: "Panturrilha" },
  { value: "antebraço", label: "Antebraço" },
  { value: "trapézio", label: "Trapézio" },
  { value: "funcional", label: "Funcional" },
]

const MOCK_ATTENDANCE_TYPES = [
  { value: "online", label: "Online" },
  { value: "presential", label: "Presencial" },
]

export async function mockEnumMuscleGroups(page: Page): Promise<void> {
  await page.route("**/api/v1/enums/muscle-groups*", (route: Route) => {
    if (route.request().method() === "GET") {
      route.fulfill({ status: 200, contentType: "application/json", json: MOCK_MUSCLE_GROUPS })
    } else {
      route.fallback()
    }
  })
}

export async function mockEnumAttendanceTypes(page: Page): Promise<void> {
  await page.route("**/api/v1/enums/attendance-types*", (route: Route) => {
    if (route.request().method() === "GET") {
      route.fulfill({ status: 200, contentType: "application/json", json: MOCK_ATTENDANCE_TYPES })
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
  link = "http://localhost:3099/convite?token=mock-invite-token-abc123"
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

export async function mockGenerateStudentAccessLink(
  page: Page,
  link = "http://localhost:3099/convite?token=mock-access-token-abc123"
): Promise<void> {
  await page.route("**/api/v1/students/*/send-access", (route: Route) => {
    if (route.request().method() === "POST") {
      route.fulfill({
        status: 201,
        contentType: "application/json",
        json: { accessLink: link },
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

export async function mockBulkCreateAvailabilityRules(
  page: Page,
  response = { created: [{ id: "rule-new", dayOfWeek: 5, startTime: "08:00", endTime: "09:00" }], conflicts: 0 }
): Promise<void> {
  await page.route("**/api/v1/availability-rules/bulk", (route: Route) => {
    if (route.request().method() === "POST") {
      route.fulfill({ status: 201, contentType: "application/json", json: response })
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

// =============================================================================
// Service Plans
// =============================================================================

export async function mockServicePlansList(
  page: Page,
  response: object[]
): Promise<void> {
  await page.route("**/api/v1/service-plans*", (route: Route) => {
    const method = route.request().method()
    const url = route.request().url()
    const isListGet =
      method === "GET" && !url.match(/\/service-plans\/[^/?]+(?:\?|$)/)
    if (isListGet) {
      route.fulfill({ status: 200, contentType: "application/json", json: response })
    } else {
      route.fallback()
    }
  })
}

export async function mockServicePlansListStateful(
  page: Page,
  initialResponse: object[],
  afterMutationResponse: object[]
): Promise<void> {
  let callCount = 0
  await page.route("**/api/v1/service-plans*", (route: Route) => {
    const method = route.request().method()
    const url = route.request().url()
    const isListGet =
      method === "GET" && !url.match(/\/service-plans\/[^/?]+(?:\?|$)/)
    if (isListGet) {
      const response = callCount === 0 ? initialResponse : afterMutationResponse
      callCount++
      route.fulfill({ status: 200, contentType: "application/json", json: response })
    } else {
      route.fallback()
    }
  })
}

export async function mockCreateServicePlan(
  page: Page,
  createdPlan: object
): Promise<void> {
  await page.route("**/api/v1/service-plans", (route: Route) => {
    if (route.request().method() === "POST") {
      route.fulfill({ status: 201, contentType: "application/json", json: createdPlan })
    } else {
      route.fallback()
    }
  })
}

export async function mockUpdateServicePlan(
  page: Page,
  updatedPlan: object
): Promise<void> {
  await page.route("**/api/v1/service-plans/**", (route: Route) => {
    if (route.request().method() === "PUT") {
      route.fulfill({ status: 200, contentType: "application/json", json: updatedPlan })
    } else {
      route.fallback()
    }
  })
}

export async function mockDeleteServicePlan(page: Page): Promise<void> {
  await page.route("**/api/v1/service-plans/**", (route: Route) => {
    if (route.request().method() === "DELETE") {
      route.fulfill({ status: 204 })
    } else {
      route.fallback()
    }
  })
}

// =============================================================================
// Coaching Contracts
// =============================================================================

export async function mockStudentContracts(
  page: Page,
  studentId: string,
  response: object[]
): Promise<void> {
  await page.route(`**/api/v1/students/${studentId}/contracts*`, (route: Route) => {
    if (route.request().method() === "GET") {
      route.fulfill({ status: 200, contentType: "application/json", json: response })
    } else {
      route.fallback()
    }
  })
}

export async function mockStudentContractsStateful(
  page: Page,
  studentId: string,
  initialResponse: object[],
  afterMutationResponse: object[]
): Promise<void> {
  let callCount = 0
  await page.route(`**/api/v1/students/${studentId}/contracts*`, (route: Route) => {
    if (route.request().method() === "GET") {
      const response = callCount === 0 ? initialResponse : afterMutationResponse
      callCount++
      route.fulfill({ status: 200, contentType: "application/json", json: response })
    } else {
      route.fallback()
    }
  })
}

export async function mockCreateContract(
  page: Page,
  studentId: string,
  response: object
): Promise<void> {
  await page.route(`**/api/v1/students/${studentId}/contracts`, (route: Route) => {
    if (route.request().method() === "POST") {
      route.fulfill({ status: 201, contentType: "application/json", json: response })
    } else {
      route.fallback()
    }
  })
}

export async function mockCancelContract(page: Page, response: object): Promise<void> {
  await page.route("**/api/v1/coaching-contracts/**/cancel", (route: Route) => {
    if (route.request().method() === "PATCH") {
      route.fulfill({ status: 200, contentType: "application/json", json: response })
    } else {
      route.fallback()
    }
  })
}

// =============================================================================
// Profile Editor
// =============================================================================

export async function mockGetMyProfile(page: Page, profile: object): Promise<void> {
  await page.route("**/api/v1/profile*", (route: Route) => {
    const method = route.request().method()
    const url = route.request().url()
    if (method === "GET" && !url.includes("/photo/")) {
      route.fulfill({ status: 200, contentType: "application/json", json: profile })
    } else {
      route.fallback()
    }
  })
}

export async function mockGetMyProfileStateful(
  page: Page,
  initialResponse: object,
  afterMutationResponse: object
): Promise<void> {
  let callCount = 0
  await page.route("**/api/v1/profile*", (route: Route) => {
    const method = route.request().method()
    const url = route.request().url()
    if (method === "GET" && !url.includes("/photo/")) {
      const response = callCount === 0 ? initialResponse : afterMutationResponse
      callCount++
      route.fulfill({ status: 200, contentType: "application/json", json: response })
    } else {
      route.fallback()
    }
  })
}

export async function mockUpdateProfile(page: Page, updated: object): Promise<void> {
  await page.route("**/api/v1/profile", (route: Route) => {
    if (route.request().method() === "PUT") {
      route.fulfill({ status: 200, contentType: "application/json", json: updated })
    } else {
      route.fallback()
    }
  })
}

export async function mockRequestProfilePhotoUpload(
  page: Page,
  response: object = { uploadUrl: "https://s3.example.com/upload?signed=abc", fileUrl: "https://s3.example.com/profile.jpg" }
): Promise<void> {
  await page.route("**/api/v1/profile/photo/upload-url*", (route: Route) => {
    if (route.request().method() === "POST") {
      route.fulfill({ status: 200, contentType: "application/json", json: response })
    } else {
      route.fallback()
    }
  })
}

export async function mockSaveLpDraft(page: Page): Promise<void> {
  await page.route("**/api/v1/profile/lp-draft*", (route: Route) => {
    if (route.request().method() === "PUT") {
      route.fulfill({ status: 200, contentType: "application/json", json: {} })
    } else {
      route.fallback()
    }
  })
}

export async function mockPublishLpDraft(page: Page): Promise<void> {
  await page.route("**/api/v1/profile/lp/publish*", (route: Route) => {
    if (route.request().method() === "POST") {
      route.fulfill({ status: 200, contentType: "application/json", json: {} })
    } else {
      route.fallback()
    }
  })
}

// =============================================================================
// Student Portal — Checkins
// =============================================================================

export async function mockStudentMyCheckins(page: Page, response: object): Promise<void> {
  await page.route("**/api/v1/me/progress-checkins*", (route: Route) => {
    if (route.request().method() === "GET") {
      route.fulfill({ status: 200, contentType: "application/json", json: response })
    } else {
      route.fallback()
    }
  })
}

export async function mockStudentMyCheckinsStateful(
  page: Page,
  initialResponse: object,
  afterMutationResponse: object
): Promise<void> {
  let callCount = 0
  await page.route("**/api/v1/me/progress-checkins*", (route: Route) => {
    if (route.request().method() === "GET") {
      const response = callCount === 0 ? initialResponse : afterMutationResponse
      callCount++
      route.fulfill({ status: 200, contentType: "application/json", json: response })
    } else {
      route.fallback()
    }
  })
}

export async function mockCreateStudentCheckin(page: Page, created: object): Promise<void> {
  await page.route("**/api/v1/me/progress-checkins", (route: Route) => {
    if (route.request().method() === "POST") {
      route.fulfill({ status: 201, contentType: "application/json", json: created })
    } else {
      route.fallback()
    }
  })
}

// =============================================================================
// Student Portal — Appointments & Training Schedules
// =============================================================================

export async function mockStudentMyAppointments(page: Page, response: object): Promise<void> {
  await page.route("**/api/v1/me/appointments*", (route: Route) => {
    if (route.request().method() === "GET") {
      route.fulfill({ status: 200, contentType: "application/json", json: response })
    } else {
      route.fallback()
    }
  })
}

export async function mockStudentTrainingSchedules(page: Page, schedules: object[]): Promise<void> {
  await page.route("**/api/v1/me/training-schedules*", (route: Route) => {
    if (route.request().method() === "GET") {
      route.fulfill({ status: 200, contentType: "application/json", json: schedules })
    } else {
      route.fallback()
    }
  })
}

// =============================================================================
// Admin
// =============================================================================

export async function injectMockAdminAuth(page: Page): Promise<void> {
  const ADMIN_USER = {
    id: "mock-admin-id",
    name: "Admin Test",
    email: "admin@coachos.com",
    role: "ADMIN",
    tenantId: "",
  }
  const now = Math.floor(Date.now() / 1000)
  await page.context().addCookies([
    {
      name: "coach_os_at",
      value: FAKE_ACCESS_TOKEN,
      domain: "localhost",
      path: "/",
      expires: now + 900,
    },
    {
      name: "coach_os_user",
      value: JSON.stringify(ADMIN_USER),
      domain: "localhost",
      path: "/",
      expires: now + 30 * 24 * 3600,
    },
  ])
}

export async function mockAdminStats(page: Page, stats: object): Promise<void> {
  await page.route("**/api/v1/admin/stats*", (route: Route) => {
    if (route.request().method() === "GET") {
      route.fulfill({ status: 200, contentType: "application/json", json: stats })
    } else {
      route.fallback()
    }
  })
}

export async function mockAdminPlans(page: Page, plans: object[]): Promise<void> {
  await page.route("**/api/v1/admin/plans*", (route: Route) => {
    if (route.request().method() === "GET") {
      route.fulfill({ status: 200, contentType: "application/json", json: plans })
    } else {
      route.fallback()
    }
  })
}

export async function mockAdminPlansStateful(
  page: Page,
  initial: object[],
  afterMutation: object[]
): Promise<void> {
  let callCount = 0
  await page.route("**/api/v1/admin/plans*", (route: Route) => {
    if (route.request().method() === "GET") {
      const response = callCount === 0 ? initial : afterMutation
      callCount++
      route.fulfill({ status: 200, contentType: "application/json", json: response })
    } else {
      route.fallback()
    }
  })
}

export async function mockAdminWhitelist(page: Page, coaches: object[]): Promise<void> {
  await page.route("**/api/v1/admin/whitelist*", (route: Route) => {
    if (route.request().method() === "GET") {
      route.fulfill({ status: 200, contentType: "application/json", json: coaches })
    } else {
      route.fallback()
    }
  })
}

export async function mockAdminAdmins(page: Page, admins: object[]): Promise<void> {
  await page.route("**/api/v1/admin", (route: Route) => {
    if (route.request().method() === "GET") {
      route.fulfill({ status: 200, contentType: "application/json", json: admins })
    } else {
      route.fallback()
    }
  })
}

export async function mockAdminTenants(page: Page, response: object): Promise<void> {
  await page.route("**/api/v1/admin/tenants*", (route: Route) => {
    const method = route.request().method()
    const url = route.request().url()
    const isListGet = method === "GET" && !url.match(/\/admin\/tenants\/[^/?]+(?:\?|$)/)
    if (isListGet) {
      route.fulfill({ status: 200, contentType: "application/json", json: response })
    } else {
      route.fallback()
    }
  })
}

// =============================================================================
// Onboarding / Tour Progress
// =============================================================================

/**
 * Mocks GET /profile/tour-progress returning the given completed pages array.
 */
export async function mockGetTourProgress(page: Page, completedPages: string[]): Promise<void> {
  await page.route("**/api/v1/profile/tour-progress*", (route: Route) => {
    if (route.request().method() === "GET") {
      route.fulfill({ status: 200, contentType: "application/json", json: completedPages })
    } else {
      route.fallback()
    }
  })
}

/**
 * Mocks POST /profile/tour-progress/:page returning the updated completed pages array.
 */
export async function mockMarkPageToured(page: Page, updatedPages: string[]): Promise<void> {
  await page.route("**/api/v1/profile/tour-progress/**", (route: Route) => {
    if (route.request().method() === "POST") {
      route.fulfill({ status: 200, contentType: "application/json", json: updatedPages })
    } else {
      route.fallback()
    }
  })
}

// =============================================================================
// Reschedule Appointment
// =============================================================================

export async function mockRescheduleAppointment(page: Page, response: object): Promise<void> {
  await page.route("**/api/v1/appointments/*/reschedule*", (route: Route) => {
    if (route.request().method() === "PATCH") {
      route.fulfill({ status: 200, contentType: "application/json", json: response })
    } else {
      route.fallback()
    }
  })
}

export async function mockRescheduleAppointmentConflict(
  page: Page,
  conflicts: object[],
): Promise<void> {
  await page.route("**/api/v1/appointments/*/reschedule*", (route: Route) => {
    if (route.request().method() === "PATCH") {
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

// =============================================================================
// Training Schedule Reschedule / Skip / Delete Exception
// =============================================================================

export async function mockRescheduleTraining(page: Page, response: object): Promise<void> {
  await page.route("**/api/v1/training-schedules/*/reschedule*", (route: Route) => {
    if (route.request().method() === "POST") {
      route.fulfill({ status: 201, contentType: "application/json", json: response })
    } else {
      route.fallback()
    }
  })
}

export async function mockRescheduleTrainingConflict(
  page: Page,
  conflicts: object[],
): Promise<void> {
  await page.route("**/api/v1/training-schedules/*/reschedule*", (route: Route) => {
    if (route.request().method() === "POST") {
      route.fulfill({
        status: 409,
        contentType: "application/json",
        json: {
          message: "Training reschedule has conflicts",
          conflicts,
        },
      })
    } else {
      route.fallback()
    }
  })
}

export async function mockSkipTraining(page: Page, response: object): Promise<void> {
  await page.route("**/api/v1/training-schedules/*/skip*", (route: Route) => {
    if (route.request().method() === "POST") {
      route.fulfill({ status: 201, contentType: "application/json", json: response })
    } else {
      route.fallback()
    }
  })
}

export async function mockDeleteTrainingException(page: Page): Promise<void> {
  await page.route("**/api/v1/training-schedule-exceptions/*", (route: Route) => {
    if (route.request().method() === "DELETE") {
      route.fulfill({ status: 204 })
    } else {
      route.fallback()
    }
  })
}

export async function mockGetAppointment(page: Page, appointment: object): Promise<void> {
  await page.route("**/api/v1/appointments/*", (route: Route) => {
    const url = route.request().url()
    if (route.request().method() === "GET" && !url.includes("reschedule")) {
      route.fulfill({ status: 200, contentType: "application/json", json: appointment })
    } else {
      route.fallback()
    }
  })
}
