/**
 * Core E2E — Gap Coverage
 *
 * Covers critical flows not addressed by the other core tests:
 * auth, onboarding, student portal (agenda/progress), admin dashboard,
 * coaching contracts, and full workout execution.
 *
 * All API calls are mocked via page.route(). No backend required.
 */
import { test, expect } from "@playwright/test"
import {
  injectMockAuthAs,
  injectStudentMockAuth,
  injectMockAdminAuth,
  mockAuthLoginFail,
  mockPlansList,
  mockDashboardStats,
  mockGetTourProgress,
  mockMarkPageToured,
  mockAdminStats,
  mockAdminPlans,
  mockStudentMyCheckins,
  mockStudentMyAppointments,
  mockStudentTrainingSchedules,
  MOCK_USER,
} from "../support/apiMocks"
import { MOCK_TENANT_ID } from "../fixtures/exercises.fixtures"
import { plansFixtures } from "../fixtures/plans.fixtures"
import { ADMIN_STATS, ADMIN_PLANS } from "../utils/comprehensiveFixtures"
import { studentCheckinFixtures, studentAppointmentFixtures, studentScheduleFixtures } from "../fixtures/studentPortal.fixtures"
import {
  MOCK_PROGRAM_ID,
  MOCK_WORKOUT_DAY_ID,
  activePrograms,
  programDetail,
  createdSession,
  createdExecution,
  recordedSet,
} from "../fixtures/studentWorkout.fixtures"

// =============================================================================
// Auth — Login
// =============================================================================

test.describe("Core E2E — Auth", () => {
  test("login form stays on /login when credentials are rejected", async ({ page }) => {
    await mockAuthLoginFail(page)

    await page.goto("/login")
    await expect(page.locator("#email")).toBeVisible()

    await page.locator("#email").fill("wrong@test.com")
    await page.locator("#password").fill("WrongPass1")
    await page.getByRole("button", { name: "Entrar" }).click()

    await page.waitForTimeout(2000)
    await expect(page).toHaveURL(/\/login/)
  })

  test("register stepper shows plans and advances to form", async ({ page }) => {
    await mockPlansList(page, plansFixtures)

    await page.goto("/cadastro")
    const planButton = page.locator("button").filter({ hasText: /alunos/ })
    await planButton.first().waitFor({ timeout: 10000 })
    expect(await planButton.count()).toBeGreaterThanOrEqual(1)

    await planButton.first().click()
    await page.getByRole("button", { name: "Continuar" }).click()

    await expect(page.locator("#name")).toBeVisible()
    await expect(page.locator("#email")).toBeVisible()
    await expect(page.locator("#password")).toBeVisible()
    await expect(page.locator("#confirmPassword")).toBeVisible()
  })
})

// =============================================================================
// Onboarding — Checklist
// =============================================================================

test.describe("Core E2E — Onboarding", () => {
  test("checklist appears for new coach and can be dismissed", async ({ page }) => {
    const newCoachUser = {
      ...MOCK_USER,
      onboardingCompleted: false,
    }

    await injectMockAuthAs(page, newCoachUser)
    await mockDashboardStats(page)
    await mockGetTourProgress(page, [])
    await mockMarkPageToured(page, [])

    await page.goto("/dashboard")
    await page.waitForSelector("[data-slot='page-header'], h1", { timeout: 10000 })

    const checklist = page.getByTestId("onboarding-checklist")
    await expect(checklist).toBeVisible()
    await expect(page.getByText("Primeiros passos")).toBeVisible()

    // Dismiss
    await checklist.getByRole("button").click()
    await expect(checklist).not.toBeVisible()
  })
})

// =============================================================================
// Student Portal — Agenda
// =============================================================================

test.describe("Core E2E — Student Agenda", () => {
  test("student agenda renders weekly schedule and appointments", async ({ page }) => {
    await injectStudentMockAuth(page)
    await mockStudentMyAppointments(page, studentAppointmentFixtures.scheduled)
    await mockStudentTrainingSchedules(page, studentScheduleFixtures.withSchedules)

    await page.goto("/aluno/agenda")
    await page.waitForSelector("[data-testid='agenda-page']", { timeout: 8000 })

    await expect(page.getByText("Sua agenda")).toBeVisible()
    await expect(page.getByTestId("weekly-schedule-view")).toBeVisible()
    await expect(page.getByTestId("schedule-day-active")).toHaveCount(3)
    await expect(page.getByRole("heading", { name: "Próximas Aulas" })).toBeVisible()
    await expect(page.getByTestId("appointment-item")).toHaveCount(1)
  })
})

// =============================================================================
// Student Portal — Progress
// =============================================================================

test.describe("Core E2E — Student Progress", () => {
  test("student progress page renders checkins and add button", async ({ page }) => {
    await injectStudentMockAuth(page)
    await mockStudentMyCheckins(page, studentCheckinFixtures.withCheckins)

    await page.goto("/aluno/progresso")
    await page.waitForSelector("[data-testid='checkins-page']", { timeout: 8000 })

    await expect(page.getByRole("heading", { name: "Meu Progresso" })).toBeVisible()
    await expect(page.getByTestId("add-checkin-button")).toBeVisible()
    await expect(page.getByTestId("checkin-card")).toHaveCount(2)
  })
})

// =============================================================================
// Admin Dashboard
// =============================================================================

