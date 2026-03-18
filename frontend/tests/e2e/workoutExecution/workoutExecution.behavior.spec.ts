/**
 * Workout Execution — Behavioral Tests
 *
 * All API calls are mocked via page.route(). No backend required.
 *
 * Coverage:
 * - Programs list page: display, empty state, navigation
 * - Execution page: idle state, start session, exercise expansion, set recording
 * - Workout completion screen
 * - Mobile viewport
 *
 * API patterns used by studentPortalProgramsService and workoutExecutionService:
 * - GET  /student-programs/me          → list active programs for the logged-in student
 * - GET  /student-programs/:id         → get program detail with workout days + exercises
 * - POST /workout-sessions             → start a workout session
 * - PATCH /workout-sessions/:id/finish → finish a session
 * - POST /exercise-executions          → create an exercise execution (on card expand)
 * - POST /exercise-sets                → record a single set
 *
 * Response format: the backend BuildResponseInterceptor returns `params?.data || params`.
 * Mock responses should return the plain object directly (no { data: ... } wrapper).
 * The axios `.data` accessor gets whatever the interceptor returned.
 */
import { test, expect } from "@playwright/test"
import {
  MOCK_PROGRAM_ID,
  MOCK_WORKOUT_DAY_ID,
  activePrograms,
  emptyPrograms,
  programDetail,
  createdSession,
  createdExecution,
  recordedSet,
} from "../fixtures/studentWorkout.fixtures"
import { injectStudentMockAuth } from "../support/apiMocks"

const TREINOS_URL = "/aluno/treinos"
const EXECUTAR_URL = `/aluno/treinos/${MOCK_PROGRAM_ID}/${MOCK_WORKOUT_DAY_ID}/executar`

// =============================================================================
// Shared setup helpers
// =============================================================================

async function mockActivePrograms(page: import("@playwright/test").Page) {
  await page.route("**/api/v1/student-programs/me*", (route) => {
    if (route.request().method() === "GET") {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        json: activePrograms,
      })
    } else {
      route.continue()
    }
  })
}

async function mockProgramDetail(page: import("@playwright/test").Page) {
  await page.route(`**/api/v1/student-programs/${MOCK_PROGRAM_ID}*`, (route) => {
    if (route.request().method() === "GET") {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        json: programDetail,
      })
    } else {
      route.continue()
    }
  })
}

async function mockStartSession(page: import("@playwright/test").Page) {
  await page.route("**/api/v1/workout-sessions", (route) => {
    if (route.request().method() === "POST") {
      route.fulfill({
        status: 201,
        contentType: "application/json",
        json: createdSession,
      })
    } else {
      route.continue()
    }
  })
}

async function mockCreateExecution(page: import("@playwright/test").Page) {
  await page.route("**/api/v1/exercise-executions", (route) => {
    if (route.request().method() === "POST") {
      route.fulfill({
        status: 201,
        contentType: "application/json",
        json: createdExecution,
      })
    } else {
      route.continue()
    }
  })
}

async function mockRecordSet(page: import("@playwright/test").Page) {
  await page.route("**/api/v1/exercise-sets", (route) => {
    if (route.request().method() === "POST") {
      route.fulfill({
        status: 201,
        contentType: "application/json",
        json: recordedSet,
      })
    } else {
      route.continue()
    }
  })
}

// =============================================================================
// Programs list page
// =============================================================================

test.describe("Workout Portal — Programs List", () => {
  test.beforeEach(async ({ page }) => {
    await injectStudentMockAuth(page)
  })

  test("displays active programs list with program card", async ({ page }) => {
    await mockActivePrograms(page)
    await mockProgramDetail(page)

    await page.goto(TREINOS_URL)
    await page.waitForSelector("[data-testid='programs-list']", { timeout: 8000 })

    await expect(page.getByTestId("programs-list")).toBeVisible()
    await expect(page.getByTestId("program-card")).toBeVisible()
    await expect(page.getByText("Programa de Hipertrofia")).toBeVisible()
  })

  test("displays workout day links inside the program card", async ({ page }) => {
    await mockActivePrograms(page)
    await mockProgramDetail(page)

    await page.goto(TREINOS_URL)
    await page.waitForSelector("[data-testid='workout-day-link']", { timeout: 8000 })

    // Fixture has 1 workout day
    await expect(page.getByTestId("workout-day-link")).toHaveCount(1)
    await expect(page.getByText("Treino A — Pernas")).toBeVisible()
  })

  test("displays empty state when student has no active programs", async ({ page }) => {
    await page.route("**/api/v1/student-programs/me*", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          json: emptyPrograms,
        })
      } else {
        route.continue()
      }
    })

    await page.goto(TREINOS_URL)
    await page.waitForLoadState("networkidle")

    await expect(page.getByText("Nenhum programa ativo")).toBeVisible()
  })

  test("clicking workout day link navigates to execution page", async ({ page }) => {
    await mockActivePrograms(page)
    await mockProgramDetail(page)

    await page.goto(TREINOS_URL)
    await page.waitForSelector("[data-testid='workout-day-link']", { timeout: 8000 })

    await page.getByTestId("workout-day-link").first().click()

    await expect(page).toHaveURL(
      new RegExp(`/aluno/treinos/${MOCK_PROGRAM_ID}/${MOCK_WORKOUT_DAY_ID}/executar`)
    )
  })
})

// =============================================================================
// Execution page — idle state
// =============================================================================

test.describe("Workout Execution — Idle State", () => {
  test.beforeEach(async ({ page }) => {
    await injectStudentMockAuth(page)
  })

  test("shows exercises preview and start button in idle state", async ({ page }) => {
    await mockProgramDetail(page)

    await page.goto(EXECUTAR_URL)
    await page.waitForSelector("[data-testid='exercises-preview']", { timeout: 8000 })

    await expect(page.getByTestId("exercises-preview")).toBeVisible()
    await expect(page.getByTestId("start-workout-button")).toBeVisible()
    await expect(page.getByText("Iniciar Treino")).toBeVisible()
  })

  test("shows all exercises from the workout day in idle state", async ({ page }) => {
    await mockProgramDetail(page)

    await page.goto(EXECUTAR_URL)
    await page.waitForSelector("[data-testid='exercise-preview-item']", { timeout: 8000 })

    // Fixture has 2 exercises
    await expect(page.getByTestId("exercise-preview-item")).toHaveCount(2)
    await expect(page.getByText("Agachamento")).toBeVisible()
    await expect(page.getByText("Leg Press")).toBeVisible()
  })

  test("displays workout day name in the header", async ({ page }) => {
    await mockProgramDetail(page)

    await page.goto(EXECUTAR_URL)
    await page.waitForLoadState("networkidle")

    await expect(page.getByText("Treino A — Pernas")).toBeVisible()
  })
})

// =============================================================================
// Execution page — started state
// =============================================================================

test.describe("Workout Execution — Started State", () => {
  test.beforeEach(async ({ page }) => {
    await injectStudentMockAuth(page)
    await mockProgramDetail(page)
    await mockStartSession(page)
  })

  test("clicking 'Iniciar Treino' transitions to started state", async ({ page }) => {
    await page.goto(EXECUTAR_URL)
    await page.waitForSelector("[data-testid='start-workout-button']", { timeout: 8000 })

    await page.getByTestId("start-workout-button").click()

    await page.waitForSelector("[data-testid='exercises-execution']", { timeout: 8000 })
    await expect(page.getByTestId("exercises-execution")).toBeVisible()
    await expect(page.getByTestId("finish-workout-button")).toBeVisible()
  })

  test("started state shows exercise execution cards", async ({ page }) => {
    await page.goto(EXECUTAR_URL)
    await page.waitForSelector("[data-testid='start-workout-button']", { timeout: 8000 })

    await page.getByTestId("start-workout-button").click()

    await page.waitForSelector("[data-testid='exercise-execution-card']", { timeout: 8000 })

    // Fixture has 2 exercises
    await expect(page.getByTestId("exercise-execution-card")).toHaveCount(2)
  })

  test("start button is not visible after workout starts", async ({ page }) => {
    await page.goto(EXECUTAR_URL)
    await page.waitForSelector("[data-testid='start-workout-button']", { timeout: 8000 })

    await page.getByTestId("start-workout-button").click()

    await page.waitForSelector("[data-testid='exercises-execution']", { timeout: 8000 })
    await expect(page.getByTestId("start-workout-button")).not.toBeVisible()
  })
})

// =============================================================================
// Execution page — exercise card interaction
// =============================================================================