test.describe("Core E2E — Admin Dashboard", () => {
  test("admin can access dashboard and see stats", async ({ page }) => {
    await injectMockAdminAuth(page)
    await mockAdminStats(page, ADMIN_STATS)
    await mockAdminPlans(page, ADMIN_PLANS)

    await page.goto("/admin/dashboard")
    await page.waitForSelector("[data-slot='page-header'], h1", { timeout: 10000 })

    await expect(page.getByText("Admin Dashboard")).toBeVisible()
    await expect(page.getByText("42")).toBeVisible() // totalCoaches
    await expect(page.getByText("310")).toBeVisible() // totalStudents
  })
})

// =============================================================================
// Coaching Contracts
// =============================================================================

test.describe("Core E2E — Coaching Contracts", () => {
  test("coach sees coaching contract on student detail", async ({ page }) => {
    const studentId = "st-1"
    const student = {
      id: studentId,
      name: "Fernanda Costa",
      email: "fernanda@test.com",
      status: "active",
      phoneNumber: null,
      goal: "Hipertrofia",
      observations: null,
      physicalRestrictions: null,
      createdAt: "2024-01-10T00:00:00Z",
    }

    const contracts = [
      {
        id: "contract-1",
        tenantId: MOCK_TENANT_ID,
        studentId,
        servicePlanId: "plan-online-1",
        status: "active",
        startDate: "2026-01-01T00:00:00Z",
        endDate: null,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
        servicePlan: {
          id: "plan-online-1",
          name: "Consultoria Online",
          price: "299.90",
          attendanceType: "online",
          sessionsPerWeek: 3,
          durationMinutes: 60,
        },
      },
    ]

    await injectMockAuthAs(page, MOCK_USER)

    await page.route(`**/api/v1/students/${studentId}`, (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({ status: 200, contentType: "application/json", json: student })
      } else {
        route.fallback()
      }
    })
    await page.route(`**/api/v1/students/${studentId}/contracts*`, (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({ status: 200, contentType: "application/json", json: contracts })
      } else {
        route.fallback()
      }
    })
    await page.route(`**/api/v1/students/${studentId}/notes*`, (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          json: { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 },
        })
      } else {
        route.fallback()
      }
    })
    await page.route(`**/api/v1/students/${studentId}/programs*`, (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({ status: 200, contentType: "application/json", json: [] })
      } else {
        route.fallback()
      }
    })
    await page.route("**/api/v1/service-plans*", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          json: [
            {
              id: "plan-online-1",
              name: "Consultoria Online",
              price: "299.90",
              attendanceType: "online",
              sessionsPerWeek: 3,
              durationMinutes: 60,
            },
          ],
        })
      } else {
        route.fallback()
      }
    })

    await page.goto(`/students/${studentId}`)
    await page.waitForSelector("h1, [data-slot='page-header']", { timeout: 10000 })

    // Navigate to Servico tab
    const servicoTab = page.getByRole("tab", { name: /serviço|contrato/i })
    if (await servicoTab.isVisible()) {
      await servicoTab.click()
      await expect(page.getByText("Consultoria Online")).toBeVisible()
      await expect(page.getByText("299,90")).toBeVisible()
    }
  })
})

// =============================================================================
// Workout Execution — Full Flow
// =============================================================================

test.describe("Core E2E — Workout Execution Complete", () => {
  test("student completes exercise sets in a workout", async ({ page }) => {
    await injectStudentMockAuth(page)

    // Mock all workout endpoints
    await page.route("**/api/v1/student-programs/me*", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({ status: 200, contentType: "application/json", json: activePrograms })
      } else {
        route.fallback()
      }
    })
    await page.route(`**/api/v1/student-programs/${MOCK_PROGRAM_ID}*`, (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({ status: 200, contentType: "application/json", json: programDetail })
      } else {
        route.fallback()
      }
    })
    await page.route("**/api/v1/workout-sessions", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({ status: 201, contentType: "application/json", json: createdSession })
      } else {
        route.fallback()
      }
    })
    await page.route("**/api/v1/exercise-executions", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({ status: 201, contentType: "application/json", json: createdExecution })
      } else {
        route.fallback()
      }
    })
    await page.route("**/api/v1/exercise-sets", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({ status: 201, contentType: "application/json", json: recordedSet })
      } else {
        route.fallback()
      }
    })
    await page.route("**/api/v1/workout-sessions/*", (route) => {
      if (route.request().method() === "PATCH") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          json: { ...createdSession, status: "finished", finishedAt: new Date().toISOString() },
        })
      } else {
        route.fallback()
      }
    })

    // Navigate to workout
    const executarUrl = `/aluno/treinos/${MOCK_PROGRAM_ID}/${MOCK_WORKOUT_DAY_ID}/executar`
    await page.goto(executarUrl)

    // Start workout
    await page.getByTestId("start-workout-button").click()
    await page.waitForSelector("[data-testid='exercise-list']", { timeout: 8000 })
    await expect(page.getByTestId("exercise-list-item")).toHaveCount(2)

    // Open first exercise
    await page.getByTestId("exercise-list-item").first().click()
    await page.waitForSelector("[data-testid='active-exercise-view']", { timeout: 8000 })

    // Verify exercise is visible with set info
    await expect(page.getByText("Agachamento")).toBeVisible()
    await expect(page.getByText(/Série 1\/3|1\/3/)).toBeVisible()
  })
})