test.describe("Workout Execution — Exercise Card", () => {
  test.beforeEach(async ({ page }) => {
    await injectStudentMockAuth(page)
    await mockProgramDetail(page)
    await mockStartSession(page)
  })

  test("expanding an exercise card creates an execution and shows set rows", async ({
    page,
  }) => {
    await mockCreateExecution(page)

    await page.goto(EXECUTAR_URL)
    await page.waitForSelector("[data-testid='start-workout-button']", { timeout: 8000 })
    await page.getByTestId("start-workout-button").click()
    await page.waitForSelector("[data-testid='exercise-execution-card']", { timeout: 8000 })

    // Click the first exercise card header to expand it
    await page
      .getByTestId("exercise-execution-card")
      .first()
      .locator("button")
      .first()
      .click()

    // Set rows appear after expansion
    await page.waitForSelector("[data-testid='set-row-1']", { timeout: 5000 })
    await expect(page.getByTestId("set-row-1")).toBeVisible()
    await expect(page.getByTestId("reps-input-1")).toBeVisible()
    await expect(page.getByTestId("weight-input-1")).toBeVisible()
    await expect(page.getByTestId("complete-set-1")).toBeVisible()
  })

  test("completing a set marks it as done", async ({ page }) => {
    await mockCreateExecution(page)
    await mockRecordSet(page)

    await page.goto(EXECUTAR_URL)
    await page.waitForSelector("[data-testid='start-workout-button']", { timeout: 8000 })
    await page.getByTestId("start-workout-button").click()
    await page.waitForSelector("[data-testid='exercise-execution-card']", { timeout: 8000 })

    // Expand first exercise card
    await page
      .getByTestId("exercise-execution-card")
      .first()
      .locator("button")
      .first()
      .click()

    await page.waitForSelector("[data-testid='complete-set-1']", { timeout: 5000 })

    // Click complete for set 1
    await page.getByTestId("complete-set-1").click()

    // After completing, the complete button for set 1 becomes disabled
    await expect(page.getByTestId("complete-set-1")).toBeDisabled()
  })
})

// =============================================================================
// Execution page — finish workout
// =============================================================================

test.describe("Workout Execution — Finish", () => {
  test.beforeEach(async ({ page }) => {
    await injectStudentMockAuth(page)
    await mockProgramDetail(page)
    await mockStartSession(page)
  })

  test("clicking 'Finalizar Treino' shows the completion screen", async ({ page }) => {
    await page.route(
      `**/api/v1/workout-sessions/${createdSession.id}/finish*`,
      (route) => {
        if (route.request().method() === "PATCH") {
          route.fulfill({
            status: 200,
            contentType: "application/json",
            json: { id: createdSession.id, status: "finished" },
          })
        } else {
          route.continue()
        }
      }
    )

    await page.goto(EXECUTAR_URL)
    await page.waitForSelector("[data-testid='start-workout-button']", { timeout: 8000 })
    await page.getByTestId("start-workout-button").click()
    await page.waitForSelector("[data-testid='finish-workout-button']", { timeout: 8000 })

    await page.getByTestId("finish-workout-button").click()

    await page.waitForSelector("[data-testid='completion-screen']", { timeout: 8000 })
    await expect(page.getByTestId("completion-screen")).toBeVisible()
    await expect(page.getByText("Treino concluído!")).toBeVisible()
  })

  test("completion screen has a link back to /aluno/treinos", async ({ page }) => {
    await page.route(
      `**/api/v1/workout-sessions/${createdSession.id}/finish*`,
      (route) => {
        if (route.request().method() === "PATCH") {
          route.fulfill({
            status: 200,
            contentType: "application/json",
            json: { id: createdSession.id, status: "finished" },
          })
        } else {
          route.continue()
        }
      }
    )

    await page.goto(EXECUTAR_URL)
    await page.waitForSelector("[data-testid='start-workout-button']", { timeout: 8000 })
    await page.getByTestId("start-workout-button").click()
    await page.waitForSelector("[data-testid='finish-workout-button']", { timeout: 8000 })
    await page.getByTestId("finish-workout-button").click()

    await page.waitForSelector("[data-testid='completion-screen']", { timeout: 8000 })
    await expect(page.getByRole("link", { name: "Voltar aos treinos" })).toBeVisible()
  })
})

// =============================================================================
// Mobile viewport
// =============================================================================

test.describe("Workout Portal — Mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test("programs list renders correctly on mobile (390px)", async ({ page }) => {
    await injectStudentMockAuth(page)
    await mockActivePrograms(page)
    await mockProgramDetail(page)

    await page.goto(TREINOS_URL)
    await page.waitForSelector("[data-testid='programs-list']", { timeout: 8000 })

    await expect(page.getByTestId("programs-list")).toBeVisible()
    await expect(page.getByTestId("program-card")).toBeVisible()

    // No horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(390)
  })

  test("execution page renders correctly on mobile (390px)", async ({ page }) => {
    await injectStudentMockAuth(page)
    await mockProgramDetail(page)

    await page.goto(EXECUTAR_URL)
    await page.waitForSelector("[data-testid='start-workout-button']", { timeout: 8000 })

    await expect(page.getByTestId("exercises-preview")).toBeVisible()
    await expect(page.getByTestId("start-workout-button")).toBeVisible()

    // No horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(390)
  })
})
